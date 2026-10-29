import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  MailCheck,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import AlertBanner from '../components/AlertBanner';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { logsService, contactsService } from '../services/api';
import { formatDate, formatRelativeTime } from '../utils/formatters';

const STATUS_COLORS = {
  SENT: '#10b981', // emerald-500
  DRY_RUN: '#0284c7', // sky-600
  SKIPPED: '#f59e0b', // amber-500
  FAILED: '#ef4444', // rose-500
};

export default function Dashboard() {
  const { backendHealth, backendOnline } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick launch state
  const [quickStart, setQuickStart] = useState(1);
  const [quickEnd, setQuickEnd] = useState(5);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const logData = await logsService.getLogs({ limit: 100, offset: 0 });
      setLogs(logData.logs || []);
      setTotalLogs(logData.total_records || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute metrics from logs
  const sentCount = logs.filter((l) => l.status === 'SENT').length;
  const dryRunCount = logs.filter((l) => l.status === 'DRY_RUN').length;
  const skippedCount = logs.filter((l) => l.status === 'SKIPPED').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;
  const totalContacts = backendHealth?.contact_pdf?.total_contacts || 1842;

  // Chart data
  const statusChartData = [
    { name: 'Sent (Real)', value: sentCount, color: STATUS_COLORS.SENT },
    { name: 'Dry Run', value: dryRunCount, color: STATUS_COLORS.DRY_RUN },
    { name: 'Duplicate Skipped', value: skippedCount, color: STATUS_COLORS.SKIPPED },
    { name: 'Failed', value: failedCount, color: STATUS_COLORS.FAILED },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Outreach Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              Deterministic & Local
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Continuous personal job outreach management. 100% privacy-first: all contacts and resume parsing run locally on your machine with zero third-party AI exposure.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/campaign"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Launch Campaign</span>
          </Link>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Directory</span>
          </Link>
        </div>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Could not load logs data"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Contacts in PDF"
              value={totalContacts}
              subtitle="Extracted from contactInfo.pdf"
              icon={Users}
              badge="Source of Truth"
              badgeColor="bg-slate-100 text-slate-700"
              iconBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Emails Dispatched"
              value={sentCount}
              subtitle="Delivered via Gmail SMTP"
              icon={MailCheck}
              badge="Real Sends"
              badgeColor="bg-emerald-50 text-emerald-700"
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Duplicates Guarded"
              value={skippedCount}
              subtitle="Safely prevented re-contacting"
              icon={ShieldCheck}
              badge="SQLite Enforced"
              badgeColor="bg-amber-50 text-amber-700"
              iconBg="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Simulations / Dry Runs"
              value={dryRunCount}
              subtitle="Validated template previews"
              icon={PlayCircle}
              badge="Safe Testing"
              badgeColor="bg-sky-50 text-sky-700"
              iconBg="bg-sky-50 text-sky-600"
            />
          </>
        )}
      </div>

      {/* Interactive Quick Launch & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-600" />
                Quick Outreach Launch
              </h2>
              <span className="text-[11px] font-medium text-slate-500">Row-level targeting</span>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Target a specific batch of HR contacts by their sequential SNo. You can preview drafts or perform safe simulations before dispatching.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start SNo
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalContacts}
                  value={quickStart}
                  onChange={(e) => setQuickStart(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End SNo
                </label>
                <input
                  type="number"
                  min={quickStart}
                  max={totalContacts}
                  value={quickEnd}
                  onChange={(e) => setQuickEnd(Math.max(quickStart, parseInt(e.target.value) || quickStart))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-5 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Selected Range:</span>
                <span className="font-semibold text-slate-900">
                  {quickEnd >= quickStart ? quickEnd - quickStart + 1 : 0} Contacts
                </span>
              </div>
              <div className="flex justify-between">
                <span>Safety Guard:</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Duplicate Protection ON
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Link
              to={`/preview?start=${quickStart}&end=${quickEnd}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Batch</span>
            </Link>
            <Link
              to={`/campaign?start=${quickStart}&end=${quickEnd}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in Campaign</span>
            </Link>
          </div>
        </div>

        {/* Visual Analytics / Outreach Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Outreach Status Breakdown
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {totalLogs} total events
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Real-time execution status recorded by SQLite audit logger.
          </p>

          <div className="h-44 w-full flex items-center justify-center">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 py-8">
                No outreach activity logged yet.
                <br />
                Run a simulation or launch a campaign to populate analytics!
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Sent: {sentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-600">Dry Run: {dryRunCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Skipped: {skippedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Failed: {failedCount}</span>
            </div>
          </div>
        </div>

        {/* System Health / Configuration snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Pipeline Health Snapshot
              </h2>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                READY
              </span>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">FastAPI Server</span>
                <Badge
                  status={backendOnline ? 'SENT' : 'FAILED'}
                  label={backendOnline ? 'Connected' : 'Offline'}
                  size="xs"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">SQLite Database</span>
                <span className="font-mono text-slate-800 font-medium">data/email_sender.db</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Contacts Source</span>
                <span className="font-mono text-slate-800 font-medium">contactInfo.pdf (21 pgs)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Resume Attachment</span>
                <span className="font-mono text-slate-800 font-medium">Resume.pdf</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">SMTP Host</span>
                <span className="font-mono text-slate-800 font-medium">
                  {backendHealth?.smtp?.host || 'smtp.gmail.com:587'}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/diagnostics"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
          >
            <span>Inspect System Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Outreach Events
            </h2>
            <p className="text-xs text-slate-500">
              Audit log of dispatched, skipped, and simulated outreach actions
            </p>
          </div>
          <Link
            to="/logs"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Clock}
              title="No recent outreach activity"
              description="Execute an outreach campaign or preview batch to generate audit logs."
              action={
                <Link
                  to="/campaign"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start First Campaign</span>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Company & Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.slice(0, 7).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <Badge status={log.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.name || 'Unknown'}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {log.recipient_email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{log.company || '—'}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[200px]">
                        {log.title || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {log.subject || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatRelativeTime(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

