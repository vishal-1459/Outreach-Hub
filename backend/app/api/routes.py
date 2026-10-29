import os
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.database.models import get_all_logs, EmailLog
from app.pdf.parser import parse_contacts_pdf, get_contacts_by_range
from app.services.outreach import get_preview_data, execute_outreach
from app.utils.validation import ValidationError

router = APIRouter()

class PreviewRequest(BaseModel):
    start: int = Field(default=1, ge=1, description="Start row (SNo)")
    end: int = Field(default=10, ge=1, description="End row (SNo)")

class SendRequest(BaseModel):
    start: int = Field(ge=1, description="Start row (SNo)")
    end: int = Field(ge=1, description="End row (SNo)")
    confirm: bool = Field(default=False, description="Must explicitly be set to true to send real emails")
    force: bool = Field(default=False, description="Force resending to already contacted recipients")
    dry_run: bool = Field(default=False, description="Simulate sending without contacting SMTP server")
    delay_seconds: Optional[float] = Field(default=None, ge=0, description="Delay between sends in seconds")

@router.get("/")
def root():
    return {
        "service": "Job Outreach Email Automation Backend",
        "author": settings.SENDER_NAME,
        "email": settings.FROM_EMAIL,
        "status": "running",
        "docs_url": "/docs",
        "endpoints": {
            "health": "/health",
            "contacts": "/contacts?start=1&end=10",
            "preview": "POST /preview",
            "send": "POST /send",
            "logs": "/logs"
        }
    }

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    contact_exists = Path(settings.CONTACT_PDF).is_file()
    resume_exists = Path(settings.RESUME_PDF).is_file()
    
    total_contacts = 0
    if contact_exists:
        try:
            contacts, _ = parse_contacts_pdf()
            total_contacts = len(contacts)
        except Exception:
            pass

    return {
        "status": "healthy",
        "database": "connected",
        "contact_pdf": {
            "path": settings.CONTACT_PDF,
            "exists": contact_exists,
            "total_contacts": total_contacts
        },
        "resume_pdf": {
            "path": settings.RESUME_PDF,
            "exists": resume_exists
        },
        "smtp": {
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "user": settings.SMTP_USER,
            "configured": bool(settings.SMTP_PASSWORD)
        }
    }

@router.get("/contacts")
def list_contacts(
    start: Optional[int] = Query(default=None, ge=1, description="Start SNo"),
    end: Optional[int] = Query(default=None, ge=1, description="End SNo"),
    search: Optional[str] = Query(default=None, description="Search term in Name, Company, or Email")
):
    try:
        contacts, skipped = parse_contacts_pdf()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse contacts PDF: {e}"
        )

    filtered = contacts
    if search:
        s = search.lower()
        filtered = [
            c for c in filtered
            if s in c.get("name", "").lower()
            or s in c.get("company", "").lower()
            or s in c.get("email", "").lower()
            or s in c.get("title", "").lower()
        ]

    if start is not None and end is not None:
        if end < start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"start ({start}) cannot be greater than end ({end})"
            )
        filtered = [c for c in filtered if start <= c.get("sno", -1) <= end]
    elif start is not None:
        filtered = [c for c in filtered if c.get("sno", -1) >= start]
    elif end is not None:
        filtered = [c for c in filtered if c.get("sno", -1) <= end]

    return {
        "total_in_pdf": len(contacts),
        "total_skipped_in_pdf": len(skipped),
        "count": len(filtered),
        "contacts": [
            {
                "sno": c.get("sno"),
                "name": c.get("name"),
                "email": c.get("email"),
                "title": c.get("title"),
                "company": c.get("company")
            }
            for c in filtered
        ]
    }

@router.post("/preview")
def preview_emails(req: PreviewRequest, db: Session = Depends(get_db)):
    try:
        previews = get_preview_data(start=req.start, end=req.end, db=db)
        return {
            "start": req.start,
            "end": req.end,
            "count": len(previews),
            "previews": previews
        }
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/send")
def send_emails(req: SendRequest, db: Session = Depends(get_db)):
    # Safety Check: If not dry run and confirm is not True, reject
    if not req.dry_run and not req.confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Safety guard: Real emails will NOT be sent unless 'confirm': true is explicitly passed. "
                "For simulation, use 'dry_run': true."
            )
        )

    try:
        summary = execute_outreach(
            start=req.start,
            end=req.end,
            dry_run=req.dry_run,
            force=req.force,
            delay_seconds=req.delay_seconds,
            db=db
        )
        return summary
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/logs")
def view_logs(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    records = get_all_logs(db, limit=limit, offset=offset)
    total_count = db.query(EmailLog).count()
    return {
        "total_records": total_count,
        "limit": limit,
        "offset": offset,
        "logs": [r.to_dict() for r in records]
    }
