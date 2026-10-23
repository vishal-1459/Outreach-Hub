#!/usr/bin/env python3
"""
Command Line Interface (CLI) for Local Job Outreach Email Automation.
"""
import sys
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from app.config import settings
from app.database.database import init_db, SessionLocal
from app.pdf.parser import parse_contacts_pdf
from app.services.outreach import get_preview_data, execute_outreach
from app.utils.validation import (
    validate_range,
    validate_resume_exists,
    validate_contact_pdf_exists,
    ValidationError
)

def cmd_contacts(args):
    """List contacts in tabular format."""
    print("Reading and parsing contacts PDF...")
    try:
        contacts, skipped = parse_contacts_pdf()
    except Exception as e:
        print(f"Error reading contacts PDF: {e}", file=sys.stderr)
        return 1

    total_contacts = len(contacts)
    total_skipped = len(skipped)

    start = args.start or 1
    end = args.end or (min(start + 19, total_contacts) if args.start else total_contacts)

    filtered = [c for c in contacts if start <= c.get("sno", -1) <= end]

    print("\n" + "=" * 105)
    print(f"{'SNo':<6} | {'Name':<24} | {'Email':<34} | {'Title':<32} | {'Company'}")
    print("-" * 105)

    for c in filtered:
        sno = str(c.get("sno", ""))
        name = (c.get("name") or "")[:24]
        email = (c.get("email") or "")[:34]
        title = (c.get("title") or "")[:32]
        company = c.get("company") or ""
        print(f"{sno:<6} | {name:<24} | {email:<34} | {title:<32} | {company}")

    print("=" * 105)
    print(f"\nContacts displayed: {len(filtered)} (Range: {start} - {end})")
    print(f"Total contacts: {total_contacts}")
    print(f"Valid contacts: {total_contacts}")
    print(f"Invalid/skipped: {total_skipped}")

    if skipped and args.show_skipped:
        print("\n--- Skipped / Malformed Records ---")
        for s in skipped:
            print(s)

    return 0

def cmd_preview(args):
    """Generate rendered previews without sending."""
    print(f"Generating preview for rows {args.start} to {args.end}...\n")
    try:
        previews = get_preview_data(start=args.start, end=args.end)
    except ValidationError as e:
        print(f"Validation error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error generating preview: {e}", file=sys.stderr)
        return 1

    separator = "-" * 80

    for p in previews:
        sent_badge = " [ALREADY SENT PREVIOUSLY]" if p["already_sent"] else ""
        print(separator)
        print(f"SNo:       {p['sno']}{sent_badge}")
        print(f"Recipient: {p['name']}")
        print(f"Email:     {p['email']}")
        print(f"Company:   {p['company']}")
        print(f"Title:     {p['title']}")
        print(f"Subject:   {p['subject']}")
        print("Body:")
        print(p["body"])
        print(separator + "\n")

    print(f"Previewed {len(previews)} email(s). PREVIEW MODE — No emails were sent.")
    return 0

