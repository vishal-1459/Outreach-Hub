import re
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
from app.config import settings

HONORIFICS = {"mr", "mr.", "mrs", "mrs.", "ms", "ms.", "dr", "dr.", "prof", "prof."}

def extract_first_name(raw_name: Optional[str]) -> str:
    """
    Safely extract first name for personalization.
    e.g. 'Akanksha Puri' -> 'Akanksha'
    'Dr. Rajesh Kumar' -> 'Rajesh'
    'Akriti' -> 'Akriti'
    'A. K. Sharma' -> 'A. K. Sharma' (safe fallback if first token is single letter)
    If empty or unparseable, returns 'Hiring Team'.
    """
    if not raw_name or not isinstance(raw_name, str):
        return "Hiring Team"

    cleaned = raw_name.strip()
    if not cleaned:
        return "Hiring Team"

    # Split by spaces/hyphens
    parts = cleaned.split()
    if not parts:
        return "Hiring Team"

    # Filter out initial honorifics
    while parts and parts[0].lower() in HONORIFICS:
        parts.pop(0)

    if not parts:
        return cleaned

    first_token = parts[0].strip()

    # Safety check: if first token is a single letter initial (like 'A' or 'A.'),
    # don't use it as first name; fallback to full cleaned name
    if len(first_token.replace(".", "")) <= 1:
        return cleaned

    # Check if first token contains non-alpha characters (excluding standard apostrophes or hyphens)
    if not re.match(r"^[A-Za-z'-]+$", first_token):
        return cleaned

    # Return capitalized first name
    return first_token.capitalize()

def load_template_files(
    body_path: Optional[str] = None,
    subject_path: Optional[str] = None
) -> Tuple[str, str]:
    """
    Load external email template files.
    """
    b_path = Path(body_path or settings.TEMPLATE_BODY_PATH)
    s_path = Path(subject_path or settings.TEMPLATE_SUBJECT_PATH)

    if not b_path.is_file():
        raise FileNotFoundError(f"Email body template file not found: {b_path}")
    if not s_path.is_file():
        raise FileNotFoundError(f"Email subject template file not found: {s_path}")

    body_template = b_path.read_text(encoding="utf-8").strip()
    subject_template = s_path.read_text(encoding="utf-8").strip()

    return subject_template, body_template

def render_string(template_str: str, context: Dict[str, Any]) -> str:
    """
    Replace {{Key}} variables in template string with values from context dictionary.
    Keys are matched case-insensitively.
    """
    result = template_str
    for key, value in context.items():
        val_str = str(value) if value is not None else ""
        # Match {{Key}}, {{ Key }}, case-insensitive
        pattern = re.compile(rf"\{{\{{\s*{re.escape(key)}\s*\}}\}}", re.IGNORECASE)
        result = pattern.sub(val_str, result)
    return result

def render_email(
    contact: Dict[str, Any],
    custom_subject_template: Optional[str] = None,
    custom_body_template: Optional[str] = None,
) -> Tuple[str, str]:
    """
    Renders personalized subject and body for a given contact.
    Context variables available:
    - {{Name}} (personalized safe first name)
    - {{FullName}}
    - {{Email}}
    - {{Title}}
    - {{Company}}
    - {{SenderName}}
    - {{SenderTitle}}
    - {{SenderEmail}}
    - {{SenderPhone}}
    - {{SenderLocation}}
    - {{SenderLinkedIn}}
    - {{SenderGitHub}}
    """
    if custom_subject_template is not None and custom_body_template is not None:
        subject_tmpl = custom_subject_template
        body_tmpl = custom_body_template
    else:
        subject_tmpl, body_tmpl = load_template_files()

    raw_name = contact.get("name", "")
    first_name = extract_first_name(raw_name)
    company = contact.get("company", "your organization") or "your organization"
    title = contact.get("title", "") or ""
    recipient_email = contact.get("email", "") or ""

    context = {
        "Name": first_name,
        "FullName": raw_name,
        "Email": recipient_email,
        "Title": title,
        "Company": company,
        "SenderName": settings.SENDER_NAME,
        "SenderTitle": settings.SENDER_TITLE,
        "SenderEmail": settings.FROM_EMAIL,
        "SenderPhone": settings.SENDER_PHONE,
        "SenderLocation": settings.SENDER_LOCATION,
        "SenderLinkedIn": settings.SENDER_LINKEDIN,
        "SenderGitHub": settings.SENDER_GITHUB,
    }

    rendered_subject = render_string(subject_tmpl, context)
    rendered_body = render_string(body_tmpl, context)

    return rendered_subject, rendered_body
