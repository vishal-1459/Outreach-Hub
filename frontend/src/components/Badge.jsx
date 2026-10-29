import React from 'react';
import { getStatusBadgeProps } from '../utils/formatters';

export default function Badge({ status, label, variant, size = 'sm' }) {
  const badgeProps = status ? getStatusBadgeProps(status) : null;
  const displayLabel = label || badgeProps?.label || status;
  const classes = badgeProps?.classes || 'bg-slate-100 text-slate-700 border-slate-200';
  const dotColor = badgeProps?.dot || 'bg-slate-400';

  const sizeClasses = size === 'xs' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${sizeClasses} ${classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {displayLabel}
    </span>
  );
}

