import asyncio, asyncpg
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

DATABASE_URL = (
    "postgresql://neondb_owner:npg_P2CTAtoxjJ8p@"
    "ep-rapid-math-ad7uks8f-pooler.c-2.us-east-1.aws.neon.tech"
    "/neondb?sslmode=require&channel_binding=require"
)

# Apply same fix as database.py
parsed = urlparse(DATABASE_URL)
qs = parse_qs(parsed.query, keep_blank_values=True)
qs.pop("channel_binding", None)
clean_dsn = urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))

REQUIRED_TABLES = ["users", "scans", "health_scores", "reports", "chat_history"]

async def main():
    print("=" * 55)
    print("  DentalPro — Neon PostgreSQL DB Check")
    print("=" * 55)

    pool = await asyncpg.create_pool(clean_dsn, min_size=1, max_size=2, timeout=30.0)
    async with pool.acquire() as conn:
        ver = await conn.fetchval("SELECT version()")
        print(f"\n[OK] Connected: {ver[:65]}\n")

        # List all public tables
        rows = await conn.fetch(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        )
        existing = {r["tablename"] for r in rows}
        print(f"[OK] Tables found: {sorted(existing) or '(none yet)'}\n")

        # Create missing tables (same DDL as database.py startup)
        for tbl in REQUIRED_TABLES:
            if tbl not in existing:
                await conn.execute(f"""
                    CREATE TABLE IF NOT EXISTS {tbl} (
                        id TEXT PRIMARY KEY,
                        data JSONB NOT NULL
                    )
                """)
                print(f"  [CREATED] {tbl}")
            else:
                cnt = await conn.fetchval(f"SELECT COUNT(*) FROM {tbl}")
                print(f"  [EXISTS]  {tbl:<15} -> {cnt} rows")

        # Verify unique index on users.email
        idx = await conn.fetchval(
            "SELECT indexname FROM pg_indexes WHERE tablename='users' AND indexname LIKE '%email%'"
        )
        if not idx:
            await conn.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users ((data->>'email'))"
            )
            print("\n  [CREATED] Unique index on users.email")
        else:
            print(f"\n  [OK] Index: {idx}")

    await pool.close()
    print("\n[DONE] Neon DB is fully operational and ready!\n")

asyncio.run(main())
