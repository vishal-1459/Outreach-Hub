import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { logsService } from '../services/api';
import Badge from '../components/Badge';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { formatDate, formatRelativeTime } from '../utils/formatters';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Modal inspection
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch up to 500 for client-side search & filtering
      const res = await logsService.getLogs({ limit: 500, offset: 0 });
      setLogs(res.logs || []);
      setTotalRecords(res.total_records || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchEmail = (log.recipient_email || '').toLowerCase().includes(term);
      const matchName = (log.name || '').toLowerCase().includes(term);
      const matchCompany = (log.company || '').toLowerCase().includes(term);
      const matchSubject = (log.subject || '').toLowerCase().includes(term);
      return matchEmail || matchName || matchCompany || matchSubject;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Recipient Email', 'Name', 'Company', 'Title', 'Status', 'Timestamp', 'Subject', 'Error Message'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.recipient_email || ''}"`,
      `"${l.name || ''}"`,
      `"${l.company || ''}"`,
      `"${l.title || ''}"`,
      `"${l.status || ''}"`,
      `"${l.timestamp || ''}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${(l.error_message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Outreach Activity Logs
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
              SQLite Audit Trail
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Persistent database history stored in <code>data/email_sender.db</code>. Tracks every sent email, duplicate rejection, and simulation run.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Could not load logs"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {['ALL', 'SENT', 'DRY_RUN', 'SKIPPED', 'FAILED'].map((tab) => {
            const count =
              tab === 'ALL'
                ? logs.length
                : logs.filter((l) => l.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab === 'ALL' ? 'All Events' : tab.replace('_', ' ')}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    statusFilter === tab ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by email, contact name, company, or subject line..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : paginatedLogs.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Clock}
              title="No logs found"
              description="No logs matched the selected filter criteria."
              action={
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Reset Filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-14">#ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Company & Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      #{log.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={log.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {log.name || 'Hiring Team'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {log.recipient_email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{log.company || '—'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {log.title || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {log.subject || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatRelativeTime(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredLogs.length > pageSize && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Log Inspector Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Record #${selectedLog?.id}`}
        maxWidth="max-w-xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Event Status</span>
              <Badge status={selectedLog.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block mb-0.5">Recipient Name</span>
                <span className="font-semibold text-slate-800">{selectedLog.name || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Target Company</span>
                <span className="font-semibold text-slate-800">{selectedLog.company || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Recipient Email</span>
                <span className="font-mono font-medium text-slate-900 select-all">
                  {selectedLog.recipient_email}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Timestamp (UTC)</span>
                <span className="font-mono text-slate-700">{formatDate(selectedLog.timestamp)}</span>
              </div>
            </div>

            {selectedLog.subject && (
              <div>
                <span className="text-slate-400 font-medium block mb-1">Rendered Subject Line</span>
                <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs">
                  {selectedLog.subject}
                </div>
              </div>
            )}

            {selectedLog.error_message && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <span className="font-bold block mb-1">Details / Error Notice:</span>
                <span className="font-mono text-xs">{selectedLog.error_message}</span>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

