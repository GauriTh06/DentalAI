"""
database.py — Dual-mode database layer (PostgreSQL Neon primary, In-memory fallback)
=============================================================================
• Primary:  PostgreSQL/Neon via asyncpg (production)
• Fallback:  In-memory store (development/demo — no database needed)
"""
import logging
import uuid
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from backend.app.config import settings

logger = logging.getLogger("dentalai_db")

class FakeObjectId(str):
    """String-based ID that behaves like bson.ObjectId for our purposes."""
    pass

def new_id():
    return FakeObjectId(str(uuid.uuid4()).replace("-", "")[:24])

# ─────────────────────────────────────────────────────────────────────
# JSON custom serialization helpers
# ─────────────────────────────────────────────────────────────────────
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (ObjectId, FakeObjectId)):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def deserialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    
    def _restore(v, key=None):
        if isinstance(v, str):
            # Check if it's an ISO datetime string
            if len(v) >= 19 and v[4] == '-' and v[7] == '-' and v[10] == 'T':
                try:
                    return datetime.fromisoformat(v)
                except ValueError:
                    pass
            # Check if ID field
            if key in ("_id", "patient_id", "user_id", "scan_id") and len(v) == 24:
                try:
                    return ObjectId(v)
                except Exception:
                    pass
        elif isinstance(v, dict):
            return {k: _restore(val, k) for k, val in v.items()}
        elif isinstance(v, list):
            return [_restore(item, key) for item in v]
        return v

    return _restore(doc)

# ─────────────────────────────────────────────────────────────────────
# MongoDB query compiler for Postgres JSONB
# ─────────────────────────────────────────────────────────────────────
def compile_query(query: dict, start_param_idx: int = 1) -> tuple[str, list, int]:
    if not query:
        return "", [], start_param_idx
    
    conditions = []
    params = []
    param_idx = start_param_idx
    
    for key, val in query.items():
        if key == "_id":
            field_sql = "id"
        else:
            parts = key.split('.')
            if len(parts) == 1:
                field_sql = f"data->>'{parts[0]}'"
            else:
                json_path = " -> ".join(f"'{p}'" for p in parts[:-1])
                field_sql = f"data -> {json_path} ->> '{parts[-1]}'"
        
        # Check if val is an operator dict
        if isinstance(val, dict):
            for op, op_val in val.items():
                if op == "$ne":
                    conditions.append(f"{field_sql} != ${param_idx}")
                    params.append(str(op_val) if op_val is not None else None)
                    param_idx += 1
                elif op == "$in":
                    conditions.append(f"{field_sql} = ANY(${param_idx})")
                    params.append([str(x) for x in op_val])
                    param_idx += 1
                else:
                    raise NotImplementedError(f"Operator {op} not implemented")
        else:
            if val is None:
                conditions.append(f"{field_sql} IS NULL")
            else:
                conditions.append(f"{field_sql} = ${param_idx}")
                params.append(str(val))
                param_idx += 1
                
    return " AND ".join(conditions), params, param_idx

# ─────────────────────────────────────────────────────────────────────
# Postgres Collection & Cursor mimicking Motor (Async MongoDB Driver)
# ─────────────────────────────────────────────────────────────────────
class PostgresCursor:
    def __init__(self, collection, query: dict = None, sort: list = None, limit: int = 0):
        self.collection = collection
        self.query = query or {}
        self._sort = sort
        self._limit = limit

    def sort(self, field_or_list, direction=None):
        if direction is not None:
            self._sort = [(field_or_list, direction)]
        else:
            self._sort = field_or_list
        return self

    def limit(self, value: int):
        self._limit = value
        return self

    async def to_list(self, length: int = None):
        limit = length or self._limit
        return await self.collection._execute_find(self.query, self._sort, limit)

    def __aiter__(self):
        self._items = None
        self._index = 0
        return self

    async def __anext__(self):
        if self._items is None:
            self._items = await self.to_list()
        if self._index >= len(self._items):
            raise StopAsyncIteration
        item = self._items[self._index]
        self._index += 1
        return item


