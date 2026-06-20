import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import CitizenCases from './pages/CitizenCases';
import CaseDetail from './pages/CaseDetail';
import ServiceManager from './pages/ServiceManager';
import OfficeManager from './pages/OfficeManager';
import OfficerAvailability from './pages/OfficerAvailability';
import CrowdReports from './pages/CrowdReports';
import Landing from './pages/Landing';
import KnowledgeBase from './pages/KnowledgeBase';

// Protected layout — redirects to /login if not authenticated
function AdminLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0B1120] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<CitizenCases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/services" element={<ServiceManager />} />
          <Route path="/offices" element={<OfficeManager />} />
          <Route path="/officers" element={<OfficerAvailability />} />
          <Route path="/reports" element={<CrowdReports />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="*" element={<div className="p-8 text-slate-400">Page coming soon...</div>} />
        </Routes>
      </main>
    </div>
  );
}

// Public layout guard — redirect to /dashboard if already logged in
function PublicGuard({ children }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicGuard><Landing /></PublicGuard>} />
          <Route path="/login" element={<PublicGuard><AdminLogin /></PublicGuard>} />

          {/* Protected routes */}
          <Route path="/dashboard/*" element={<AdminLayout />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
