# Local Job Outreach Email Automation Backend

A 100% local, privacy-first, deterministic job outreach email automation backend built with **Python 3.14+**, **FastAPI**, **SQLite / SQLAlchemy**, and a robust **CLI**.

This application runs entirely on your local machine. It does **NOT** upload contact data, resume files, or outreach history to any external AI service, third-party email generator, or cloud database. The only external network interaction is the direct TLS connection to **Gmail SMTP** when sending outgoing emails.

---

## 📁 Project Architecture

```
Placemnt/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entrypoint & lifespan
│   ├── config.py                # Environment configuration (Pydantic settings)
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py            # API routes: /, /health, /contacts, /preview, /send, /logs
│   ├── pdf/
│   │   ├── __init__.py
│   │   └── parser.py            # PDF parser: table extraction + email anchor fallback
│   ├── email/
│   │   ├── __init__.py
│   │   ├── sender.py            # SMTP dispatch, STARTTLS, MIME, PDF attachment
│   │   └── template.py          # Personalized first-name logic & template rendering
│   ├── database/
│   │   ├── __init__.py
│   │   ├── database.py          # SQLite engine & session management
│   │   └── models.py            # EmailLog model & duplicate prevention queries
│   ├── services/
│   │   ├── __init__.py
│   │   └── outreach.py          # Orchestration service shared by CLI and API
│   └── utils/
│       ├── __init__.py
│       ├── logger.py            # Standard Python logger (console + logs/outreach.log)
│       └── validation.py        # Email, range, file existence, and SMTP validators
├── data/
│   └── email_sender.db          # SQLite database (auto-created on startup)
├── templates/
│   ├── email.txt                # Configurable email body template
│   └── subject.txt              # Configurable email subject template
├── logs/
│   └── outreach.log             # Timestamped application logs
├── tests/
│   ├── __init__.py
│   ├── test_api.py              # FastAPI endpoint tests & safety checks
│   ├── test_database.py         # Duplicate prevention & DB model tests
│   ├── test_parser.py           # 1842-contact PDF parser & email cleaner tests
│   └── test_template.py         # Name personalization & template renderer tests
├── contactInfo.pdf              # HR contacts PDF (1,842 contacts, 21 pages)
├── Resume.pdf                   # Vishal Yadav's resume attachment
├── cli.py                       # Command-line interface
├── requirements.txt             # Python dependencies
├── .env.example                 # Example environment configuration
├── .env                         # Local environment configuration (do NOT commit)
├── .gitignore                   # Git ignore for credentials, db, cache, logs
└── README.md                    # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Python 3.11+** (Tested on Python 3.14)
- PowerShell or Terminal

### 2. Create and Activate Virtual Environment

```powershell
# In project root:
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1

# Linux / macOS:
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy the sample `.env.example` file:
```powershell
copy .env.example .env
```

Open `.env` and fill in your details:
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vishalyadav.it26@gmail.com
SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
FROM_EMAIL=vishalyadav.it26@gmail.com

# Database & File Paths
DATABASE_URL=sqlite:///./data/email_sender.db
CONTACT_PDF=./contactInfo.pdf
RESUME_PDF=./Resume.pdf

# Automation Settings
RATE_LIMIT_SECONDS=5

# Sender Profile
SENDER_NAME=Vishal Yadav
SENDER_TITLE=Full Stack Developer
SENDER_PHONE=+91-7838726190
SENDER_LOCATION=Jaipur, Rajasthan
SENDER_LINKEDIN=linkedin.com/in/vishal-yadav21
SENDER_GITHUB=github.com/vishal-1459
```

---

## 🔑 How to Generate a Gmail App Password

Google does **NOT** allow sending emails via standard account passwords when 2-Step Verification is enabled. You must generate a dedicated **16-character Google App Password**:

1. Go to your **Google Account**: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Navigate to **Security** (on the left menu).
3. Under **"How you sign in to Google"**, ensure **2-Step Verification** is turned **ON**.
4. In the search bar at the top of Google Account, search for **"App passwords"** (or go directly to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
5. Under **"App name"**, enter: `EmailSender Backend` or `Placemnt`.
6. Click **Create**.
7. Google will display a 16-letter passcode (e.g. `abcd efgh ijkl mnop`).
8. Copy this passcode and paste it into `.env` as `SMTP_PASSWORD`:
   ```env
   SMTP_PASSWORD=abcdefghijklmnop
   ```
   *(You can omit spaces or include them; standard practice is without spaces).*

> [!WARNING]
> **Never commit `.env` or your App Password to Git.** `.env` is listed in `.gitignore`.

---

## 💻 CLI Commands

### 1. View Contacts
Parse and display contacts directly from the PDF in a clean tabular format:
```bash
# View first 20 contacts
python cli.py contacts --start 1 --end 20