def cmd_send(args):
    """Execute outreach send operation (or dry-run)."""
    # 1. Verify Resume.pdf exists
    try:
        resume_path = validate_resume_exists()
    except ValidationError as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        print("STOP: Resume.pdf must be present before sending or simulating emails.", file=sys.stderr)
        return 1

    # 2. Parse contacts to determine range count
    try:
        contacts, _ = parse_contacts_pdf()
        total_contacts = len(contacts)
        validate_range(args.start, args.end, total_contacts)
    except ValidationError as e:
        print(f"Validation error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error reading contacts: {e}", file=sys.stderr)
        return 1

    targets = [c for c in contacts if args.start <= c.get("sno", -1) <= args.end]
    num_targets = len(targets)

    # 3. Dry Run Handling
    if args.dry_run:
        print(f"\n{'=' * 40}")
        print(f"DRY RUN MODE — Processing SNo {args.start} to {args.end} ({num_targets} contacts)")
        print(f"Resume attachment verified: {resume_path.name}")
        print(f"{'=' * 40}\n")

        db = SessionLocal()
        try:
            summary = execute_outreach(
                start=args.start,
                end=args.end,
                dry_run=True,
                force=args.force,
                delay_seconds=0,
                db=db
            )
        finally:
            db.close()

        print("\n" + "=" * 40)
        print("DRY RUN SUMMARY")
        print("=" * 40)
        print(f"Processed:  {summary['processed']}")
        print(f"Would Send: {summary['sent']}")
        print(f"Skipped:    {summary['skipped']}")
        print(f"Duplicates: {summary['duplicates']}")
        print("=" * 40)
        print("\nDRY RUN — No emails were sent.")
        return 0

    # 4. Confirmation Prompt for Real Sending
    print("\n" + "=" * 50)
    print(f"You are about to send {num_targets} emails.")
    print(f"Sender: {settings.FROM_EMAIL}")
    print(f"Range:  {args.start} - {args.end}")
    print(f"Resume: {resume_path.name}")
    print("Emails will be sent using Gmail SMTP.")
    if args.force:
        print("WARNING: --force is ENABLED. Duplicate checks will be bypassed!")
    print("=" * 50)

    try:
        choice = input("Continue? [y/N]: ").strip().lower()
    except (KeyboardInterrupt, EOFError):
        print("\nOperation cancelled by user.")
        return 0

    if choice not in ("y", "yes"):
        print("Operation cancelled.")
        return 0

    # 5. Real Send Execution
    delay = args.delay if args.delay is not None else settings.RATE_LIMIT_SECONDS
    print(f"\nStarting send operation with {delay}s delay between dispatches...\n")

    db = SessionLocal()
    try:
        summary = execute_outreach(
            start=args.start,
            end=args.end,
            dry_run=False,
            force=args.force,
            delay_seconds=delay,
            db=db
        )
    except Exception as e:
        print(f"\nFatal Error during send operation: {e}", file=sys.stderr)
        return 1
    finally:
        db.close()

    print("\n" + "=" * 40)
    print("SEND SUMMARY")
    print("=" * 40)
    print(f"Processed:  {summary['processed']}")
    print(f"Sent:       {summary['sent']}")
    print(f"Failed:     {summary['failed']}")
    print(f"Skipped:    {summary['skipped']}")
    print(f"Duplicates: {summary['duplicates']}")
    print("=" * 40)

    return 0

def main():
    # Initialize DB tables
    init_db()

    parser = argparse.ArgumentParser(
        description="Local Job Outreach Email Automation Backend CLI"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # contacts subcommand
    p_contacts = subparsers.add_parser("contacts", help="View parsed contacts from PDF")
    p_contacts.add_argument("--start", type=int, default=None, help="Start row (SNo)")
    p_contacts.add_argument("--end", type=int, default=None, help="End row (SNo)")
    p_contacts.add_argument("--show-skipped", action="store_true", help="Print skipped/malformed lines")
    p_contacts.set_defaults(func=cmd_contacts)

    # preview subcommand
    p_preview = subparsers.add_parser("preview", help="Preview rendered emails without sending")
    p_preview.add_argument("--start", type=int, required=True, help="Start row (SNo)")
    p_preview.add_argument("--end", type=int, required=True, help="End row (SNo)")
    p_preview.set_defaults(func=cmd_preview)

    # send subcommand
    p_send = subparsers.add_parser("send", help="Send emails or run dry-run simulation")
    p_send.add_argument("--start", type=int, required=True, help="Start row (SNo)")
    p_send.add_argument("--end", type=int, required=True, help="End row (SNo)")
    p_send.add_argument("--dry-run", action="store_true", help="Simulate without dispatching SMTP emails")
    p_send.add_argument("--force", action="store_true", help="Bypass duplicate checks and send anyway")
    p_send.add_argument("--delay", type=float, default=None, help="Delay in seconds between sends")
    p_send.set_defaults(func=cmd_send)

    args = parser.parse_args()
    return args.func(args)

if __name__ == "__main__":
    sys.exit(main() or 0)
