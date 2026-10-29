import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { healthService } from '../services/api';

export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await healthService.checkHealth();
      setBackendHealth(data);
      setBackendOnline(data.status === 'healthy');
    } catch (err) {
      console.warn('Backend ping failed:', err.message);
      setBackendOnline(false);
      setBackendHealth(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30s heartbeat
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        backendOnline={backendOnline}
        totalContacts={backendHealth?.contact_pdf?.total_contacts}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setIsMobileOpen(true)}
          backendHealth={backendHealth}
          isRefreshing={isRefreshing}
          onRefresh={fetchHealth}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ backendHealth, backendOnline, refreshHealth: fetchHealth }} />
        </main>
      </div>
    </div>
  );
}

