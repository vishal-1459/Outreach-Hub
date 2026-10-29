import React from 'react';
import { Menu, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ onMenuClick, backendHealth, isRefreshing, onRefresh }) {
  const isHealthy = backendHealth?.status === 'healthy';
  const totalContacts = backendHealth?.contact_pdf?.total_contacts || 0;
  const resumeOk = backendHealth?.resume_pdf?.exists;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">Local Personal Job Outreach</span>
          <span>•</span>
          <span>100% Privacy-Preserved</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Contact PDF Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 font-medium">contactInfo.pdf:</span>
          <span className="font-mono font-semibold text-slate-800">
            {totalContacts > 0 ? `${totalContacts.toLocaleString()} HR Contacts` : 'Checking...'}
          </span>
        </div>

        {/* Resume status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          {resumeOk ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resume Attached
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Resume Missing
            </span>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs disabled:opacity-50"
          title="Refresh Backend Health"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}

