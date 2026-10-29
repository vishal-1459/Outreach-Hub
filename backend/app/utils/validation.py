import os
import re
from pathlib import Path
from typing import Tuple, Optional
from app.config import settings

# RFC 5322 simplified email regex pattern
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass

def validate_email(email: Optional[str]) -> Tuple[bool, str]:
    """
    Validate that email is non-empty, contains valid format and domain.
    Returns (is_valid, cleaned_email_or_reason).
    """
    if not email or not isinstance(email, str):
        return False, "Email address is missing or empty"

    cleaned = email.replace("\n", "").replace("\r", "").replace(" ", "").strip()
    if not cleaned:
        return False, "Email address is blank after whitespace removal"

    if not EMAIL_REGEX.match(cleaned):
        return False, f"Invalid email format: '{email}'"

    return True, cleaned

def validate_range(start: int, end: int, total_contacts: Optional[int] = None) -> None:
    """
    Validate start and end row ranges.
    Ensure start >= 1 and end >= start.
    If total_contacts is provided, ensure start <= total_contacts.
    """
    if start < 1:
        raise ValidationError(f"Invalid start row: {start}. Start row must be >= 1.")

    if end < start:
        raise ValidationError(f"Invalid row range: start ({start}) cannot be greater than end ({end}).")

    if total_contacts is not None:
        if total_contacts == 0:
            raise ValidationError("No contacts available in the contacts database/PDF.")
        if start > total_contacts:
            raise ValidationError(
                f"Start row {start} exceeds total contacts available ({total_contacts})."
            )

def validate_file_exists(file_path: str, description: str = "File") -> Path:
    """
    Ensure a required file exists on disk.
    """
    path = Path(file_path)
    if not path.is_file():
        raise ValidationError(
            f"{description} not found at: {file_path}. Please verify the file path exists."
        )
    return path

def validate_resume_exists(resume_path: Optional[str] = None) -> Path:
    """
    Strict validation for Resume.pdf existence before any sending.
    """
    path_to_check = resume_path or settings.RESUME_PDF
    return validate_file_exists(path_to_check, description="Resume attachment")

def validate_contact_pdf_exists(contact_pdf_path: Optional[str] = None) -> Path:
    """
    Strict validation for contactInfo.pdf existence.
    """
    path_to_check = contact_pdf_path or settings.CONTACT_PDF
    return validate_file_exists(path_to_check, description="Contact PDF")

def validate_smtp_config(allow_empty_password: bool = False) -> None:
    """
    Validate SMTP settings from environment.
    """
    if not settings.SMTP_HOST:
        raise ValidationError("SMTP_HOST is not configured in .env.")
    if not settings.SMTP_PORT or settings.SMTP_PORT <= 0:
        raise ValidationError(f"Invalid SMTP_PORT: {settings.SMTP_PORT}.")
    if not settings.SMTP_USER:
        raise ValidationError("SMTP_USER is not configured in .env.")
    if not settings.FROM_EMAIL:
        raise ValidationError("FROM_EMAIL is not configured in .env.")
    
    if not allow_empty_password and not settings.SMTP_PASSWORD:
        raise ValidationError(
            "SMTP_PASSWORD is missing in .env! "
            "Please configure your Google App Password (16-character password) in .env."
        )
