export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return isoString;
  }
}

export function getStatusBadgeProps(status) {
  const norm = (status || '').toUpperCase();
  switch (norm) {
    case 'SENT':
      return {
        label: 'Sent',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    case 'DRY_RUN':
      return {
        label: 'Dry Run',
        classes: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
        dot: 'bg-sky-500',
      };
    case 'SKIPPED':
      return {
        label: 'Duplicate Skipped',
        classes: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        dot: 'bg-amber-500',
      };
    case 'FAILED':
      return {
        label: 'Failed',
        classes: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: norm || 'Pending',
        classes: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-400/20',
        dot: 'bg-slate-400',
      };
  }
}

