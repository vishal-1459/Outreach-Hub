#!/usr/bin/env python3
"""
Generate a comprehensive, visual, process-flow-oriented Architecture and Workflow
Manual for Outreach-Hub in PDF format using ReportLab.
"""
import sys
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class FlowNumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page numbers,
    running headers, and running footers on every page except the cover.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return  # Cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header
        header_text = "OUTREACH-HUB  |  Complete System Process & Execution Workflow Guide"
        self.drawString(54, letter[1] - 36, header_text)

        # Header rule
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Running Footer rule
        self.line(54, 44, letter[0] - 54, 44)

        # Running Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 30, "End-to-End Execution Flow Manual  •  FastAPI + React 18 + SQLite + Gmail SMTP")
        self.drawRightString(letter[0] - 54, 30, f"Page {self._pageNumber} of {total_pages}")

        self.restoreState()

def build_workflow_pdf(filename: str):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Brand Palette
    primary_color = colors.HexColor("#0F172A")    # Deep Navy
    accent_blue = colors.HexColor("#1D4ED8")      # Royal Blue
    secondary_text = colors.HexColor("#334155")   # Slate 700
    card_bg = colors.HexColor("#F8FAFC")          # Slate 50
    border_color = colors.HexColor("#CBD5E1")     # Slate 300
    code_bg = colors.HexColor("#0F172A")          # Dark terminal block

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=primary_color,
        spaceBefore=0,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=accent_blue,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=12,
        textColor=secondary_text,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=12,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor("#E2E8F0")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.4,
        leading=9.8,
        textColor=secondary_text
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=primary_color
    )

    table_cell_code = ParagraphStyle(
        'TableCellCode',
        parent=table_cell_style,
        fontName='Courier',
        fontSize=7.0,
        leading=8.8,
        textColor=colors.HexColor("#094285")
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    )

    story = []

    # ==========================================
    # PAGE 1: COVER & MASTER WORKFLOW MAP
    # ==========================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("OUTREACH-HUB PLATFORM", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=accent_blue)))
    story.append(Paragraph("Complete Process & Execution Workflow Guide", title_style))
    story.append(Paragraph("How Frontend, Backend, PDF Parser, SQLite Database & Gmail SMTP Work Together", subtitle_style))

    # Metadata Table
    meta_data = [
        [
            Paragraph("<b>System Architect:</b> Vishal Yadav", body_style),
            Paragraph("<b>Stack:</b> FastAPI (Python 3.14) + React 18 + Vite", body_style)
        ],
        [
            Paragraph("<b>Target Dataset:</b> 1,842 Contacts (21 Pages PDF)", body_style),
            Paragraph("<b>Safety Model:</b> 100% Local / Zero Cloud AI Leaks", body_style)
        ],
        [
            Paragraph("<b>Outbound Channel:</b> Gmail SMTP STARTTLS (Port 587)", body_style),
            Paragraph("<b>Audit Storage:</b> SQLite Database (`email_sender.db`)", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # Master Workflow Overview Box
    master_diag = """
===================================================================================================
                                MASTER SYSTEM WORKFLOW PIPELINE
===================================================================================================

 [ PHASE 1: BOOT & HEALTH CHECK ]
   FastAPI starts up -> verifies SQLite tables -> Vite starts React dashboard ->
   Navbar begins 10-second heartbeat check (GET /health) -> Status turns GREEN.
                                    |
                                    v
 [ PHASE 2: INGESTION & NORMALIZATION ]
   pdfplumber reads contactInfo.pdf (21 pages) -> extracts 1,842 rows ->
   clean_email_str fixes wrapped emails -> contacts cached in memory (0.2ms lookups).
                                    |
                                    v
 [ PHASE 3: PREVIEW & DUPLICATE INSPECTION ]
   User selects SNo range (e.g. 1-10) -> extract_first_name strips honorifics (Mr., Dr.) ->
   Jinja templates render subject & body -> SQLite checks if already emailed.
                                    |
                                    v
 [ PHASE 4: CAMPAIGN DISPATCH (SAFETY GUARDED) ]
   User clicks "Send" -> 2-Step modal requires confirmation -> POST /send receives confirm:true ->
   Gmail STARTTLS connects -> For each contact: Check SQLite Duplicate -> Send MIME + Resume.pdf ->
   Log 'SENT' in SQLite -> Wait 5.0s rate limit pause.
                                    |
                                    v
 [ PHASE 5: AUDIT, ANALYTICS & UI REFRESH ]
   Execution summary returned -> React state updates -> Dashboard KPI cards increment ->
   Recharts charts refresh -> Logs table shows persistent SQLite audit records.
===================================================================================================
    """
    story.append(Table([[Paragraph(f"<pre>{master_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    # Table of Contents
    story.append(Paragraph("<b>Guide Navigation (10 Core Workflow Modules)</b>", h2_style))
    toc_data = [
        [Paragraph("<b>Phase</b>", table_header_style), Paragraph("<b>Module & Workflow Focus</b>", table_header_style), Paragraph("<b>Page</b>", table_header_style)],
        [Paragraph("1", table_cell_bold), Paragraph("System Boot, Initialization & Real-Time Heartbeat Workflow", table_cell_style), Paragraph("2", table_cell_style)],
        [Paragraph("2", table_cell_bold), Paragraph("PDF Contact Extraction & Multi-Line Cleaning Workflow", table_cell_style), Paragraph("3", table_cell_style)],
        [Paragraph("3", table_cell_bold), Paragraph("Personalization & First-Name Decision Tree Workflow", table_cell_style), Paragraph("4", table_cell_style)],
        [Paragraph("4", table_cell_bold), Paragraph("Core Campaign Execution Engine: The Decision Loop Flowchart", table_cell_style), Paragraph("5", table_cell_style)],
        [Paragraph("5", table_cell_bold), Paragraph("Concrete Step-by-Step Walkthrough: Tracing Real Contacts", table_cell_style), Paragraph("6", table_cell_style)],
        [Paragraph("6", table_cell_bold), Paragraph("The 3-Tier Safety Shield & Dry-Run Simulation Workflow", table_cell_style), Paragraph("7", table_cell_style)],
        [Paragraph("7", table_cell_bold), Paragraph("Frontend Reactive State & UI Data Flow (React 18 + Vite)", table_cell_style), Paragraph("8", table_cell_style)],
        [Paragraph("8", table_cell_bold), Paragraph("SQLite State Machine & Transactional Audit Trail Workflow", table_cell_style), Paragraph("9", table_cell_style)],
        [Paragraph("9", table_cell_bold), Paragraph("Headless CLI Execution Workflow & Operational Diagnostics", table_cell_style), Paragraph("10", table_cell_style)],
    ]
    toc_table = Table(toc_data, colWidths=[40, 425, 39])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.75, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
    ]))
    story.append(toc_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 2: MODULE 1 - SYSTEM BOOT & HEARTBEAT FLOW
    # ==========================================
    story.append(Paragraph("1. System Boot, Initialization & Real-Time Heartbeat Workflow", h1_style))
    story.append(Paragraph(
        "Understanding what happens when Outreach-Hub powers on is essential. The platform is designed to be completely "
        "self-healing and zero-configuration: when you boot the server, all necessary database tables and directory paths "
        "are created automatically before any user requests arrive.",
        body_style
    ))

    boot_diag = """
+----------------------------------------------------------------------------------------------------+
|                                    SYSTEM STARTUP SEQUENCE FLOW                                   |
+----------------------------------------------------------------------------------------------------+

1. BACKEND INITIALIZATION (uvicorn app.main:app --port 8000)
   +-----------------------+     +-----------------------+     +-----------------------+
   | FastAPI Server Starts | --> | Lifespan Startup Hook | --> | init_db() Execution   |
   | Loads app.config      |     | @asynccontextmanager  |     | Checks email_logs tab |
   +-----------------------+     +-----------------------+     +-----------------------+
                                                                           |
                                                                           v
                                                               +-----------------------+
                                                               | CORS Middleware Setup |
                                                               | Allows :5173 origin   |
                                                               +-----------------------+

2. FRONTEND INITIALIZATION (npm run dev on port 5173)
   +-----------------------+     +-----------------------+     +-----------------------+
   | Vite Server Starts    | --> | React App Mounts      | --> | AppLayout Shell Loads |
   | Hot Module Reloading  |     | BrowserRouter mounts  |     | Sidebar + Navbar View |
   +-----------------------+     +-----------------------+     +-----------------------+
                                                                           |
                                                                           v
3. LIVE HEARTBEAT HANDSHAKE (Every 10 Seconds)                             |
   +-----------------------------------------------------------------------+
   | Navbar.jsx fires background ping: Axios GET http://127.0.0.1:8000/health
   | --> Backend verifies: Database connected? Contact PDF found? Resume.pdf found? SMTP set?
   | --> Backend returns: {"status": "healthy", "database": "connected", "total_contacts": 1842}
   | --> Frontend Navbar lights up glowing GREEN badge: "System Online & Operational"
   +--------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{boot_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("What Happens if a Subsystem Fails at Boot?", h2_style))
    story.append(Paragraph(
        "<b>Database:</b> SQLite database (`data/email_sender.db`) is automatically generated if missing. No manual migrations needed.<br/>"
        "<b>Missing Resume.pdf:</b> The `/health` check flags `resume_pdf.exists = False`. The UI turns yellow and prevents real email dispatching until `Resume.pdf` is placed in `backend/`.<br/>"
        "<b>Backend Offline:</b> If FastAPI is stopped, the Navbar heartbeat fails gracefully and displays a red badge: <i>'Backend Offline'</i>.",
        body_style
    ))

    story.append(Paragraph("Dependency Injection Per Request (`get_db`)", h2_style))
    story.append(Paragraph(
        "Every incoming HTTP call to `/health`, `/contacts`, `/preview`, `/send`, or `/logs` injects an independent SQLAlchemy "
        "database session via `db: Session = Depends(get_db)`. When the request completes, FastAPI guarantees the session is "
        "closed in a `finally` block, eliminating SQLite database locks.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 3: MODULE 2 - PDF CONTACT EXTRACTION FLOW
    # ==========================================
    story.append(Paragraph("2. PDF Contact Extraction & Multi-Line Cleaning Workflow", h1_style))
    story.append(Paragraph(
        "Outreach-Hub extracts candidate recruiter directories directly from `contactInfo.pdf` (21 pages, 1,842 contacts). "
        "Because PDF files contain arbitrary spatial layout rather than structured database records, the parser employs a "
        "resilient multi-step cleaning and validation pipeline.",
        body_style
    ))

    pdf_diag = """
+----------------------------------------------------------------------------------------------------+
|                                    PDF EXTRACTION PIPELINE FLOW                                    |
+----------------------------------------------------------------------------------------------------+

1. FILE INGESTION: Open 'contactInfo.pdf' via pdfplumber
   Reads 21 pages sequentially. Check file modification time (mtime).
                                    |
                                    v
2. TABLE STRUCTURE EXTRACTION: page.extract_tables()
   Detects 5-column table: [ SNo | Name | Email | Title | Company ]
   Detects and strips table header rows ("SNo", "Sl No", "#").
                                    |
                                    v
3. THE MULTI-LINE EMAIL WRAPPING REPAIR: clean_email_str()
   Problem: Dense PDF columns wrap long emails across multiple lines:
            "gitanjali.venkatesh@excelenciaconsulting.\\ncom"
   Solution: Aggressively strip '\\r', '\\n', and whitespace ' ':
            --> Becomes: "gitanjali.venkatesh@excelenciaconsulting.com" (100% Valid!)
                                    |
                                    v
4. FALLBACK REGEX ANCHOR PARSER (Safety Net)
   If table borders are missing on any page:
   Scans text using EMAIL_ANCHOR_REGEX: ([a-zA-Z0-9_.+-]+@...\\.[a-zA-Z]{2,})
   Uses detected email position as delimiter to reconstruct SNo, Name, Title, Company.
                                    |
                                    v
5. EMAIL SYNTAX VALIDATION: validate_email()
   Validates RFC compliance. Malformed records are diverted to skipped audit array.
                                    |
                                    v
6. IN-MEMORY CACHING LAYER (_CACHED_CONTACTS)
   First Call: 21 pages parsed in ~10 seconds.
   All Subsequent Calls: Served from memory in 0.2 milliseconds!
+----------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{pdf_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Sample Extracted Record Transformation", h2_style))
    sample_data = [
        [Paragraph("<b>Field</b>", table_header_style), Paragraph("<b>Raw PDF Content (Messy / Wrapped)</b>", table_header_style), Paragraph("<b>Normalized Output (Clean Record)</b>", table_header_style)],
        [Paragraph("<b>SNo</b>", table_cell_bold), Paragraph("<code>\"  394 \"</code>", table_cell_code), Paragraph("<code>394</code> (Integer)", table_cell_style)],
        [Paragraph("<b>Name</b>", table_cell_bold), Paragraph("<code>\"Gitanjali Venkatesh\\n\"</code>", table_cell_code), Paragraph("<code>\"Gitanjali Venkatesh\"</code>", table_cell_style)],
        [Paragraph("<b>Email</b>", table_cell_bold), Paragraph("<code>\"gitanjali.venkatesh@excelenciaconsulting.\\ncom\"</code>", table_cell_code), Paragraph("<code>\"gitanjali.venkatesh@excelenciaconsulting.com\"</code>", table_cell_bold)],
        [Paragraph("<b>Title</b>", table_cell_bold), Paragraph("<code>\"HR - Talent Acquisition\"</code>", table_cell_code), Paragraph("<code>\"HR - Talent Acquisition\"</code>", table_cell_style)],
        [Paragraph("<b>Company</b>", table_cell_bold), Paragraph("<code>\"Excelencia Consulting\\r\\n\"</code>", table_cell_code), Paragraph("<code>\"Excelencia Consulting\"</code>", table_cell_style)]
    ]
    sample_table = Table(sample_data, colWidths=[65, 230, 209])
    sample_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.75, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sample_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 4: MODULE 3 - PERSONALIZATION FLOW
    # ==========================================
    story.append(Paragraph("3. Personalization & First-Name Decision Tree Workflow", h1_style))
    story.append(Paragraph(
        "Generic cold emails are immediately ignored. Outreach-Hub uses a deterministic personalization engine "
        "(`app/email/template.py`) that extracts friendly, natural first names from raw corporate directory listings, "
        "handling honorifics, multi-word names, and single-letter initials.",
        body_style
    ))

    name_diag = """
+----------------------------------------------------------------------------------------------------+
|                               FIRST-NAME EXTRACTION DECISION TREE                                  |
+----------------------------------------------------------------------------------------------------+

                           [ Input: raw_name string ]
                                       |
                                       v
                             Is raw_name empty?
                             /                \\
                       (YES)/                  \\(NO)
                           v                    v
                 [ "Hiring Team" ]    Split into whitespace tokens
                                                |
                                                v
                                 Does token[0] match HONORIFICS?
                                 ("Mr.", "Ms.", "Mrs.", "Dr.", "Prof.")
                                 /                                    \\
                           (YES)/                                      \\(NO)
                               v                                        v
                    Strip matching honorifics                   Keep initial token
                    (e.g. "Dr. Rajesh" -> "Rajesh")                     |
                               |                                        |
                               +-------------------+--------------------+
                                                   |
                                                   v
                                 Is token a single-letter initial?
                                 (e.g. "A." or "A. K. Sharma")
                                 /                           \\
                           (YES)/                             \\(NO)
                               v                               v
                    Keep full cleaned name             Isolate first name & Capitalize
                    ("A. K. Sharma" -> "A. K. Sharma") (e.g. "akanksha puri" -> "Akanksha")
                    Prevents awkward "Hi A,"           Natural greeting: "Hi Akanksha,"
+----------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{name_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("The Jinja-Style Substitution Flow (`render_email`)", h2_style))
    story.append(Paragraph(
        "1. Loads `backend/templates/subject.txt` and `email.txt` from disk.<br/>"
        "2. Assembles context dictionary combining recipient metadata with sender info from `app/config.py`.<br/>"
        "3. Executes case-insensitive regex substitution replacing every `{{Key}}` or `{{ Key }}` token.<br/>"
        "4. Returns fully rendered `(subject, body)` tuple ready for preview or SMTP dispatch.",
        body_style
    ))

    # Substitution Example Table
    sub_data = [
        [Paragraph("<b>Template Placeholder</b>", table_header_style), Paragraph("<b>Context Extraction Rule</b>", table_header_style), Paragraph("<b>Rendered Result Example</b>", table_header_style)],
        [Paragraph("<code>Hi {{Name}},</code>", table_cell_code), Paragraph("First name after honorific stripping", table_cell_style), Paragraph("<code>\"Hi Akanksha,\"</code>", table_cell_bold)],
        [Paragraph("<code>opportunities at {{Company}}</code>", table_cell_code), Paragraph("Normalized company field", table_cell_style), Paragraph("<code>\"opportunities at SourceFuse Technologies\"</code>", table_cell_style)],
        [Paragraph("<code>matching role for {{Title}}</code>", table_cell_code), Paragraph("Normalized title field", table_cell_style), Paragraph("<code>\"matching role for Talent Acquisition\"</code>", table_cell_style)],
        [Paragraph("<code>Best regards, {{SenderName}}</code>", table_cell_code), Paragraph("Configured SENDER_NAME", table_cell_style), Paragraph("<code>\"Best regards, Vishal Yadav\"</code>", table_cell_style)],
        [Paragraph("<code>LinkedIn: {{SenderLinkedIn}}</code>", table_cell_code), Paragraph("Configured SENDER_LINKEDIN", table_cell_style), Paragraph("<code>\"linkedin.com/in/vishal-yadav21\"</code>", table_cell_style)]
    ]
    sub_table = Table(sub_data, colWidths=[140, 184, 180])
    sub_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.75, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sub_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 5: MODULE 4 - THE CAMPAIGN EXECUTION ENGINE
    # ==========================================
    story.append(Paragraph("4. Core Campaign Execution Engine: The Decision Loop Flowchart", h1_style))
    story.append(Paragraph(
        "The centerpiece of Outreach-Hub is the orchestration service (`app/services/outreach.py`). It coordinates "
        "contact slicing, duplicate detection, dry-run simulation, SMTP socket communication, and SQLite audit logging.",
        body_style
    ))

    loop_diag = """
+----------------------------------------------------------------------------------------------------+
|                               CAMPAIGN DISPATCH ORCHESTRATION LOOP                                 |
+----------------------------------------------------------------------------------------------------+

                      [ CALL: execute_outreach(start, end, confirm, force, dry_run) ]
                                                     |
                                                     v
                                  Check Resume.pdf & contactInfo.pdf exist
                                                     |
                                                     v
                                       Validate Range: 1 <= start <= end
                                                     |
                                                     v
                                    Slice target contacts [start ... end]
                                                     |
                                                     v
                                      Is this a REAL send (dry_run=False)?
                                      /                                  \\
                                (YES)/                                    \\(NO)
                                    v                                      v
                         Connect Gmail SMTP (Port 587)              Skip SMTP Connection
                         STARTTLS + Authenticate                    Zero network traffic
                                    |                                      |
                                    +------------------+-------------------+
                                                       |
                                                       v
                                            +======================+
                                            |  FOR EACH CONTACT    |
                                            +======================+
                                                       |
                                                       v
                                            Check SQLite Database:
                                      has_been_sent(db, recipient_email)?
                                      /                                 \\
                        (YES & not force)                             (NO or force)
                                    v                                           v
                         [ DUPLICATE DETECTED! ]                      Render Subject & Body
                         - Log status = 'SKIPPED'                     from Templates
                         - Reason: "Already sent"                               |
                         - summary['duplicates'] += 1                           v
                         - ZERO email sent!                            Is dry_run == True?
                                    |                                  /                 \\
                                    |                            (YES)/                   \\(NO)
                                    |                                v                     v
                                    |                      [ SIMULATION ONLY ]      [ REAL SMTP DISPATCH ]
                                    |                      - Log 'DRY_RUN' in DB    - Build MIME Multipart
                                    |                      - summary['sent'] += 1   - Attach Resume.pdf
                                    |                                |              - sender.send_email()
                                    |                                |              - Log 'SENT' in DB
                                    |                                |              - Sleep 5.0s (Rate Limit)
                                    |                                |                     |
                                    +--------------------------------+---------------------+
                                                                     |
                                                                     v
                                                          More contacts in range?
                                                          /                     \\
                                                    (YES)/                       \\(NO)
                                                        v                         v
                                                 Next Contact             Close SMTP Session
                                                                          Close DB Session
                                                                          Return summary JSON
+----------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{loop_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    story.append(PageBreak())

    # ==========================================
    # PAGE 6: MODULE 5 - CONCRETE STEP-BY-STEP TRACE
    # ==========================================
    story.append(Paragraph("5. Concrete Step-by-Step Walkthrough: Tracing Real Contacts", h1_style))
    story.append(Paragraph(
        "To visualize exactly how the code executes, let's trace a live batch targeting SNo 1, 2, and 3 from `contactInfo.pdf`.",
        body_style
    ))

    story.append(Paragraph("Scenario Setup", h2_style))
    story.append(Paragraph(
        "<b>User Input:</b> Start = 1, End = 3, Dry Run = False, Force = False, Delay = 5.0s, Confirm = True.<br/>"
        "<b>Historical Database State:</b> SNo 2 (`akanksha.sogani@perennialsys.com`) was previously emailed last week (status = 'SENT'). "
        "SNo 1 and SNo 3 have never been contacted.",
        body_style
    ))

    trace_data = [
        [Paragraph("<b>Step & Contact</b>", table_header_style), Paragraph("<b>Engine Actions & Code Path</b>", table_header_style), Paragraph("<b>Outcome & Database Log</b>", table_header_style)],
        [
            Paragraph("<b>Step 1</b><br/>Pre-Flight", table_cell_bold),
            Paragraph("• Verifies <code>Resume.pdf</code> and <code>contactInfo.pdf</code> exist on disk.<br/>• Connects to <code>smtp.gmail.com:587</code> via TLS.<br/>• Authenticates with Google App Password.", table_cell_style),
            Paragraph("SMTP connection established.<br/>Batch ready to begin.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 2</b><br/>SNo 1: Akanksha Puri<br/><code>SourceFuse Tech</code>", table_cell_bold),
            Paragraph("1. Query SQLite: <code>has_been_sent('akanksha.puri@sourcefuse.com')</code> → <b>False</b>.<br/>"
                      "2. <code>extract_first_name()</code> → <code>'Akanksha'</code>.<br/>"
                      "3. Render template: <i>'Hi Akanksha... opportunities at SourceFuse Technologies...'</i><br/>"
                      "4. Construct MIME message & attach <code>Resume.pdf</code> (124 KB).<br/>"
                      "5. SMTP transmits message to Gmail server (Response: <code>250 OK</code>).<br/>"
                      "6. Engine pauses execution for <b>5.0 seconds</b> (Rate Limiter).", table_cell_style),
            Paragraph("<font color='#059669'><b>STATUS: SENT</b></font><br/>"
                      "Record written to SQLite table <code>email_logs</code> with UTC timestamp.<br/>"
                      "<code>summary['sent'] += 1</code>", table_cell_style)
        ],
        [
            Paragraph("<b>Step 3</b><br/>SNo 2: Akanksha Sogani<br/><code>Perennial Systems</code>", table_cell_bold),
            Paragraph("1. Query SQLite: <code>has_been_sent('akanksha.sogani@perennialsys.com')</code> → <b>True!</b><br/>"
                      "2. Evaluates <code>force == False</code>.<br/>"
                      "3. <b>DUPLICATE DETECTED!</b> Dispatch is aborted immediately.<br/>"
                      "4. Zero SMTP communication occurs. No email is sent.<br/>"
                      "5. Rate limit delay is bypassed (no network activity).", table_cell_style),
            Paragraph("<font color='#D97706'><b>STATUS: SKIPPED</b></font><br/>"
                      "Audit record written to SQLite with reason: <i>'Email already sent previously'</i>.<br/>"
                      "<code>summary['duplicates'] += 1</code>", table_cell_style)
        ],
        [
            Paragraph("<b>Step 4</b><br/>SNo 3: iB Hubs Recruiter<br/><code>iB Hubs</code>", table_cell_bold),
            Paragraph("1. Query SQLite: <code>has_been_sent(...)</code> → <b>False</b>.<br/>"
                      "2. Renders personalized email for iB Hubs.<br/>"
                      "3. Constructs MIME container with attached <code>Resume.pdf</code>.<br/>"
                      "4. SMTP transmits message (Response: <code>250 OK</code>).", table_cell_style),
            Paragraph("<font color='#059669'><b>STATUS: SENT</b></font><br/>"
                      "Record written to SQLite.<br/>"
                      "<code>summary['sent'] += 1</code>", table_cell_style)
        ],
        [
            Paragraph("<b>Step 5</b><br/>Teardown & Summary", table_cell_bold),
            Paragraph("• SMTP connection closed cleanly via <code>smtp.quit()</code>.<br/>"
                      "• Scoped database session closed via <code>db.close()</code>.<br/>"
                      "• Returns summary JSON to caller.", table_cell_style),
            Paragraph("<b>Final Summary:</b><br/>Processed: 3 | Sent: 2<br/>Duplicates Blocked: 1 | Failed: 0", table_cell_bold)
        ]
    ]
    trace_table = Table(trace_data, colWidths=[100, 240, 164])
    trace_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.75, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(trace_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 7: MODULE 6 - THE 3-TIER SAFETY SHIELD
    # ==========================================
    story.append(Paragraph("6. The 3-Tier Safety Shield & Dry-Run Simulation Workflow", h1_style))
    story.append(Paragraph(
        "Accidental mass emailing is a critical failure mode in outreach automation. Outreach-Hub implements a 3-tier "
        "defensive architecture ensuring that real emails are NEVER sent without deliberate, double-confirmed human intent.",
        body_style
    ))

    shield_diag = """
+----------------------------------------------------------------------------------------------------+
|                                    THE 3-TIER SAFETY SHIELD ARCHITECTURE                           |
+----------------------------------------------------------------------------------------------------+

  [ TIER 1: FRONTEND SAFETY MODAL (React 18) ]
    Clicking "Start Campaign" does NOT send emails. It pops up an accessible confirmation modal:
    "You are about to send 10 emails. Sender: vishalyadav.it26@gmail.com. Delay: 5.0s."
    The user must explicitly click "Confirm & Send" to proceed.
                                    |
                                    v
  [ TIER 2: BACKEND CONFIRM GUARD (FastAPI routes.py) ]
    if not req.dry_run and not req.confirm:
        raise HTTPException(status_code=400, detail="Safety guard violation: confirm must be true.")
    Even if an external script or curl probes POST /send, it is rejected unless confirm: true is passed.
                                    |
                                    v
  [ TIER 3: INTERACTIVE CLI PROMPT (cli.py) ]
    When running via terminal, the CLI halts and asks:
    "You are about to send X emails using Gmail SMTP. Continue? [y/N]: "
    Pressing Enter or typing anything other than 'y' or 'yes' immediately terminates the process.
+----------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{shield_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Dry-Run Simulation Mode: Zero Risk Testing", h2_style))
    story.append(Paragraph(
        "Dry-Run Mode (`dry_run: true`) is a full behavioral simulation sandbox:",
        body_style
    ))
    dry_features = [
        "<b>Full Ingestion & Slicing:</b> Extracts real contacts from the PDF exactly like a production run.",
        "<b>Template Personalization:</b> Renders every subject and email body and verifies variable replacements.",
        "<b>Duplicate Detection Test:</b> Runs live queries against SQLite to flag contacts that were previously emailed.",
        "<b>Zero SMTP Activity:</b> Does NOT connect to Gmail SMTP. Zero network packets leave your computer.",
        "<b>Audit Trail Recording:</b> Records the simulation in SQLite with status <code>DRY_RUN</code> for verification."
    ]
    for d in dry_features:
        story.append(Paragraph(f"• {d}", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("The Force Override Flag (`force: true`)", h2_style))
    story.append(Paragraph(
        "In rare cases where you intentionally need to re-email a recruiter (e.g. sending an updated resume after several months), "
        "passing `force: true` bypasses the duplicate rejection guard while preserving a permanent audit record of the re-send.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 8: MODULE 7 - FRONTEND REACTIVE DATA FLOW
    # ==========================================
    story.append(Paragraph("7. Frontend Reactive State & UI Data Flow (React 18 + Vite)", h1_style))
    story.append(Paragraph(
        "The React 18 user interface is organized into distinct stateful views that communicate with the FastAPI backend "
        "through an asynchronous service layer (`src/services/api.js`).",
        body_style
    ))

    ui_diag = """
+----------------------------------------------------------------------------------------------------+
|                                  REACT COMPONENT INTERACTION & STATE FLOW                          |
+----------------------------------------------------------------------------------------------------+

  [ AppLayout.jsx ] (Master Shell)
    |-- Sidebar.jsx (Navigation: Dashboard, Contacts, Campaign, Preview, Logs, Diagnostics)
    |-- Navbar.jsx (Heartbeat ping -> GET /health every 10s -> Live green/red status badge)
    |
    +---> [ Dashboard.jsx ]
    |       Fetches: logsService.getLogs(), healthService.checkHealth()
    |       Computes: Total Processed, Successfully Sent, Duplicates Blocked, Failure Rate
    |       Renders: StatCard.jsx, Recharts Campaign Visualizer, Recent Activity Table
    |
    +---> [ ContactsPage.jsx ]
    |       Fetches: contactsService.getContacts(start, end, search)
    |       State: searchTerm (debounced), activeContact (selected for modal inspection)
    |       Renders: 1,842 Contacts Table, Search Input, Modal.jsx with full contact inspector
    |
    +---> [ CampaignPage.jsx ]
    |       Form State: startRow, endRow, delaySeconds, isDryRun, isForce
    |       Safety: Modal.jsx triggers interactive confirmation prior to dispatch
    |       Dispatches: outreachService.sendOutreach() -> Displays AlertBanner with result summary
    |
    +---> [ PreviewPage.jsx ]
    |       State: previewStart, previewEnd, previewList
    |       Dispatches: outreachService.getPreview() -> Renders exact rendered email copies
    |       Badging: Shows "ALREADY SENT" badge if recipient was previously emailed
    |
    +---> [ LogsPage.jsx ]
            Fetches: logsService.getLogs(limit, offset)
            Features: Chronological audit history, status badges, CSV download export button
+----------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{ui_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Centralized Error Unwrapping Interceptor", h2_style))
    story.append(Paragraph(
        "In `src/services/api.js`, an Axios response interceptor unwraps all backend errors before they hit component code:<br/>"
        "• <b>FastAPI Detail Strings:</b> If backend throws `HTTPException(400, detail='Error message')`, it extracts the string directly.<br/>"
        "• <b>Pydantic Validation Arrays:</b> If input fails schema checks, it joins all field violation strings.<br/>"
        "• <b>Connection Failures:</b> If FastAPI is stopped, it alerts: <i>'Cannot connect to backend server on 127.0.0.1:8000'</i>.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 9: MODULE 8 - SQLITE STATE MACHINE & AUDIT TRAIL
    # ==========================================
    story.append(Paragraph("8. SQLite State Machine & Transactional Audit Trail Workflow", h1_style))
    story.append(Paragraph(
        "Persistence in Outreach-Hub is managed by an embedded SQLite database (`backend/data/email_sender.db`). "
        "The system acts as a state machine where every attempted outreach record transitions into one of four immutable states.",
        body_style
    ))

    state_diag = """
+----------------------------------------------------------------------------------------------------+
|                                 SQLITE AUDIT LOG STATE TRANSITIONS                                 |
+----------------------------------------------------------------------------------------------------+

                                      [ Outreach Attempt Triggered ]
                                                    |
                         +--------------------------+--------------------------+
                         |                                                     |
                 (dry_run == True)                                     (dry_run == False)
                         |                                                     |
                         v                                                     v
                 [ STATUS: DRY_RUN ]                               Duplicate check in SQLite:
                 Simulated run logged                              has_been_sent(email)?
                 Zero emails sent                                  /                   \\
                                                             (YES)/                     \\(NO)
                                                                 v                       v
                                                        [ STATUS: SKIPPED ]      SMTP Send Initiated
                                                        Reason: Duplicate        /                 \\
                                                        Zero emails sent   (Success)/               \\(Failure)
                                                                                   v                 v
                                                                           [ STATUS: SENT ]   [ STATUS: FAILED ]
                                                                           Recorded in DB     Error message logged
                                                                           Blocks future dups Can be retried
+----------------------------------------------------------------------------------------------------+
    """
    story.append(Table([[Paragraph(f"<pre>{state_diag.strip()}</pre>", code_style)]], colWidths=[504], style=[
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('BOX', (0, 0), (-1, -1), 1, primary_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("The Four Immutable Audit States", h2_style))
    states_data = [
        [Paragraph("<b>Status Code</b>", table_header_style), Paragraph("<b>Trigger Condition</b>", table_header_style), Paragraph("<b>Impact on Future Outreaches</b>", table_header_style)],
        [
            Paragraph("<b>SENT</b>", table_cell_bold),
            Paragraph("Email successfully accepted by Gmail SMTP server (code 250).", table_cell_style),
            Paragraph("<b>Blocks future sends.</b> Recipient will be SKIPPED in all future campaigns unless <code>force: true</code> is passed.", table_cell_style)
        ],
        [
            Paragraph("<b>SKIPPED</b>", table_cell_bold),
            Paragraph("Recipient email was found in SQLite with prior SENT status.", table_cell_style),
            Paragraph("Audited with reason string. Zero emails sent. Does not affect prior SENT records.", table_cell_style)
        ],
        [
            Paragraph("<b>DRY_RUN</b>", table_cell_bold),
            Paragraph("Campaign executed in simulation mode (`dry_run: true`).", table_cell_style),
            Paragraph("Audited for verification. <b>Does NOT block</b> future live sends (only SENT status blocks).", table_cell_style)
        ],
        [
            Paragraph("<b>FAILED</b>", table_cell_bold),
            Paragraph("SMTP rejected connection, invalid recipient, or network drop.", table_cell_style),
            Paragraph("Full error string saved. <b>Does NOT block</b> future sends; can be retried immediately.", table_cell_style)
        ]
    ]
    states_table = Table(states_data, colWidths=[70, 214, 220])
    states_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.75, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(states_table)

    story.append(PageBreak())

    # ==========================================
    # PAGE 10: MODULE 9 - CLI & OPERATIONAL MANUAL
    # ==========================================
    story.append(Paragraph("9. Headless CLI Execution Workflow & Operational Diagnostics", h1_style))
    story.append(Paragraph(
        "For power users, scripts, or automated environments, the entire platform can be driven directly via `backend/cli.py` "
        "without starting a web browser or running a frontend server.",
        body_style
    ))

    story.append(Paragraph("Recommended Daily Outreach Operational Routine", h2_style))
    routine_steps = [
        "<b>Phase 1 (System Diagnostic):</b> Run <code>python cli.py health</code> to confirm SQLite connectivity, PDF presence (1,842 contacts), and Gmail App Password authentication.",
        "<b>Phase 2 (Inspect Targets):</b> Run <code>python cli.py contacts --search \"SourceFuse\"</code> or view rows <code>--start 1 --end 10</code>.",
        "<b>Phase 3 (Preview Personalization):</b> Run <code>python cli.py preview --start 1 --end 5</code> to inspect the exact rendered subject and body text.",
        "<b>Phase 4 (Safe Simulation):</b> Run <code>python cli.py send --start 1 --end 5 --dry-run</code>. Verify the dry-run summary indicates zero errors.",
        "<b>Phase 5 (Live Dispatch):</b> Run <code>python cli.py send --start 1 --end 5</code>. Review the interactive warning and press <code>y</code> to confirm.",
        "<b>Phase 6 (Audit Review):</b> Run <code>python cli.py logs --limit 10</code> to confirm all records are saved as <code>SENT</code> in SQLite."
    ]
    for r in routine_steps:
        story.append(Paragraph(f"• {r}", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Fast Diagnostic & Troubleshooting Cheat Sheet", h2_style))
    troubles = [
        "<b>SMTP Authentication Error (535 5.7.8):</b> Your Gmail account requires 2-Step Verification and a 16-character App Password (not your personal password). Set <code>SMTP_PASSWORD</code> in <code>backend/.env</code>.",
        "<b>Resume.pdf Missing Error:</b> The email dispatcher strictly requires <code>backend/Resume.pdf</code> to exist before dispatching. Ensure your resume PDF is located in the <code>backend/</code> directory.",
        "<b>Port 8000 Already in Use:</b> A background FastAPI process is already running. Check running tasks or kill PID using <code>Get-NetTCPConnection -LocalPort 8000</code> in PowerShell.",
        "<b>Recipient Marked SKIPPED:</b> Recipient has already received an email according to SQLite records. If you intentionally want to re-contact them, pass <code>--force</code> in CLI or toggle Force in the web UI."
    ]
    for t in troubles:
        story.append(Paragraph(f"• {t}", bullet_style))
    story.append(Spacer(1, 8))

    # Author Signoff Box
    sign_text = (
        "<b>Outreach-Hub Workflow & Architecture Engineering Manual</b><br/>"
        "Engineered for high performance, deterministic behavior, and complete local privacy.<br/>"
        "Built by <b>Vishal Yadav</b> (Full Stack Developer)  •  Jaipur, Rajasthan  •  github.com/vishal-1459"
    )
    sign_table = Table([[Paragraph(sign_text, callout_style)]], colWidths=[504])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sign_table)

    # Build the document
    doc.build(story, canvasmaker=FlowNumberedCanvas)
    print(f"Successfully generated Workflow PDF: {filename}")

if __name__ == "__main__":
    out_pdf = "Outreach_Hub_Architecture_and_Workflow_Guide.pdf"
    build_workflow_pdf(out_pdf)
