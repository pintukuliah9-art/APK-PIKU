import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, PlusCircle, Menu, Database, 
  Users, Briefcase, Megaphone, FolderOpen, ChevronDown, ChevronRight,
  Activity, X, Settings, LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'internal': true,
    'laporan': true
  });
  const location = useLocation();
  const { user, userData, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const role = userData?.role || 'guest';

  // Define which roles can see which items
  const canSeeAll = ['super_admin', 'admin'].includes(role);
  const canSeeFinance = ['super_admin', 'admin', 'finance_admin'].includes(role);
  const canSeeHR = ['super_admin', 'admin', 'hr_admin'].includes(role);
  const canSeeMarketing = ['super_admin', 'admin', 'marketing_admin'].includes(role);
  const canSeeAcademic = ['super_admin', 'admin', 'academic_admin'].includes(role);

  const navGroups = [
    {
      id: 'internal',
      label: 'Dashboard Internal',
      items: [
        { to: '/', icon: Activity, label: 'Dashboard Utama', show: canSeeAll },
        { to: '/internal/marketing', icon: Megaphone, label: 'Marketing', show: canSeeMarketing },
        { to: '/internal/finance', icon: Briefcase, label: 'Keuangan', show: canSeeFinance },
        { to: '/internal/admin', icon: FolderOpen, label: 'Administrasi', show: canSeeAcademic },
        { to: '/internal/student-admin', icon: Users, label: 'Admin Mahasiswa', show: canSeeAcademic },
        { to: '/internal/hr', icon: Users, label: 'SDM (HR)', show: canSeeHR },
      ].filter(item => item.show)
    },
    {
      id: 'laporan',
      label: 'Dashboard Laporan',
      items: [
        { to: '/internal/reports', icon: FileText, label: 'Laporan Internal', show: canSeeAll },
        { to: '/internal/create', icon: PlusCircle, label: 'Buat Laporan Internal', show: canSeeAll },
        { to: '/internal/finance/reports', icon: FileText, label: 'Laporan Keuangan', show: canSeeFinance },
        { to: '/internal/marketing/reports', icon: FileText, label: 'Laporan Marketing', show: canSeeMarketing },
        { to: '/internal/admin/reports', icon: FileText, label: 'Laporan Administrasi', show: canSeeAcademic },
      ].filter(item => item.show)
    }
  ].filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111318] flex font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#1A1C23] border-r border-slate-200 dark:border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto print:hidden flex flex-col shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              T
            </div>
            <span>TIM PIKU</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-blue-200 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                {group.label}
                {openGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              <AnimatePresence initial={false}>
                {openGroups[group.id] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                            isActive
                              ? "bg-indigo-50 dark:bg-emerald-500/10 text-indigo-700 dark:text-emerald-400 border-indigo-200 dark:border-emerald-500/30"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-transparent"
                          )
                        }
                      >
                        <item.icon size={18} className={cn("shrink-0 transition-colors")} />
                        {item.label}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-4",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )
            }
          >
            <Settings size={20} />
            Pengaturan
          </NavLink>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-800/50 flex items-center justify-center text-blue-700 dark:text-slate-300 font-bold border border-blue-200 dark:border-slate-700/50 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.displayName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="text-sm overflow-hidden">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.displayName || 'User'}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs truncate capitalize">{role.replace('_', ' ')}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#111318] transition-colors">
        <header className="h-20 bg-white/80 dark:bg-[#111318]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl lg:hidden transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="font-bold text-xl text-slate-800 dark:text-white lg:hidden">TIM PIKU</div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 rounded-full text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></div>
              Sistem Aktif
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
