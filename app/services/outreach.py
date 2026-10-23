import time
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.utils.logger import logger
from app.utils.validation import (
    validate_range,
    validate_resume_exists,
    validate_contact_pdf_exists,
    ValidationError
)
from app.pdf.parser import parse_contacts_pdf, get_contacts_by_range
from app.email.template import render_email
from app.email.sender import EmailSender
from app.database.database import SessionLocal
from app.database.models import has_been_sent, record_email_log

def get_preview_data(
    start: int,
    end: int,
    pdf_path: Optional[str] = None,
    db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    Generate email previews for contacts in the given SNo range.
    Never sends an email.
    """
    contacts, _ = parse_contacts_pdf(pdf_path)
    total_contacts = len(contacts)
    validate_range(start, end, total_contacts)

    selected = [c for c in contacts if start <= c.get("sno", -1) <= end]

    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    previews = []
    try:
        for c in selected:
            subj, body = render_email(c)
            email_addr = c.get("email", "")
            sent_before = has_been_sent(db, email_addr) if email_addr else False

            previews.append({
                "sno": c.get("sno"),
                "name": c.get("name"),
                "email": email_addr,
                "company": c.get("company"),
                "title": c.get("title"),
                "subject": subj,
                "body": body,
                "already_sent": sent_before
            })
    finally:
        if close_db:
            db.close()

    return previews

def execute_outreach(
    start: int,
    end: int,
    dry_run: bool = False,
    force: bool = False,
    delay_seconds: Optional[float] = None,
    pdf_path: Optional[str] = None,
    resume_path: Optional[str] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Execute outreach across SNo range.
    Handles duplicate prevention, dry-run mode, rate limiting, and database logging.
    """
    # 1. Verify Resume.pdf existence before proceeding
    validate_resume_exists(resume_path)
    validate_contact_pdf_exists(pdf_path)

    # 2. Parse contacts & validate range
    contacts, _ = parse_contacts_pdf(pdf_path)
    total_contacts = len(contacts)
    validate_range(start, end, total_contacts)

    targets = [c for c in contacts if start <= c.get("sno", -1) <= end]
    delay = delay_seconds if delay_seconds is not None else settings.RATE_LIMIT_SECONDS

    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    logger.info(f"Processing rows {start}-{end} ({len(targets)} contacts found in range)")

    sender: Optional[EmailSender] = None
    if not dry_run:
        sender = EmailSender()
        try:
            sender.connect()
        except Exception as e:
            if close_db:
                db.close()
            raise ConnectionError(f"SMTP Connection failed: {e}") from e

    summary = {
        "processed": len(targets),
        "sent": 0,
        "failed": 0,
        "skipped": 0,
        "duplicates": 0,
        "dry_run": dry_run,
        "details": []
    }

    try:
        for idx, contact in enumerate(targets):
            sno = contact.get("sno")
            name = contact.get("name", "")
            email = contact.get("email", "")
            company = contact.get("company", "")
            title = contact.get("title", "")

            # Render email
            subject, body = render_email(contact)

            # Check duplicate status
            is_dup = has_been_sent(db, email)
            if is_dup and not force:
                logger.info(f"Skipping duplicate: {email} (Reason: Email already sent previously)")
                summary["skipped"] += 1
                summary["duplicates"] += 1
                summary["details"].append({
                    "sno": sno,
                    "email": email,
                    "status": "SKIPPED",
                    "reason": "Email already sent previously."
                })
                # In dry_run or force we don't overwrite SENT status, but we record skipped log
                record_email_log(
                    db,
                    recipient_email=email,
                    name=name,
                    company=company,
                    title=title,
                    status="SKIPPED",
                    subject=subject,
                    error_message="Email already sent previously."
                )
                continue

            if dry_run:
                # Dry run mode: do not send
                summary["sent"] += 1
                summary["details"].append({
                    "sno": sno,
                    "email": email,
                    "status": "DRY_RUN",
                    "subject": subject
                })
                record_email_log(
                    db,
                    recipient_email=email,
                    name=name,
                    company=company,
                    title=title,
                    status="DRY_RUN",
                    subject=subject
                )
            else:
                # Real send mode
                logger.info(f"Sending email to {email}")
                success, error_msg = sender.send_email(
                    to_email=email,
                    subject=subject,
                    body_text=body,
                    resume_path=resume_path
                )

                if success:
                    logger.info(f"Email sent successfully to {email}")
                    summary["sent"] += 1
                    summary["details"].append({
                        "sno": sno,
                        "email": email,
                        "status": "SENT"
                    })
                    record_email_log(
                        db,
                        recipient_email=email,
                        name=name,
                        company=company,
                        title=title,
                        status="SENT",
                        subject=subject
                    )

                    # Rate limiting delay before next message
                    if idx < len(targets) - 1 and delay > 0:
                        logger.info(f"Waiting {delay}s (rate limiting)...")
                        time.sleep(delay)
                else:
                    logger.error(f"Failed to send email to {email}: {error_msg}")
                    summary["failed"] += 1
                    summary["details"].append({
                        "sno": sno,
                        "email": email,
                        "status": "FAILED",
                        "error": error_msg
                    })
                    record_email_log(
                        db,
                        recipient_email=email,
                        name=name,
                        company=company,
                        title=title,
                        status="FAILED",
                        subject=subject,
                        error_message=error_msg
                    )

    finally:
        if sender:
            sender.close()
        if close_db:
            db.close()

    return summary
