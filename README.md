# ⚡ Outreach-Hub

> **Local Personal Job Outreach Email Automation Full-Stack Platform**  
> Powered by **FastAPI**, **SQLite / SQLAlchemy**, **React.js 18**, **Vite**, and **Tailwind CSS**.

Outreach-Hub is a 100% local, privacy-first full-stack application designed to parse recruiter and HR directories from PDF documents, generate personalized outreach emails, enforce strict duplicate-prevention safeguards via SQLite, and dispatch cold emails with your attached resume via Gmail SMTP.

---

## 🌟 Key Highlights & Features

- **🔒 100% Privacy-Preserved & Local**: Runs entirely on your local machine. No candidate records, contact databases, or resume files are transmitted to external AI cloud services or third-party databases. The only outbound connection is direct STARTTLS to Gmail SMTP during confirmed sending.
- **📄 Automated PDF Contact Parsing**: Extracts 1,842 verified HR and recruiter contacts across 21 pages (`contactInfo.pdf`) using `pdfplumber` with fallback text anchoring. Automatically reconstructs multi-line emails, strips unwanted whitespace, and normalizes contact records.
- **🎯 Deterministic Personalization Engine**: Smart first-name extractor strips honorifics (`Mr.`, `Ms.`, `Mrs.`, `Dr.`), handles single and multi-word names, and injects personalized placeholders (`{{Name}}`, `{{Company}}`, `{{Title}}`, `{{SenderName}}`, `{{SenderLinkedIn}}`, etc.).
- **🛡️ SQLite Duplicate Guard**: Prevents re-contacting recipients who have already received an email (`status = 'SENT'`) unless `--force` or `force: true` is explicitly provided.
- **🧪 Safe Dry Run Simulation Mode**: Simulates the full outreach workflow end-to-end, validates template rendering, logs outcomes to SQLite, and guarantees zero SMTP side-effects.
- **🚨 Double-Confirmation Safety Guards**: The backend rejects any real email dispatch without an explicit `"confirm": true` flag (`400 Bad Request` safety violation).
- **⏱️ Configurable Rate Limiting**: Enforces customizable per-email dispatch delays (default: 5.0 seconds) to prevent Gmail SMTP rate limit tripping and spam scoring.
- **💻 Full CLI & Modern React Frontend**: Operate via a comprehensive terminal CLI (`cli.py`) or through a high-performance web dashboard with live analytics, table search, batch email previewing, log auditing, and system diagnostics.

---

## 🏗️ Repository Architecture

