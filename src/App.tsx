import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useAppStore } from './contexts/AppStoreContext';
import { AppStoreProvider } from './contexts/AppStoreContext';
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
import { useAuth, UserRole, AuthProvider } from './contexts/AuthContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) {
  const { userData } = useAuth();
  const role = userData?.role || 'guest';
  
  if (role === 'super_admin' || allowedRoles.includes(role)) {
    return <>{children}</>;
  }
  
  return <Navigate to="/" replace />;
}

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
        <Route path="/internal/marketing" element={<ProtectedRoute allowedRoles={['marketing_admin', 'admin']}><MarketingDashboard /></ProtectedRoute>} />
        <Route path="/internal/admin" element={<ProtectedRoute allowedRoles={['academic_admin', 'admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/internal/student-admin" element={<ProtectedRoute allowedRoles={['academic_admin', 'admin']}><StudentAdministrationPage /></ProtectedRoute>} />
        <Route path="/internal/finance" element={<ProtectedRoute allowedRoles={['finance_admin', 'admin']}><InternalFinance /></ProtectedRoute>} />
        <Route path="/internal/hr" element={<ProtectedRoute allowedRoles={['hr_admin', 'admin']}><HRDashboard /></ProtectedRoute>} />
        
        {/* Reports */}
        <Route path="/internal/reports" element={<InternalReportList />} />
        <Route path="/internal/create" element={<InternalReportEditor />} />
        <Route path="/internal/edit/:id" element={<InternalReportEditor />} />
        
        <Route path="/internal/finance/reports" element={<ProtectedRoute allowedRoles={['finance_admin', 'admin']}><FinanceReportList /></ProtectedRoute>} />
        <Route path="/internal/finance/create" element={<ProtectedRoute allowedRoles={['finance_admin', 'admin']}><FinanceReportEditor /></ProtectedRoute>} />
        <Route path="/internal/finance/edit/:id" element={<ProtectedRoute allowedRoles={['finance_admin', 'admin']}><FinanceReportEditor /></ProtectedRoute>} />
        
        <Route path="/internal/marketing/reports" element={<ProtectedRoute allowedRoles={['marketing_admin', 'admin']}><MarketingReportList /></ProtectedRoute>} />
        <Route path="/internal/marketing/create" element={<ProtectedRoute allowedRoles={['marketing_admin', 'admin']}><MarketingReportEditor /></ProtectedRoute>} />
        <Route path="/internal/marketing/edit/:id" element={<ProtectedRoute allowedRoles={['marketing_admin', 'admin']}><MarketingReportEditor /></ProtectedRoute>} />

        <Route path="/internal/admin/reports" element={<ProtectedRoute allowedRoles={['academic_admin', 'admin']}><AdminReportList /></ProtectedRoute>} />
        <Route path="/internal/admin/create" element={<ProtectedRoute allowedRoles={['academic_admin', 'admin']}><AdminReportEditor /></ProtectedRoute>} />
        <Route path="/internal/admin/edit/:id" element={<ProtectedRoute allowedRoles={['academic_admin', 'admin']}><AdminReportEditor /></ProtectedRoute>} />
        
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AppContent() {
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

export default function App() {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
}