# View all 1842 contacts
python cli.py contacts
```

Output includes:
```
=========================================================================================================
SNo    | Name                     | Email                              | Title                            | Company
---------------------------------------------------------------------------------------------------------
1      | Akanksha Puri            | akanksha.puri@sourcefuse.com       | Associate Director HR            | SourceFuse Technologies
2      | Akanksha Sogani          | akanksha.sogani@perennialsys.com   | Head HR                          | Perennial Systems
3      | Akhil Jogiparthi         | akhil@ibhubs.co                    | Vice President - Talent Accelera | iB Hubs
...
=========================================================================================================
Contacts displayed: 20 (Range: 1 - 20)
Total contacts: 1842
Valid contacts: 1842
Invalid/skipped: 0
```

### 2. Preview Mode (Zero Risk)
Preview rendered subject lines and personalized email bodies without sending anything. Does not require an SMTP connection or password.
```bash
python cli.py preview --start 1 --end 3
```

Example Output:
```
--------------------------------------------------------------------------------
SNo:       1
Recipient: Akanksha Puri
Email:     akanksha.puri@sourcefuse.com
Company:   SourceFuse Technologies
Title:     Associate Director HR
Subject:   Application for Software Developer / Full Stack Developer Opportunity — Vishal Yadav
Body:
Hi Akanksha,

I’m Vishal Yadav, an aspiring Full Stack Developer currently pursuing a Bachelor of Technology in Information Technology at Jaipur Engineering College and Research Center Foundation. I have hands-on experience building web applications using React.js, Node.js, Express.js, Python, FastAPI, RESTful APIs, and databases such as MongoDB and MySQL. I also completed a Full Stack Developer internship at Neuro-Sharp Software Pvt. Ltd., where I worked on responsive web interfaces and reusable React.js components.

I’m reaching out to explore Software Developer or Full Stack Developer opportunities at SourceFuse Technologies. I’ve attached my resume for your consideration, and I’d be grateful for the opportunity to connect if there is a relevant opening that matches my profile.

Best regards,
Vishal Yadav
Full Stack Developer
Jaipur, Rajasthan
Email: vishalyadav.it26@gmail.com
LinkedIn: linkedin.com/in/vishal-yadav21
GitHub: github.com/vishal-1459
--------------------------------------------------------------------------------
```

### 3. Dry Run Simulation
Tests contact resolution, email validation, duplicate checks, and verifies `Resume.pdf` existence without dispatching any emails:
```bash
python cli.py send --start 1 --end 10 --dry-run
```

Output:
```
========================================
DRY RUN MODE — Processing SNo 1 to 10 (10 contacts)
Resume attachment verified: Resume.pdf
========================================

========================================
DRY RUN SUMMARY
========================================
Processed:  10
Would Send: 10
Skipped:    0
Duplicates: 0
========================================

