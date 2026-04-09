import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, PlusCircle, Menu, Database, 
  Users, Briefcase, Megaphone, FolderOpen, ChevronDown, ChevronRight,
  Activity, X, Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'internal': true,
    'laporan': true
  });
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navGroups = [
    {
      id: 'internal',
      label: 'Dashboard Internal',
      items: [
        { to: '/', icon: Activity, label: 'Dashboard Internal' },
        { to: '/internal/marketing', icon: Megaphone, label: 'Marketing' },
        { to: '/internal/finance', icon: Briefcase, label: 'Keuangan' },
        { to: '/internal/admin', icon: FolderOpen, label: 'Administrasi' },
        { to: '/internal/student-admin', icon: Users, label: 'Admin Mahasiswa' },
        { to: '/internal/hr', icon: Users, label: 'SDM (HR)' },
      ]
    },
    {
      id: 'laporan',
      label: 'Dashboard Laporan',
      items: [
        { to: '/internal/reports', icon: FileText, label: 'Laporan Internal' },
        { to: '/internal/create', icon: PlusCircle, label: 'Buat Laporan Internal' },
        { to: '/internal/finance/reports', icon: FileText, label: 'Laporan Keuangan' },
        { to: '/internal/marketing/reports', icon: FileText, label: 'Laporan Marketing' },
        { to: '/internal/admin/reports', icon: FileText, label: 'Laporan Administrasi' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors">
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
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto print:hidden flex flex-col shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
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
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-600/30 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-blue-900/20"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
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
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-800/50 flex items-center justify-center text-blue-700 dark:text-slate-300 font-bold border border-blue-200 dark:border-slate-700/50">
              A
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-900 dark:text-white">Admin</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">admin@stis.ac.id</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-20 print:hidden">
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
