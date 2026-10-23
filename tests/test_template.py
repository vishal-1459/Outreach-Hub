import pytest
from app.email.template import extract_first_name, render_string, render_email

def test_extract_first_name_standard():
    assert extract_first_name("Akanksha Puri") == "Akanksha"
    assert extract_first_name("Akhil Jogiparthi") == "Akhil"
    assert extract_first_name("Akriti") == "Akriti"

def test_extract_first_name_with_honorific():
    assert extract_first_name("Dr. Rajesh Kumar") == "Rajesh"
    assert extract_first_name("Mr. Allwyn Richard") == "Allwyn"
    assert extract_first_name("Ms. Ananya Sharma") == "Ananya"

def test_extract_first_name_fallback():
    assert extract_first_name("") == "Hiring Team"
    assert extract_first_name(None) == "Hiring Team"
    assert extract_first_name("   ") == "Hiring Team"
    # Single letter initial fallback to full string
    assert extract_first_name("A. K. Sharma") == "A. K. Sharma"

def test_render_template_variable_substitution():
    tmpl = "Hello {{Name}}, welcome to {{Company}}! Reach me at {{SenderEmail}}."
    ctx = {
        "Name": "Akanksha",
        "Company": "SourceFuse",
        "SenderEmail": "vishalyadav.it26@gmail.com"
    }
    rendered = render_string(tmpl, ctx)
    assert rendered == "Hello Akanksha, welcome to SourceFuse! Reach me at vishalyadav.it26@gmail.com."

def test_render_email_defaults():
    contact = {
        "sno": 1,
        "name": "Akanksha Puri",
        "email": "akanksha.puri@sourcefuse.com",
        "title": "Associate Director HR",
        "company": "SourceFuse Technologies"
    }
    subject, body = render_email(contact)
    assert "Vishal Yadav" in subject
    assert "Hi Akanksha," in body
    assert "SourceFuse Technologies" in body
    assert "vishalyadav.it26@gmail.com" in body
    assert "Jman Group" not in body  # Must NOT contain old false claims
