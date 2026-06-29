import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# CORS Policy Configuration
# FIX: allow_credentials=True is INCOMPATIBLE with allow_origins=["*"].
# Browsers block preflight (OPTIONS) requests when both are set, causing
# "Failed to fetch" on every cross-origin request.
# Since we use Bearer tokens (not cookies), credentials mode is not needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Open to all origins
    allow_credentials=False,    # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory to serve uploaded diagnostic scans
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

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
