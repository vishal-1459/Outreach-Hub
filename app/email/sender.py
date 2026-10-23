import os
import smtplib
import socket
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import formatdate, make_msgid
from pathlib import Path
from typing import Optional, Tuple

from app.config import settings
from app.utils.logger import logger
from app.utils.validation import validate_resume_exists, validate_smtp_config

def build_mime_message(
    to_email: str,
    subject: str,
    body_text: str,
    resume_path: Optional[str] = None,
) -> MIMEMultipart:
    """
    Construct a MIME multipart email with personalized body and attached Resume.pdf.
    """
    resume_file = validate_resume_exists(resume_path)

    msg = MIMEMultipart("mixed")
    msg["From"] = f"{settings.SENDER_NAME} <{settings.FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid()

    # Plain text body
    text_part = MIMEText(body_text, "plain", "utf-8")
    msg.attach(text_part)

    # Attach Resume.pdf
    with open(resume_file, "rb") as f:
        pdf_bytes = f.read()

    attachment_filename = resume_file.name
    # Ensure recipient sees "Resume.pdf" if the source has a long name
    if "resume" in attachment_filename.lower():
        display_name = "Resume.pdf"
    else:
        display_name = attachment_filename

    part = MIMEApplication(pdf_bytes, _subtype="pdf")
    part.add_header(
        "Content-Disposition",
        "attachment",
        filename=display_name
    )
    msg.attach(part)

    return msg

class EmailSender:
    """
    SMTP Email Sender managing connection, authentication, and transmission via Gmail SMTP.
    """
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        # Clean spaces from Google App Password if present
        self.password = settings.SMTP_PASSWORD.replace(" ", "").strip() if settings.SMTP_PASSWORD else ""
        self.from_email = settings.FROM_EMAIL
        self.server: Optional[smtplib.SMTP] = None

    def connect(self) -> smtplib.SMTP:
        """Establish STARTTLS connection to SMTP server and authenticate."""
        validate_smtp_config(allow_empty_password=False)
        try:
            server = smtplib.SMTP(self.host, self.port, timeout=30)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(self.user, self.password)
            self.server = server
            return server
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP authentication failed for user {self.user}. Check your Google App Password. Error: {e}"
            logger.error(error_msg)
            raise ConnectionError(error_msg) from e
        except (socket.timeout, TimeoutError) as e:
            error_msg = f"SMTP connection timed out connecting to {self.host}:{self.port}."
            logger.error(error_msg)
            raise TimeoutError(error_msg) from e
        except Exception as e:
            error_msg = f"Failed to connect to SMTP server {self.host}:{self.port}: {e}"
            logger.error(error_msg)
            raise ConnectionError(error_msg) from e

    def close(self):
        """Safely close SMTP connection."""
        if self.server:
            try:
                self.server.quit()
            except Exception:
                try:
                    self.server.close()
                except Exception:
                    pass
            finally:
                self.server = None

    def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        resume_path: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Send a single email. Reconnects automatically if disconnected.
        Returns (success: bool, error_message: Optional[str]).
        """
        try:
            msg = build_mime_message(to_email, subject, body_text, resume_path)
        except Exception as e:
            err = f"Failed to build email message: {e}"
            logger.error(err)
            return False, err

        # Send using connection
        try:
            if not self.server:
                self.connect()

            self.server.send_message(msg)
            return True, None
        except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, socket.error):
            logger.info("SMTP connection was disconnected. Attempting reconnection...")
            try:
                self.close()
                self.connect()
                self.server.send_message(msg)
                return True, None
            except Exception as e:
                err = f"SMTP error after reconnect: {e}"
                logger.error(f"Failed to send email to {to_email}: {err}")
                return False, err
        except Exception as e:
            err = f"SMTP error: {e}"
            logger.error(f"Failed to send email to {to_email}: {err}")
            return False, err

def send_single_message(
    to_email: str,
    subject: str,
    body_text: str,
    resume_path: Optional[str] = None
) -> Tuple[bool, Optional[str]]:
    """Convenience one-off sender function."""
    sender = EmailSender()
    try:
        sender.connect()
        return sender.send_email(to_email, subject, body_text, resume_path)
    finally:
        sender.close()
