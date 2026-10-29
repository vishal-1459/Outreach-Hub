import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'bg-slate-100 text-slate-700',
  iconBg = 'bg-brand-50 text-brand-600',
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5 stroke-[2]" />}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value !== undefined && value !== null ? value.toLocaleString() : '—'}
        </span>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

