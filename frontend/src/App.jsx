import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ContactsPage from './pages/ContactsPage';
import CampaignPage from './pages/CampaignPage';
import PreviewPage from './pages/PreviewPage';
import LogsPage from './pages/LogsPage';
import DiagnosticsPage from './pages/DiagnosticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="campaign" element={<CampaignPage />} />
          <Route path="preview" element={<PreviewPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="diagnostics" element={<DiagnosticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