DRY RUN — No emails were sent.
```

### 4. Real Send (Interactive Safety Confirmation)
Initiates real email sending via Gmail SMTP. Prompts for explicit interactive confirmation before any transmission:
```bash
python cli.py send --start 1 --end 10
```

Confirmation Prompt:
```
==================================================
You are about to send 10 emails.
Sender: vishalyadav.it26@gmail.com
Range:  1 - 10
Resume: Resume.pdf
Emails will be sent using Gmail SMTP.
==================================================
Continue? [y/N]:
```
Only typing `y` or `yes` will proceed; any other key cancels immediately.

### 5. Duplicate Prevention & `--force`
If a recipient was already successfully sent an email in any prior run, it is automatically skipped:
```
Skipping duplicate: akanksha.puri@sourcefuse.com (Reason: Email already sent previously)
```

To explicitly override duplicate prevention and resend:
```bash
python cli.py send --start 1 --end 10 --force
```

### 6. Custom Rate Limiting Delay
To modify the delay between successive email dispatches:
```bash
python cli.py send --start 1 --end 10 --delay 10
```

---

## 🚀 Running FastAPI Server

Start the local server with Uvicorn:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive OpenAPI Documentation (Swagger UI):
- Open **http://127.0.0.1:8000/docs** in your browser.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service health & available endpoints |
| `GET` | `/health` | System status, database check, contact & resume presence |
| `GET` | `/contacts?start=1&end=20` | Structured JSON list of parsed contacts with search |
| `POST` | `/preview` | Rendered email previews for a range |
| `POST` | `/send` | Dispatch emails (requires `{"confirm": true}` safety flag) |
| `GET` | `/logs?limit=50` | Outreach history and status logs from SQLite |

#### Example: `POST /send` Payload
```json
{
  "start": 1,
  "end": 5,
  "confirm": true,
  "force": false,
  "dry_run": false,
  "delay_seconds": 5
}
```

> [!IMPORTANT]
> The `/send` API endpoint rejects any request where `"dry_run": false` and `"confirm": false` with a `400 Bad Request` safety violation.

---

## 🔒 Duplicate Prevention & SQLite Database

The application uses **SQLite** located at `data/email_sender.db`.

### Database Schema (`email_logs`)
- `id`: Integer Primary Key
- `recipient_email`: String (indexed, normalized to lowercase)
- `name`: Recipient contact name
- `company`: Target organization name
- `title`: HR / Recruiter job title
- `timestamp`: ISO UTC timestamp
- `status`: `SENT`, `FAILED`, `SKIPPED`, `DRY_RUN`
- `error_message`: Error details if failed or skipped
- `subject`: Rendered email subject line

### Duplicate Logic
Before each email is sent:
```sql
SELECT 1 FROM email_logs WHERE LOWER(recipient_email) = LOWER(:email) AND status = 'SENT';
```
If a record exists, sending is aborted with status `SKIPPED` unless `--force` is provided.

---

## 📝 Template Personalization

Email templates are located outside the application code:
- **`templates/email.txt`**: Email body template
- **`templates/subject.txt`**: Email subject line template

### Available Variables
- `{{Name}}`: Personalized first name (e.g., "Akanksha Puri" $\rightarrow$ "Akanksha")
- `{{FullName}}`: Full original name
- `{{Company}}`: Target company name
- `{{Title}}`: Recipient title
- `{{Email}}`: Recipient email address
- `{{SenderName}}`: Vishal Yadav
- `{{SenderTitle}}`: Full Stack Developer
- `{{SenderEmail}}`: vishalyadav.it26@gmail.com
- `{{SenderPhone}}`: +91-7838726190
- `{{SenderLocation}}`: Jaipur, Rajasthan
- `{{SenderLinkedIn}}`: linkedin.com/in/vishal-yadav21
- `{{SenderGitHub}}`: github.com/vishal-1459

### Name Personalization Rules
1. Strip leading honorifics (`Mr.`, `Ms.`, `Mrs.`, `Dr.`, `Prof.`).
2. Single-word names (`"Akriti"`) $\rightarrow$ `"Akriti"`.
3. Two+ word names (`"Akanksha Puri"`) $\rightarrow$ `"Akanksha"`.
4. Single-letter initials (`"A. K. Sharma"`) safely fall back to `"A. K. Sharma"` rather than `"A"`.
5. Empty / missing names fall back to `"Hiring Team"`.

---

## 📄 PDF Parser & Layout Handling

1. **Table Extraction**: `pdfplumber.extract_tables()` extracts all 21 pages and 1,842 contacts.
2. **Wrapped Multi-Line Emails**: The parser strips internal newlines (`\n`) and whitespace from email fields (e.g. SNo 394 `gitanjali.venkatesh@excelenciaconsulting.\ncom`), ensuring 100% valid email addresses.
3. **Fallback Anchor**: If table borders are absent on any page, the parser automatically switches to an email-regex anchor fallback parser.
4. **Resilience**: Malformed rows are logged to `logs/outreach.log` and skipped without crashing the application.

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
python -m pytest tests/ -v
```

All 15 unit and integration tests verify:
- Complete parsing of 1,842 contacts from `contactInfo.pdf`
- Multi-line email reconstruction
- Safe first-name extraction & fallback logic
- Template variable replacement
- SQLite duplicate prevention & log recording
- FastAPI endpoints, safety guards, and dry-run execution



// 850 