class PostgresCollection:
    def __init__(self, pool, name: str):
        self.pool = pool
        self.name = name

    async def create_index(self, field: str, unique: bool = False):
        idx_name = f"idx_{self.name}_{field.replace('.', '_')}"
        
        parts = field.split('.')
        if len(parts) == 1:
            field_sql = f"data->>'{parts[0]}'"
        else:
            json_path = " -> ".join(f"'{p}'" for p in parts[:-1])
            field_sql = f"data -> {json_path} ->> '{parts[-1]}'"
            
        unique_clause = "UNIQUE" if unique else ""
        sql = f"CREATE {unique_clause} INDEX IF NOT EXISTS {idx_name} ON {self.name} (({field_sql}))"
        await self.pool.execute(sql)

    async def insert_one(self, document: dict):
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        
        inserted_id = doc["_id"]
        doc_id = str(inserted_id)
        doc_json = json.dumps(doc, cls=MongoJSONEncoder)
        
        try:
            sql = f"INSERT INTO {self.name} (id, data) VALUES ($1, $2::jsonb)"
            await self.pool.execute(sql, doc_id, doc_json)
        except Exception as e:
            if "UniqueViolation" in type(e).__name__:
                class DuplicateKeyError(Exception):
                    details = {"keyValue": {"email": doc.get("email")}}
                raise DuplicateKeyError(f"Duplicate key error: {e}")
            raise e
            
        class InsertResult:
            inserted_id = doc["_id"]
        return InsertResult()

    async def find_one(self, query: dict = None, sort: list = None) -> Optional[dict]:
        query = query or {}
        where_clause, params, next_idx = compile_query(query, start_param_idx=1)
        
        sort_sql = ""
        if sort:
            sort_parts = []
            for field, direction in sort:
                dir_str = "DESC" if direction == -1 else "ASC"
                sort_parts.append(f"data->>'{field}' {dir_str}")
            sort_sql = "ORDER BY " + ", ".join(sort_parts)
            
        sql = f"SELECT data FROM {self.name}"
        if where_clause:
            sql += f" WHERE {where_clause}"
        if sort_sql:
            sql += f" {sort_sql}"
        sql += " LIMIT 1"
        
        row = await self.pool.fetchrow(sql, *params)
        if not row:
            return None
        return deserialize_doc(json.loads(row["data"]))

    async def count_documents(self, query: dict = None) -> int:
        query = query or {}
        where_clause, params, _ = compile_query(query, start_param_idx=1)
        sql = f"SELECT COUNT(*) FROM {self.name}"
        if where_clause:
            sql += f" WHERE {where_clause}"
        val = await self.pool.fetchval(sql, *params)
        return val

    def find(self, query: dict = None, sort: list = None, limit: int = 0):
        return PostgresCursor(self, query, sort, limit)

    async def _execute_find(self, query, sort, limit):
        where_clause, params, _ = compile_query(query, start_param_idx=1)
        
        sort_sql = ""
        if sort:
            if isinstance(sort, str):
                sort = [(sort, 1)]
            elif isinstance(sort, tuple):
                sort = [sort]
                
            sort_parts = []
            for field, direction in sort:
                dir_str = "DESC" if direction == -1 else "ASC"
                sort_parts.append(f"data->>'{field}' {dir_str}")
            sort_sql = "ORDER BY " + ", ".join(sort_parts)
            
        limit_sql = f"LIMIT {limit}" if limit else ""
        
        sql = f"SELECT data FROM {self.name}"
        if where_clause:
            sql += f" WHERE {where_clause}"
        if sort_sql:
            sql += f" {sort_sql}"
        if limit_sql:
            sql += f" {limit_sql}"
            
        rows = await self.pool.fetch(sql, *params)
        return [deserialize_doc(json.loads(row["data"])) for row in rows]

    async def update_one(self, query: dict, update: dict, upsert: bool = False):
        where_clause, params, next_idx = compile_query(query, start_param_idx=1)
        set_data = update.get("$set", {}) if update else {}
        
        sql = f"UPDATE {self.name} SET data = data || ${next_idx}::jsonb"
        if where_clause:
            sql += f" WHERE {where_clause}"
            
        params.append(json.dumps(set_data, cls=MongoJSONEncoder))
        status = await self.pool.execute(sql, *params)
        
        if upsert and status == "UPDATE 0":
            new_doc = {**query, **set_data}
            await self.insert_one(new_doc)

    async def delete_one(self, query: dict):
        where_clause, params, _ = compile_query(query, start_param_idx=1)
        if not where_clause:
            return
        sql = f"DELETE FROM {self.name} WHERE id IN (SELECT id FROM {self.name} WHERE {where_clause} LIMIT 1)"
        await self.pool.execute(sql, *params)

    async def count_documents(self, query: dict = None) -> int:
        query = query or {}
        where_clause, params, _ = compile_query(query, start_param_idx=1)
        
        sql = f"SELECT COUNT(*) FROM {self.name}"
        if where_clause:
            sql += f" WHERE {where_clause}"
            
        count = await self.pool.fetchval(sql, *params)
        return count or 0

    async def aggregate(self, pipeline: list):
        if pipeline and "$group" in pipeline[0]:
            group_op = pipeline[0]["$group"]
            if "avg_score" in group_op and "$avg" in group_op["avg_score"]:
                avg_field = group_op["avg_score"]["$avg"].replace("$", "")
                sql = f"SELECT AVG((data->>'{avg_field}')::numeric) as avg_score FROM {self.name}"
                val = await self.pool.fetchval(sql)
                avg_val = float(val) if val is not None else 82.5
                
                class FakeAggregateCursor:
                    async def to_list(self, length=None):
                        return [{"avg_score": avg_val}]
                return FakeAggregateCursor()
                
        class EmptyCursor:
            async def to_list(self, length=None):
                return []
        return EmptyCursor()


