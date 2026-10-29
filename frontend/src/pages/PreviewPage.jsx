import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Eye,
  Send,
  Mail,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  User,
  Building,
} from 'lucide-react';
import { outreachService } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';

export default function PreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [start, setStart] = useState(parseInt(searchParams.get('start')) || 1);
  const [end, setEnd] = useState(parseInt(searchParams.get('end')) || 5);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchPreviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await outreachService.getPreview({ start, end });
      setPreviews(res.previews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviews();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPreviews();
  };

  const handleCopyBody = (sno, body) => {
    navigator.clipboard.writeText(body);
    setCopiedId(sno);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Email Template Previews
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
              Zero Network Calls
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Inspect the exact personalized emails generated for each HR contact. Verify name parsing, company insertion, and duplicate check status.
          </p>
        </div>

        <Link
          to={`/campaign?start=${start}&end=${end}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Launch Outreach with Batch</span>
        </Link>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Could not load email previews"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Range Controller */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Start SNo:</span>
            <input
              type="number"
              min="1"
              value={start}
              onChange={(e) => setStart(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">End SNo:</span>
            <input
              type="number"
              min={start}
              value={end}
              onChange={(e) => setEnd(Math.max(start, parseInt(e.target.value) || start))}
              className="w-20 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Previews</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing previews for{' '}
          <strong className="text-slate-800">
            {previews.length} contact{previews.length !== 1 ? 's' : ''}
          </strong>
        </div>
      </form>

      {/* Previews Grid */}
      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-64" />
          <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-64" />
        </div>
      ) : previews.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No previews available"
          description="Adjust the start and end row numbers to inspect contact drafts."
        />
      ) : (
        <div className="space-y-6">
          {previews.map((preview) => (
            <div
              key={preview.sno}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Email Envelope Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                    #{preview.sno}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {preview.name || 'Hiring Team'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{preview.company}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      To: {preview.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {preview.already_sent ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Already Contacted
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Outreach
                    </span>
                  )}

                  <button
                    onClick={() => handleCopyBody(preview.sno, preview.body)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Copy body text"
                  >
                    {copiedId === preview.sno ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subject Bar */}
              <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Subject:
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {preview.subject}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 bg-white text-xs sm:text-sm text-slate-700 font-sans whitespace-pre-wrap leading-relaxed selection:bg-brand-500 selection:text-white">
                {preview.body}
              </div>

              {/* Resume Attachment Pill */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Attachment:</span>
                  <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    Resume.pdf (Vishal Yadav - Full Stack)
                  </span>
                </div>

                <Link
                  to={`/campaign?start=${preview.sno}&end=${preview.sno}`}
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>Dispatch This Contact</span>
                  <Send className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

