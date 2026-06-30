import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.config import settings
from backend.app.database import connect_to_mongo, close_mongo_connection
from backend.app.routes import auth, predict, patient, admin, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to PostgreSQL on startup
    await connect_to_mongo()
    yield
    # Close connection on shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# ──────────────────────────────────────────────────────────────────────────────
# CORS — allow_credentials MUST be False when allow_origins=["*"].
# Using True + * is invalid per the CORS spec and causes Starlette to crash
# OR browsers to block every response with "No Access-Control-Allow-Origin".
# We use Bearer tokens in headers (not cookies) so credentials=False is fine.
# ──────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount static uploads directory — guard against missing dir on fresh containers
try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")
except Exception as e:
    import logging
    logging.getLogger("dentalai").warning(f"Could not mount /uploads static dir: {e}")

# Mount Routers under the /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(patient.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
