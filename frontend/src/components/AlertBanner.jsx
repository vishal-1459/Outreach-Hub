import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function AlertBanner({ type = 'info', title, message, onClose, className = '' }) {
  const configs = {
    info: {
      icon: Info,
      bg: 'bg-sky-50 border-sky-200 text-sky-800',
      iconColor: 'text-sky-600',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconColor: 'text-emerald-600',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      iconColor: 'text-amber-600',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      iconColor: 'text-rose-600',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm shadow-xs ${config.bg} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <div className="leading-relaxed opacity-90">{message}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

