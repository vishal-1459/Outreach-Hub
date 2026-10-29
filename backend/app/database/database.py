from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings, BASE_DIR

# Ensure data directory exists
data_dir = BASE_DIR / "data"
data_dir.mkdir(parents=True, exist_ok=True)

# SQLite database URL
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
