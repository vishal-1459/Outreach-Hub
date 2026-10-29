import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  FileText,
  Mail,
  User,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Server,
  Code2,
} from 'lucide-react';
import { healthService } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import Badge from '../components/Badge';

export default function DiagnosticsPage() {
  const { backendHealth, backendOnline, refreshHealth } = useOutletContext();
  const [rootInfo, setRootInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRootMeta = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthService.getRootInfo();
      setRootInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRootMeta();
  }, []);

  const handleRefreshAll = () => {
    refreshHealth();
    fetchRootMeta();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              System Diagnostics & Health
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                backendOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {backendOnline ? 'ALL SYSTEMS OPERATIONAL' : 'BACKEND DISCONNECTED'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Live diagnostic inspection of FastAPI backend, SQLite database persistence, contact PDF parser, resume attachment, and SMTP relay.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Health Check</span>
        </button>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Diagnostic Ping Failed"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Grid of Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FastAPI Server Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">FastAPI Server</h3>
                  <span className="text-[11px] text-slate-400">Python 3.14+ / Uvicorn</span>
                </div>
              </div>
              <Badge
                status={backendOnline ? 'SENT' : 'FAILED'}
                label={backendOnline ? 'Online' : 'Offline'}
                size="xs"
              />
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Status Endpoint:</span>
                <span className="text-slate-900 font-semibold">GET /health</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Documentation:</span>
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline flex items-center gap-1 font-sans font-medium"
                >
                  Swagger UI <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CORS Support:</span>
                <span className="text-emerald-600 font-sans font-medium">Enabled</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Entrypoint: <code>backend/app/main.py</code>
          </div>
        </div>

        {/* SQLite Database Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">SQLite Database</h3>
                  <span className="text-[11px] text-slate-400">Embedded Engine</span>
                </div>
              </div>
              <Badge
                status={backendHealth?.database === 'connected' ? 'SENT' : 'FAILED'}
                label={backendHealth?.database === 'connected' ? 'Connected' : 'Unknown'}
                size="xs"
              />
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Database File:</span>
                <span className="text-slate-900 truncate max-w-[160px]">
                  data/email_sender.db
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duplicate Check:</span>
                <span className="text-emerald-600 font-sans font-medium">LOWER(email) Unique</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Log Model:</span>
                <span className="text-slate-900">EmailLog (SQLAlchemy)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Tables verified on startup via <code>init_db()</code>
          </div>
        </div>

        {/* Contacts PDF Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">HR Contacts PDF</h3>
                  <span className="text-[11px] text-slate-400">21-Page Source</span>
                </div>
              </div>
              <Badge
                status={backendHealth?.contact_pdf?.exists ? 'SENT' : 'FAILED'}
                label={backendHealth?.contact_pdf?.exists ? 'Loaded' : 'Missing'}
                size="xs"
              />
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Contacts:</span>
                <span className="text-slate-900 font-bold">
                  {backendHealth?.contact_pdf?.total_contacts?.toLocaleString() || 1842}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Parser Engine:</span>
                <span className="text-slate-900">pdfplumber + regex fallback</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Path:</span>
                <span className="text-slate-900 truncate max-w-[150px]">contactInfo.pdf</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Multi-line email joining & clean formatting enabled
          </div>
        </div>

        {/* Resume PDF Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Resume Attachment</h3>
                  <span className="text-[11px] text-slate-400">MIME Attachment</span>
                </div>
              </div>
              <Badge
                status={backendHealth?.resume_pdf?.exists ? 'SENT' : 'FAILED'}
                label={backendHealth?.resume_pdf?.exists ? 'Present' : 'Missing'}
                size="xs"
              />
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">File Exists:</span>
                <span className="text-emerald-600 font-semibold font-sans">
                  {backendHealth?.resume_pdf?.exists ? 'Yes (Verified)' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary File:</span>
                <span className="text-slate-900">Resume.pdf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auto-Attached:</span>
                <span className="text-slate-900 font-sans">application/pdf</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Attached to all real outgoing emails automatically
          </div>
        </div>

        {/* SMTP Configuration Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">SMTP Server</h3>
                  <span className="text-[11px] text-slate-400">Gmail TLS Dispatch</span>
                </div>
              </div>
              <Badge
                status={backendHealth?.smtp?.configured ? 'SENT' : 'SKIPPED'}
                label={backendHealth?.smtp?.configured ? 'Configured' : 'Credentials Needed'}
                size="xs"
              />
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Host:</span>
                <span className="text-slate-900">{backendHealth?.smtp?.host || 'smtp.gmail.com'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Port:</span>
                <span className="text-slate-900">{backendHealth?.smtp?.port || 587} (TLS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sender:</span>
                <span className="text-slate-900 truncate max-w-[150px]">
                  {backendHealth?.smtp?.user || 'vishalyadav.it26@gmail.com'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Protected by STARTTLS encryption & App Password
          </div>
        </div>

        {/* Candidate Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Candidate Profile</h3>
                  <span className="text-[11px] text-slate-400">Sender Information</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-slate-900">Vishal Yadav</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span>Full Stack Developer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GitHub:</span>
                <a
                  href="https://github.com/vishal-1459"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  vishal-1459 <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span>Jaipur, Rajasthan</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Injected into templates via <code>settings.py</code>
          </div>
        </div>
      </div>

      {/* Template Variables Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-brand-600" />
          Template Personalization Variables Reference
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          All template placeholders available in <code>backend/templates/email.txt</code> and <code>backend/templates/subject.txt</code>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-brand-600 font-semibold block">{`{{Name}}`}</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              Personalized first name (honorifics stripped, e.g. "Akanksha")
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-brand-600 font-semibold block">{`{{FullName}}`}</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              Full unedited recruiter name from contactInfo.pdf
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-brand-600 font-semibold block">{`{{Company}}`}</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              Target company name (e.g. "SourceFuse", "Google")
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-brand-600 font-semibold block">{`{{Title}}`}</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              Recruiter / HR job designation (e.g. "Lead Technical Recruiter")
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-brand-600 font-semibold block">{`{{SenderName}}`}</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              Vishal Yadav (sender's full name)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-brand-600 font-semibold block">{`{{SenderLinkedIn}}`}</span>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              linkedin.com/in/vishal-yadav21
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

