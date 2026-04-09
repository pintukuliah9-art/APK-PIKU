import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './hooks/useAppStore';
import Layout from './components/Layout';
import InternalDashboard from './pages/internal/InternalDashboard';
import MarketingDashboard from './pages/internal/Marketing';
import AdminDashboard from './pages/internal/Admin';
import StudentAdministrationPage from './pages/internal/StudentAdministration';
import InternalFinance from './pages/internal/InternalFinance';
import HRDashboard from './pages/internal/HR';

import InternalReportList from './pages/internal/InternalReportList';
import InternalReportEditor from './pages/internal/InternalReportEditor';
import FinanceReportList from './pages/internal/FinanceReportList';
import FinanceReportEditor from './pages/internal/FinanceReportEditor';
import MarketingReportList from './pages/marketing/MarketingReportList';
import MarketingReportEditor from './pages/marketing/MarketingReportEditor';
import AdminReportList from './pages/admin/AdminReportList';
import AdminReportEditor from './pages/admin/AdminReportEditor';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<InternalDashboard />} />
        
        {/* Internal Tim */}
        <Route path="/internal/marketing" element={<MarketingDashboard />} />
        <Route path="/internal/admin" element={<AdminDashboard />} />
        <Route path="/internal/student-admin" element={<StudentAdministrationPage />} />
        <Route path="/internal/finance" element={<InternalFinance />} />
        <Route path="/internal/hr" element={<HRDashboard />} />
        <Route path="/internal/reports" element={<InternalReportList />} />
        <Route path="/internal/create" element={<InternalReportEditor />} />
        <Route path="/internal/edit/:id" element={<InternalReportEditor />} />
        <Route path="/internal/finance/reports" element={<FinanceReportList />} />
        <Route path="/internal/finance/create" element={<FinanceReportEditor />} />
        <Route path="/internal/finance/edit/:id" element={<FinanceReportEditor />} />
        
        <Route path="/internal/marketing/reports" element={<MarketingReportList />} />
        <Route path="/internal/marketing/create" element={<MarketingReportEditor />} />
        <Route path="/internal/marketing/edit/:id" element={<MarketingReportEditor />} />

        <Route path="/internal/admin/reports" element={<AdminReportList />} />
        <Route path="/internal/admin/create" element={<AdminReportEditor />} />
        <Route path="/internal/admin/edit/:id" element={<AdminReportEditor />} />
        
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const { settings } = useAppStore();

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
