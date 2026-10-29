import React from 'react';
import { FolderSearch } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'Try adjusting your search filters or range parameters.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4 ring-8 ring-slate-50">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

