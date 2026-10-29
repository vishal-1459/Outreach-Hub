import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import pdfplumber

from app.config import settings
from app.utils.logger import logger
from app.utils.validation import validate_email, validate_contact_pdf_exists

# Cached parsed contacts in memory
_CACHED_CONTACTS: Optional[List[Dict[str, Any]]] = None
_CACHED_SKIPPED: Optional[List[Dict[str, Any]]] = None
_CACHED_MTIME: Optional[float] = None

# Regex for anchoring email in space-separated or raw text
EMAIL_ANCHOR_REGEX = re.compile(
    r"([a-zA-Z0-9_.+-]+(?:\s*@\s*|\s*@\s*)[a-zA-Z0-9-.]+\.[a-zA-Z]{2,})"
)

def clean_field(val: Optional[str]) -> str:
    """Normalize whitespace and newlines inside a field."""
    if not val:
        return ""
    return " ".join(val.replace("\r", " ").replace("\n", " ").split()).strip()

def clean_email_str(raw_email: Optional[str]) -> str:
    """Strip all internal whitespaces and newlines from an email."""
    if not raw_email:
        return ""
    # Remove internal linebreaks and spaces often caused by narrow column wraps
    return raw_email.replace("\r", "").replace("\n", "").replace(" ", "").strip()

