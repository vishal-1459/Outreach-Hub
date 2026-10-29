import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "vishalyadav.it26@gmail.com"
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "vishalyadav.it26@gmail.com"

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'email_sender.db'}"

    # File paths
    CONTACT_PDF: str = str(BASE_DIR / "contactInfo.pdf")
    RESUME_PDF: str = str(BASE_DIR / "Resume.pdf")
    TEMPLATE_BODY_PATH: str = str(BASE_DIR / "templates" / "email.txt")
    TEMPLATE_SUBJECT_PATH: str = str(BASE_DIR / "templates" / "subject.txt")

    # Rate limiting (seconds between email dispatches)
    RATE_LIMIT_SECONDS: float = 5.0

    # Sender information from verified resume
    SENDER_NAME: str = "Vishal Yadav"
    SENDER_TITLE: str = "Full Stack Developer"
    SENDER_PHONE: str = "+91-7838726190"
    SENDER_LOCATION: str = "Jaipur, Rajasthan"
    SENDER_LINKEDIN: str = "linkedin.com/in/vishal-yadav21"
    SENDER_GITHUB: str = "github.com/vishal-1459"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
