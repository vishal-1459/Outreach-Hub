import pytest
from app.pdf.parser import parse_contacts_pdf, clean_email_str, parse_row_from_cells
from app.utils.validation import validate_email

def test_clean_email_str():
    assert clean_email_str("test@example.\ncom") == "test@example.com"
    assert clean_email_str(" test @ example.com ") == "test@example.com"
    assert clean_email_str("") == ""
    assert clean_email_str(None) == ""

def test_validate_email():
    valid, res = validate_email("vishalyadav.it26@gmail.com")
    assert valid is True
    assert res == "vishalyadav.it26@gmail.com"

    valid, _ = validate_email("invalid-email-no-at")
    assert valid is False

    valid, _ = validate_email("")
    assert valid is False

def test_parse_contacts_pdf_full():
    contacts, skipped = parse_contacts_pdf()
    assert len(contacts) == 1842
    # Verify first row
    first = contacts[0]
    assert first["sno"] == 1
    assert first["name"] == "Akanksha Puri"
    assert first["email"] == "akanksha.puri@sourcefuse.com"

    # Verify last row
    last = contacts[-1]
    assert last["sno"] == 1842
    assert last["name"] == "Zulfiqar Syed"

    # Verify multi-line email row 394 was reconstructed properly
    row_394 = next((c for c in contacts if c["sno"] == 394), None)
    assert row_394 is not None
    assert row_394["email"] == "gitanjali.venkatesh@excelenciaconsulting.com"