def parse_row_from_cells(
    row: List[Any],
    page_num: int,
    row_idx: int
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """
    Parse a 5-column table row: [SNo, Name, Email, Title, Company].
    Returns (contact_dict, None) or (None, skip_reason).
    """
    if not row or len(row) < 3:
        return None, f"Row has insufficient columns ({len(row) if row else 0})"

    raw_sno = str(row[0]).strip() if row[0] is not None else ""
    # Skip header rows
    if raw_sno.lower() in ("sno", "s.no", "s.no.", "sl no", "slno", "#"):
        return None, "Header row"

    # Extract SNo
    sno_digits = re.search(r"\d+", raw_sno)
    if not sno_digits:
        return None, f"Non-numeric SNo: '{raw_sno}'"
    sno = int(sno_digits.group(0))

    raw_name = clean_field(str(row[1])) if len(row) > 1 and row[1] is not None else ""
    raw_email = clean_email_str(str(row[2])) if len(row) > 2 and row[2] is not None else ""
    raw_title = clean_field(str(row[3])) if len(row) > 3 and row[3] is not None else ""
    raw_company = clean_field(str(row[4])) if len(row) > 4 and row[4] is not None else ""

    # Validate email
    is_valid, email_or_reason = validate_email(raw_email)
    if not is_valid:
        return None, f"Invalid email on row SNo {sno}: '{raw_email}' ({email_or_reason})"

    contact = {
        "sno": sno,
        "name": raw_name,
        "email": email_or_reason,
        "title": raw_title,
        "company": raw_company,
        "page": page_num,
    }
    return contact, None

def parse_text_lines_fallback(
    page_text: str,
    page_num: int
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Fallback parser using email regex anchor for pages where table extraction fails.
    Handles lines where email is wrapped across lines.
    """
    contacts = []
    skipped = []

    lines = [l.strip() for l in page_text.splitlines() if l.strip()]
    i = 0
    while i < len(lines):
        line = lines[i]

        # Ignore headers
        if re.match(r"^sno\s+name\s+email", line, re.IGNORECASE):
            i += 1
            continue

        # Look for SNo at the start
        sno_match = re.match(r"^(\d+)\s+(.*)$", line)
        if not sno_match:
            # Check if this line is part of a wrapped email from previous
            skipped.append({
                "page": page_num,
                "line": line,
                "reason": "Does not start with numeric SNo"
            })
            i += 1
            continue

        sno = int(sno_match.group(1))
        remainder = sno_match.group(2).strip()

        # Check if email is on this line or split onto next line
        combined_line = remainder
        if "@" not in combined_line and i + 1 < len(lines):
            # Might be split across next line
            next_line = lines[i + 1]
            if "@" in next_line and not re.match(r"^\d+\s+", next_line):
                combined_line = f"{remainder} {next_line}"
                i += 1

        # Search for email anchor
        # Find email using standard pattern after removing internal spaces inside potential emails
        # First test raw search
        email_search = re.search(r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", combined_line)
        if not email_search:
            # Try cleaning spaces in email-like fragments (e.g. '@ co e m xcelenciaconsulting.')
            reconstructed = re.sub(r"([a-zA-Z0-9_.+-]+)\s*@\s*([a-zA-Z0-9\s.]+)\.([a-zA-Z]{2,})",
                                  lambda m: f"{m.group(1)}@{m.group(2).replace(' ', '')}.{m.group(3).replace(' ', '')}",
                                  combined_line)
            email_search = re.search(r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", reconstructed)
            if email_search:
                combined_line = reconstructed

        if not email_search:
            skipped.append({
                "sno": sno,
                "page": page_num,
                "raw_text": combined_line,
                "reason": "Email address anchor could not be identified"
            })
            i += 1
            continue

        email = email_search.group(1).strip()
        span_start, span_end = email_search.span()

        name = combined_line[:span_start].strip()
        after_email = combined_line[span_end:].strip()

        # In typical layouts, after_email contains Title and Company
        # If separated by multiple spaces or single string, assign gracefully
        title = after_email
        company = ""
        parts = re.split(r"\s{2,}|\t+", after_email)
        if len(parts) >= 2:
            title = parts[0].strip()
            company = parts[1].strip()

        is_valid, clean_email = validate_email(email)
        if not is_valid:
            skipped.append({
                "sno": sno,
                "page": page_num,
                "email": email,
                "reason": f"Invalid email format: {clean_email}"
            })
        else:
            contacts.append({
                "sno": sno,
                "name": name,
                "email": clean_email,
                "title": title,
                "company": company,
                "page": page_num
            })

        i += 1

    return contacts, skipped

def parse_contacts_pdf(
    pdf_path: Optional[str] = None,
    force_reload: bool = False
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Parse all contacts from contactInfo.pdf.
    Extracts SNo, Name, Email, Title, Company across all pages.
    Reconstructs wrapped lines/emails and validates emails.
    Caches results in memory for fast performance.
    """
    global _CACHED_CONTACTS, _CACHED_SKIPPED, _CACHED_MTIME

    file_path = validate_contact_pdf_exists(pdf_path)
    current_mtime = file_path.stat().st_mtime

    # Return cached results if not modified and not force reloaded
    if (
        not force_reload
        and _CACHED_CONTACTS is not None
        and _CACHED_SKIPPED is not None
        and _CACHED_MTIME == current_mtime
    ):
        return _CACHED_CONTACTS, _CACHED_SKIPPED

    contacts: List[Dict[str, Any]] = []
    skipped: List[Dict[str, Any]] = []

    logger.info(f"Opening and parsing contacts PDF: {file_path}")

    with pdfplumber.open(str(file_path)) as pdf:
        total_pages = len(pdf.pages)
        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1
            tables = page.extract_tables()

            # Strategy 1: Table extraction
            page_contacts: List[Dict[str, Any]] = []
            if tables:
                for table in tables:
                    for r_idx, row in enumerate(table):
                        contact, skip_reason = parse_row_from_cells(row, page_num, r_idx)
                        if contact:
                            page_contacts.append(contact)
                        elif skip_reason and skip_reason != "Header row":
                            skipped.append({
                                "page": page_num,
                                "row": r_idx,
                                "raw_data": str(row)[:100],
                                "reason": skip_reason
                            })

            # Strategy 2: If table extraction found no contacts, use text extraction
            if not page_contacts:
                logger.info(f"Page {page_num} had no structured table; using text anchor fallback.")
                text = page.extract_text() or ""
                page_contacts, page_skipped = parse_text_lines_fallback(text, page_num)
                skipped.extend(page_skipped)

            contacts.extend(page_contacts)

    # Sort contacts by SNo
    contacts.sort(key=lambda c: c.get("sno", 0))

    _CACHED_CONTACTS = contacts
    _CACHED_SKIPPED = skipped
    _CACHED_MTIME = current_mtime

    logger.info(
        f"Parsed {len(contacts)} contacts across {total_pages} pages. "
        f"Skipped/Invalid rows: {len(skipped)}."
    )

    return contacts, skipped

def get_contacts_by_range(
    start: int,
    end: int,
    pdf_path: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get contacts filtered by SNo range: start <= sno <= end.
    """
    all_contacts, _ = parse_contacts_pdf(pdf_path)
    # The SNo directly corresponds to the PDF SNo
    return [c for c in all_contacts if start <= c.get("sno", -1) <= end]
