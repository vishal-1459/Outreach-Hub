from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.database import init_db
from app.api.routes import router
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Local Job Outreach Backend...")
    init_db()
    logger.info("Database tables verified/created successfully.")
    yield
    # Shutdown
    logger.info("Shutting down Local Job Outreach Backend...")

app = FastAPI(
    title="Local Job Outreach Email Automation API",
    description="Deterministic, local personal job outreach automation backend powered by FastAPI and SQLite.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for local frontend/tools and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)