# ─────────────────────────────────────────────────────────────────────
# In-Memory Collection (mimics Motor's async API subset we actually use)
# ─────────────────────────────────────────────────────────────────────
class InMemoryCollection:
    """Async-compatible in-memory collection mimicking Motor's interface."""

    def __init__(self, name: str):
        self.name = name
        self._docs: Dict[str, dict] = {}
        self._unique_fields: List[str] = []

    def _match(self, doc: dict, query: dict) -> bool:
        for k, v in query.items():
            if k == "_id":
                if str(doc.get("_id")) != str(v):
                    return False
            elif doc.get(k) != v:
                return False
        return True

    async def create_index(self, field: str, unique: bool = False):
        if unique and field not in self._unique_fields:
            self._unique_fields.append(field)

    async def insert_one(self, document: dict):
        for field in self._unique_fields:
            if field in document:
                for existing in self._docs.values():
                    if existing.get(field) == document[field]:
                        class DuplicateKeyError(Exception):
                            details = {"keyValue": {field: document[field]}}
                        raise DuplicateKeyError(f"Duplicate key: {field}")

        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = new_id()
        self._docs[str(doc["_id"])] = doc

        class InsertResult:
            inserted_id = doc["_id"]
        return InsertResult()

    async def find_one(self, query: dict = None, sort: list = None) -> Optional[dict]:
        query = query or {}
        results = [d for d in self._docs.values() if self._match(d, query)]
        if sort:
            field, direction = sort[0]
            results.sort(key=lambda d: d.get(field, datetime.min), reverse=(direction == -1))
        return dict(results[0]) if results else None

    async def count_documents(self, query: dict = None) -> int:
        query = query or {}
        return sum(1 for d in self._docs.values() if self._match(d, query))

    def find(self, query: dict = None, sort: list = None, limit: int = 0):
        query = query or {}
        results = [dict(d) for d in self._docs.values() if self._match(d, query)]
        if sort:
            field, direction = sort[0]
            results.sort(key=lambda d: d.get(field, datetime.min), reverse=(direction == -1))
        if limit:
            results = results[:limit]

        class FakeCursor:
            def __init__(self, docs):
                self._docs = docs
            async def to_list(self, length=None):
                return self._docs[:length] if length else self._docs
            def __aiter__(self):
                return self
            async def __anext__(self):
                if not self._docs:
                    raise StopAsyncIteration
                return self._docs.pop(0)

        return FakeCursor(results)

    async def update_one(self, query: dict, update: dict, upsert: bool = False):
        for key, doc in self._docs.items():
            if self._match(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                return
        if upsert:
            new_doc = {**query, **(update.get("$set", {}))}
            await self.insert_one(new_doc)

    async def delete_one(self, query: dict):
        for key, doc in list(self._docs.items()):
            if self._match(doc, query):
                del self._docs[key]
                return

    async def count_documents(self, query: dict = None) -> int:
        query = query or {}
        return sum(1 for d in self._docs.values() if self._match(d, query))

    async def aggregate(self, pipeline: list) -> list:
        docs = list(self._docs.values())
        return docs


class InMemoryDB:
    def __getitem__(self, name: str) -> InMemoryCollection:
        if not hasattr(self, f"_col_{name}"):
            setattr(self, f"_col_{name}", InMemoryCollection(name))
        return getattr(self, f"_col_{name}")


# ─────────────────────────────────────────────────────────────────────
# Database class
# ─────────────────────────────────────────────────────────────────────
class Database:
    client = None
    db = None
    is_mock: bool = False

    users         = None
    scans         = None
    health_scores = None
    reports       = None
    chat_history  = None

db_instance = Database()


async def connect_to_mongo():
    logger.info("Connecting to PostgreSQL/Neon...")
    try:
        import asyncpg
        from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

        # Strip params asyncpg doesn't understand (e.g. channel_binding)
        parsed = urlparse(settings.DATABASE_URL)
        qs = parse_qs(parsed.query, keep_blank_values=True)
        qs.pop("channel_binding", None)          # asyncpg handles SCRAM natively
        clean_dsn = urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))

        pool = await asyncpg.create_pool(
            clean_dsn,
            min_size=1,
            max_size=10,
            timeout=30.0,          # generous timeout — TF models load concurrently
            command_timeout=60.0,
        )
        
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
            
            tables = ["users", "scans", "health_scores", "reports", "chat_history"]
            for table in tables:
                await conn.execute(f"""
                    CREATE TABLE IF NOT EXISTS {table} (
                        id TEXT PRIMARY KEY,
                        data JSONB NOT NULL
                    )
                """)
        
        db_instance.client = pool
        db_instance.is_mock = False
        
        db_instance.users         = PostgresCollection(pool, "users")
        db_instance.scans         = PostgresCollection(pool, "scans")
        db_instance.health_scores = PostgresCollection(pool, "health_scores")
        db_instance.reports       = PostgresCollection(pool, "reports")
        db_instance.chat_history  = PostgresCollection(pool, "chat_history")
        
        await db_instance.users.create_index("email", unique=True)
        logger.info("✅ Connected to PostgreSQL/Neon successfully!")
        
    except Exception as e:
        logger.warning(
            "⚠️  PostgreSQL/Neon unavailable (%s). Switching to in-memory store "
            "(data will NOT persist across restarts).", e
        )
        _init_memory_db()


def _init_memory_db():
    """Initialise the in-memory fallback collections."""
    mock_db = InMemoryDB()
    db_instance.is_mock   = True
    db_instance.users         = mock_db["users"]
    db_instance.scans         = mock_db["scans"]
    db_instance.health_scores = mock_db["health_scores"]
    db_instance.reports       = mock_db["reports"]
    db_instance.chat_history  = mock_db["chat_history"]
    logger.info("📦 In-memory database initialised.")


async def close_mongo_connection():
    if db_instance.client and not db_instance.is_mock:
        await db_instance.client.close()
        logger.info("PostgreSQL connection closed.")
