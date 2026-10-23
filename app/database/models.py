from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import Session
from app.database.database import Base

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recipient_email = Column(String(255), index=True, nullable=False)
    name = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), nullable=False)  # SENT, FAILED, SKIPPED, DRY_RUN
    error_message = Column(Text, nullable=True)
    subject = Column(String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "recipient_email": self.recipient_email,
            "name": self.name,
            "company": self.company,
            "title": self.title,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "status": self.status,
            "error_message": self.error_message,
            "subject": self.subject,
        }

def has_been_sent(db: Session, email: str) -> bool:
    """
    Check whether an email address has already received a successfully SENT email.
    Case-insensitive check on recipient_email.
    """
    normalized_email = email.strip().lower()
    return (
        db.query(EmailLog)
        .filter(
            func.lower(EmailLog.recipient_email) == normalized_email,
            EmailLog.status == "SENT"
        )
        .first()
        is not None
    )

def record_email_log(
    db: Session,
    recipient_email: str,
    name: str,
    company: str,
    title: str,
    status: str,
    subject: Optional[str] = None,
    error_message: Optional[str] = None,
) -> EmailLog:
    """Record an outreach event into the database."""
    log_entry = EmailLog(
        recipient_email=recipient_email.strip().lower(),
        name=name.strip() if name else None,
        company=company.strip() if company else None,
        title=title.strip() if title else None,
        status=status.upper(),
        subject=subject,
        error_message=error_message,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def get_all_logs(db: Session, limit: int = 100, offset: int = 0) -> List[EmailLog]:
    """Retrieve logs ordered by timestamp descending."""
    return (
        db.query(EmailLog)
        .order_by(EmailLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
