import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  FileCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { outreachService } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

export default function CampaignPage() {
  const [searchParams] = useSearchParams();

  // Campaign range parameters
  const [startSno, setStartSno] = useState(parseInt(searchParams.get('start')) || 1);
  const [endSno, setEndSno] = useState(parseInt(searchParams.get('end')) || 5);
  const [isDryRun, setIsDryRun] = useState(true);
  const [forceResend, setForceResend] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(5.0);

  // Safety confirmation
  const [confirmedSafety, setConfirmedSafety] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // States
  const [previews, setPreviews] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState(null);

  const totalSelected = endSno >= startSno ? endSno - startSno + 1 : 0;

  // Fetch previews whenever range is set or clicked
  const handleLoadPreviews = async () => {
    if (endSno < startSno) {
      setError('Start SNo cannot be greater than End SNo.');
      return;
    }
    try {
      setLoadingPreview(true);
      setError(null);
      setExecutionResult(null);
      const res = await outreachService.getPreview({
        start: startSno,
        end: endSno,
      });
      setPreviews(res.previews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    handleLoadPreviews();
  }, []);

  const handleExecute = async () => {
    if (!isDryRun && !confirmedSafety) {
      setShowConfirmModal(true);
      return;
    }

    try {
      setExecuting(true);
      setError(null);
      setExecutionResult(null);

      const res = await outreachService.sendOutreach({
        start: startSno,
        end: endSno,
        confirm: !isDryRun,
        force: forceResend,
        dry_run: isDryRun,
        delay_seconds: delaySeconds,
      });

      setExecutionResult(res);
      setShowConfirmModal(false);
      // Refresh previews to update already_sent status
      handleLoadPreviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Outreach Campaign Manager
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-200">
              Interactive Dispatcher
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Configure SNo ranges, inspect live rendered drafts with duplicate checking, and dispatch emails with rate limiting and resume attachments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/logs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Outreach History</span>
          </Link>
        </div>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Operation Notice"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Execution Summary Banner if just finished */}
      {executionResult && (
        <div className="p-6 bg-white rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {executionResult.dry_run
                    ? 'Dry Run Simulation Completed'
                    : 'Real Outreach Campaign Dispatched!'}
                </h3>
                <p className="text-xs text-slate-500">
                  {executionResult.processed} contacts processed across range #{startSno} to #{endSno}.
                </p>
              </div>
            </div>
            <Link
              to="/logs"
              className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Inspect Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
            <div>
              <span className="text-slate-500 block">Sent Successfully</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">
                {executionResult.sent}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Duplicates Guarded</span>
              <span className="text-lg font-bold text-amber-600 font-mono">
                {executionResult.duplicates || executionResult.skipped || 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Failed</span>
              <span className="text-lg font-bold text-rose-600 font-mono">
                {executionResult.failed || 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Mode</span>
              <span className="text-xs font-semibold text-slate-800">
                {executionResult.dry_run ? 'Dry Run (Simulation)' : 'Real SMTP Delivery'}
              </span>
            </div>
          </div>

          {executionResult.details && executionResult.details.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {executionResult.details.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">#{item.sno}</span>
                    <span className="text-slate-800">{item.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.reason && <span className="text-slate-400 text-[11px]">{item.reason}</span>}
                    <Badge status={item.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campaign Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          1. Campaign Parameters & Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Start Row */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Start SNo
            </label>
            <input
              type="number"
              min="1"
              value={startSno}
              onChange={(e) => setStartSno(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* End Row */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              End SNo
            </label>
            <input
              type="number"
              min={startSno}
              value={endSno}
              onChange={(e) => setEndSno(Math.max(startSno, parseInt(e.target.value) || startSno))}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Delay */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rate Limit Delay (seconds)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Refresh previews button */}
          <div className="flex items-end">
            <button
              onClick={handleLoadPreviews}
              disabled={loadingPreview}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? 'animate-spin' : ''}`} />
              <span>Load Previews</span>
            </button>
          </div>
        </div>

        {/* Mode Selector and Safety Guard Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* Dispatch Mode Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Execution Mode
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDryRun(true)}
                className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                  isDryRun
                    ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20 text-sky-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <PlayCircle className="w-4 h-4 text-sky-600" />
                  <span className="text-xs">Safe Dry Run</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Simulates full pipeline, tests duplicate logic, records logs. Zero emails dispatched.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsDryRun(false)}
                className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                  !isDryRun
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 text-amber-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-amber-600" />
                  <span className="text-xs">Real SMTP Delivery</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Direct STARTTLS connection to Gmail SMTP. Attaches Resume.pdf to outgoing emails.
                </p>
              </button>
            </div>
          </div>

          {/* Safety Safeguards */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Safeguards & Overrides
            </span>

            <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={forceResend}
                onChange={(e) => setForceResend(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Force Resend (Override Duplicate Guard)
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  By default, Outreach-Hub skips any recipient with status SENT. Check this to re-send anyway.
                </span>
              </div>
            </label>

            {!isDryRun && (
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedSafety}
                  onChange={(e) => setConfirmedSafety(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-rose-800 block">
                    I confirm real email delivery
                  </span>
                  <span className="text-[11px] text-rose-600 block leading-tight">
                    Explicit confirmation required to satisfy FastAPI backend safety guard.
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected Batch:{' '}
            <strong className="text-slate-800">
              {totalSelected} contact{totalSelected !== 1 ? 's' : ''}
            </strong>{' '}
            (SNo #{startSno} - #{endSno})
          </div>

          <button
            onClick={handleExecute}
            disabled={executing || totalSelected === 0}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 ${
              isDryRun
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {executing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Outreach...</span>
              </>
            ) : isDryRun ? (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Run Safe Simulation ({totalSelected})</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Real Emails ({totalSelected})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Previews List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-600" />
              2. Rendered Batch Previews ({previews.length})
            </h2>
            <p className="text-xs text-slate-500">
              Personalized candidate drafts generated deterministically from candidate profile and templates
            </p>
          </div>

          <Link
            to={`/preview?start=${startSno}&end=${endSno}`}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Full-screen Previews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingPreview ? (
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl animate-pulse h-28" />
            <div className="p-4 bg-slate-50 rounded-xl animate-pulse h-28" />
          </div>
        ) : previews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No contacts found in selected range.
          </div>
        ) : (
          <div className="space-y-4">
            {previews.map((item) => (
              <div
                key={item.sno}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{item.sno}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-500">({item.company})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.email}
                    </span>
                    {item.already_sent ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Already Sent
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 font-normal">Subject: </span>
                    {item.subject}
                  </div>
                  <div className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 font-sans whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {item.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Live Email Dispatch"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">
                You are about to dispatch real outgoing emails.
              </strong>
              These emails will be sent directly through Gmail SMTP to{' '}
              <strong>{totalSelected} recruiter(s)</strong> with your attached resume (Resume.pdf).
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 font-mono text-slate-700">
            <div>Target Range: #{startSno} to #{endSno}</div>
            <div>Total Contacts: {totalSelected}</div>
            <div>Rate Limit: {delaySeconds}s delay per email</div>
            <div>Duplicate Protection: {forceResend ? 'OFF (Force Mode)' : 'ON (Safe)'}</div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirmedSafety(true);
                handleExecute();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              I Understand, Send Emails
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

