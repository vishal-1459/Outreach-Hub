import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.database.models import EmailLog, has_been_sent, record_email_log

# Use an in-memory SQLite database for test isolation
@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        yield db
    finally:
        db.close()

def test_duplicate_prevention(test_db):
    email = "test.duplicate@example.com"
    
    # Initially not sent
    assert has_been_sent(test_db, email) is False

    # Record a failed send
    record_email_log(
        test_db,
        recipient_email=email,
        name="Test User",
        company="Test Corp",
        title="Recruiter",
        status="FAILED",
        error_message="SMTP error"
    )
    # Failed status should not prevent future sending
    assert has_been_sent(test_db, email) is False

    # Record a successful send
    record_email_log(
        test_db,
        recipient_email=email,
        name="Test User",
        company="Test Corp",
        title="Recruiter",
        status="SENT",
        subject="Opportunity"
    )
    # Now it should be detected as sent
    assert has_been_sent(test_db, email) is True
    # Case insensitivity check
    assert has_been_sent(test_db, "TEST.DUPLICATE@EXAMPLE.COM") is True