```
Outreach-Hub/
├── backend/                                # FastAPI Backend Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                         # FastAPI app entrypoint, CORS & lifespan management
│   │   ├── config.py                       # Pydantic BaseSettings & centralized environment configuration
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py                   # REST endpoints: /, /health, /contacts, /preview, /send, /logs
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── database.py                 # SQLite engine & session management
│   │   │   └── models.py                   # EmailLog SQLAlchemy model & duplicate query helpers
│   │   ├── email/
│   │   │   ├── __init__.py
│   │   │   ├── sender.py                   # SMTP dispatch, STARTTLS, MIME multipart, PDF attachments
│   │   │   └── template.py                 # Jinja-style template rendering & honorific name logic
│   │   ├── pdf/
│   │   │   ├── __init__.py
│   │   │   └── parser.py                   # 21-page PDF contact extractor & email cleaner
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── outreach.py                 # Core orchestration service for API and CLI
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logger.py                   # Rotating console & file logger (logs/outreach.log)
│   │       └── validation.py               # Email, range, file existence, and SMTP validators
│   ├── data/
│   │   └── email_sender.db                 # SQLite persistent audit database
│   ├── logs/
│   │   └── outreach.log                    # Timestamped execution log file
│   ├── templates/
│   │   ├── email.txt                       # Customizable email body template
│   │   └── subject.txt                     # Customizable email subject template
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py                     # FastAPI endpoint tests & safety checks
│   │   ├── test_database.py                # Duplicate prevention & DB model tests
│   │   ├── test_parser.py                  # PDF parser & email cleaner tests
│   │   └── test_template.py                # Name personalization & template renderer tests
│   ├── contactInfo.pdf                     # Source HR directory (1,842 contacts)
│   ├── Resume.pdf                          # Resume attachment file
│   ├── cli.py                              # Command-line interface
│   ├── requirements.txt                    # Python dependencies
│   ├── .env.example                        # Backend environment template
│   └── .env                                # Local backend configuration (ignored by git)
│
├── frontend/                               # React + Vite Frontend Application
│   ├── public/
│   │   └── vite.svg                        # Platform icon
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AlertBanner.jsx             # Notification & warning alert cards
│   │   │   ├── Badge.jsx                   # Color-coded status badge indicators
│   │   │   ├── EmptyState.jsx              # Reusable empty states with actions
│   │   │   ├── LoadingSkeleton.jsx         # Card & table loading skeleton placeholders
│   │   │   ├── Modal.jsx                   # Accessible modal dialog with backdrop
│   │   │   └── StatCard.jsx                # Metric stat card with icons & trends
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx               # Main application shell with heartbeat ping
│   │   │   ├── Navbar.jsx                  # Top navigation with live status badges
│   │   │   └── Sidebar.jsx                 # Dark-navy sidebar navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx               # Analytics KPIs, Recharts graphs, quick launch
│   │   │   ├── ContactsPage.jsx            # 1,842 contacts table, search, modal inspector
│   │   │   ├── CampaignPage.jsx            # Outreach dispatcher, dry-run toggle, safety guards
│   │   │   ├── PreviewPage.jsx             # Full email drafts & duplicate checks
│   │   │   ├── LogsPage.jsx                # SQLite audit history, search, CSV export
│   │   │   └── DiagnosticsPage.jsx         # Live system diagnostic & variable reference
│   │   ├── services/
│   │   │   └── api.js                      # Centralized Axios client & API endpoints
│   │   ├── utils/
│   │   │   └── formatters.js               # Date, relative time, and badge formatters
│   │   ├── App.jsx                         # React Router routes
│   │   ├── main.jsx                        # React root mount
│   │   └── index.css                       # Tailwind CSS directives & custom styling
│   ├── index.html                          # HTML shell
│   ├── package.json                        # Frontend dependencies & scripts
│   ├── vite.config.js                      # Vite build & proxy configuration
│   ├── tailwind.config.js                  # Tailwind configuration
│   ├── postcss.config.js                   # PostCSS configuration
│   ├── .env.example                        # Frontend environment template
│   └── .env                                # Local frontend configuration
│
├── .gitignore                              # Root gitignore for backend & frontend
└── README.md                               # Project documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | FastAPI (Python 3.11+) |
| **Server Engine** | Uvicorn ASGI Server |
| **Database & ORM** | SQLite & SQLAlchemy |
| **PDF Extraction** | pdfplumber, pypdf |
| **Validation** | Pydantic v2 & Pydantic-Settings |
| **Backend Testing** | Pytest, HTTPX TestClient (15/15 tests passing) |
| **Frontend Framework** | React.js 18 & Vite |
| **UI & Styling** | Tailwind CSS (Slate / Dark-Navy SaaS aesthetic) |
| **Routing** | React Router DOM v6 |
| **Icons & Charts** | Lucide React, Recharts |
| **HTTP Client** | Axios with centralized error unwrapping |

---

## ⚙️ Installation & Setup

### Prerequisites

- **Python 3.11+** installed (tested on Python 3.14)
- **Node.js 18+** & **npm** installed (tested on Node v24)
- A Gmail account with an **App Password** (required only for live email dispatch)

---

### Step 1: Backend Setup

Open a terminal in the `backend/` directory:

```bash
cd backend

# 1. Create a virtual environment (optional but recommended)
python -m venv .venv

# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
# Copy .env.example to .env and configure your SMTP credentials
cp .env.example .env
```

#### Backend Environment Variables (`backend/.env`):

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_digit_app_password
FROM_EMAIL=your_email@gmail.com

RATE_LIMIT_SECONDS=5.0

# Sender Metadata
SENDER_NAME="Vishal Yadav"
SENDER_TITLE="Full Stack Developer"
SENDER_PHONE="+91-7838726190"
SENDER_LOCATION="Jaipur, Rajasthan"
SENDER_LINKEDIN="linkedin.com/in/vishal-yadav21"
SENDER_GITHUB="github.com/vishal-1459"
```

> [!TIP]
> **How to generate a Gmail App Password:**
> 1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
> 2. Ensure **2-Step Verification** is turned ON.
> 3. Search for **App passwords** (or navigate to Security → 2-Step Verification → App passwords).
> 4. Create a new App Password named `Outreach-Hub` and paste the 16-character code into `SMTP_PASSWORD` (without spaces).

