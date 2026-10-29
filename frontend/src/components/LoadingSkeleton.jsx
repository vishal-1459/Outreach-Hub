import React from 'react';

export function SkeletonLine({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex gap-4">
        <SkeletonLine className="h-9 w-64 rounded-lg" />
        <SkeletonLine className="h-9 w-32 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine
                key={c}
                className={`h-4 ${
                  c === 0 ? 'w-12' : c === 1 ? 'w-36' : c === 2 ? 'w-48' : 'w-24'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-24 h-3 bg-slate-200 rounded" />
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
      </div>
      <div className="w-16 h-7 bg-slate-200 rounded mb-2" />
      <div className="w-32 h-3 bg-slate-100 rounded" />
    </div>
  );
}

