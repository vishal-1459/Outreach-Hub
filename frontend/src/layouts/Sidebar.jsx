import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Send,
  Eye,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  Github,
  ExternalLink,
  MailCheck,
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, onClose, backendOnline, totalContacts }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/contacts', label: 'Contacts Directory', icon: Users, badge: totalContacts || '1,842' },
    { to: '/campaign', label: 'Outreach Campaign', icon: Send },
    { to: '/preview', label: 'Email Preview', icon: Eye },
    { to: '/logs', label: 'Activity Logs', icon: FileText },
    { to: '/diagnostics', label: 'System Health', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <MailCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Outreach-Hub
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Email Automation</p>
            </div>
          </div>
        </div>

        {/* Live Backend Indicator */}
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {backendOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              <span className="text-slate-300 font-medium">
                {backendOnline ? 'FastAPI Online' : 'FastAPI Offline'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Profile & Links */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-200">Vishal Yadav</span>
              <a
                href="https://github.com/vishal-1459/Outreach-Hub"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                title="View GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">Full Stack Developer</p>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>SQLite Engine</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border border-dashed border-slate-800"
          >
            <span>Interactive OpenAPI Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
}