#### Start the FastAPI Server:

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

The backend will start at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

### Step 2: Frontend Setup

Open a second terminal in the `frontend/` directory:

```bash
cd frontend

# 1. Install frontend dependencies
npm install

# 2. Configure environment variable (points to FastAPI backend)
cp .env.example .env

# 3. Start the Vite development server
npm run dev
```

The React frontend will be accessible at:
- **Web UI**: `http://localhost:5173`

To build the frontend for production:
```bash
cd frontend
npm run build
```

---

## 📝 Email Templates & Personalization

Outreach-Hub uses Jinja-style variable substitution for dynamically rendering subjects and bodies:

- **Subject Template**: Located at `backend/templates/subject.txt`
- **Body Template**: Located at `backend/templates/email.txt`

### Supported Placeholders

| Variable | Description | Example Replacement |
|---|---|---|
| `{{Name}}` | Cleaned recipient first name (honorifics stripped) | `Akanksha` (from `Ms. Akanksha Sogani`) |
| `{{Company}}` | Recipient's target company | `Perennial Systems` |
| `{{Title}}` | Recipient's job title | `Head HR` |
| `{{SenderName}}` | Configured sender full name | `Vishal Yadav` |
| `{{SenderTitle}}` | Configured sender title | `Full Stack Developer` |
| `{{SenderPhone}}` | Configured sender phone | `+91-7838726190` |
| `{{SenderLocation}}` | Configured sender location | `Jaipur, Rajasthan` |
| `{{SenderLinkedIn}}` | Configured LinkedIn handle or URL | `linkedin.com/in/vishal-yadav21` |
| `{{SenderGitHub}}` | Configured GitHub handle or URL | `github.com/vishal-1459` |

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service metadata, status, author, and endpoint index |
| `GET` | `/health` | Complete system health, database status, PDF & SMTP verification |
| `GET` | `/contacts?start=1&end=20&search=...` | Paginated and filtered recruiter contacts from PDF |
| `POST` | `/preview` | Generates personalized email previews without sending |
| `POST` | `/send` | Executes outreach campaign (requires `confirm: true` or `dry_run: true`) |
| `GET` | `/logs?limit=50&offset=0` | Retrieves persistent outreach history from SQLite |

#### Example: `POST /send` Payload
```json
{
  "start": 1,
  "end": 5,
  "confirm": true,
  "force": false,
  "dry_run": false,
  "delay_seconds": 5.0
}
```

> [!IMPORTANT]
> **Safety Guard**: The backend automatically rejects any request where `dry_run: false` and `confirm: false` with a `400 Bad Request` safety violation to prevent unintended dispatches.

---

## 💻 CLI Usage

You can operate Outreach-Hub directly from your terminal using the Python CLI:

```bash
cd backend

# 1. View system diagnostics and health
python cli.py health

# 2. View parsed contacts (default first 20)
python cli.py contacts --start 1 --end 20

# 3. Search contacts by name, company, title, or email
python cli.py contacts --search "Perennial"

# 4. Preview personalized emails without sending
python cli.py preview --start 1 --end 5

# 5. Safe simulation (Dry Run — zero SMTP side-effects)
python cli.py send --start 1 --end 5 --dry-run

# 6. Real email dispatch (prompts with interactive [y/N] confirmation)
python cli.py send --start 1 --end 5

# 7. Force resending to already contacted recipients
python cli.py send --start 1 --end 5 --force

# 8. View execution and audit logs from SQLite
python cli.py logs --limit 25
```

---

## 🧪 Testing & Verification

Run the automated test suite from the `backend/` directory:

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage (15/15 passing):
1. **API Endpoints**: Root, Health, Contacts pagination/filtering, Preview rendering, Send safety guards, Dry-run execution.
2. **Database & Safety**: Duplicate prevention logic, transactional logging, state queries.
3. **PDF Parser**: Multi-line email reconstruction, space stripping, full 1,842 extraction.
4. **Template & Name Engine**: Honorific stripping (`Mr.`, `Dr.`, `Ms.`), single/multi-word name parsing, variable substitution.

---

## 🛡️ Security & Privacy

- **Zero Cloud AI Leakage**: Recipient details and resume documents remain 100% on your machine.
- **STARTTLS Encryption**: All outgoing email connections use TLS encryption on port 587.
- **Git Protection**: `.gitignore` strictly prevents database files (`*.db`), log files (`*.log`), and `.env` credentials from being committed.
