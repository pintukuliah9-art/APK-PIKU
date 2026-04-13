import React from 'react';
import { useAppStore } from '../../contexts/AppStoreContext';
import { Users, Briefcase, Megaphone, FolderOpen, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InternalDashboard() {
  const { studentAdministrations, kasLedger, marketingReports, suratList, inventarisList } = useAppStore();

  // Calculate stats
  const totalStudents = studentAdministrations.length;
  const activeStudents = studentAdministrations.filter(s => s.statusData === 'Aktif PDDikti').length;
  
  const karyawanStudents = studentAdministrations.filter(s => s.program?.toLowerCase().includes('karyawan')).length;
  const rplStudents = studentAdministrations.filter(s => s.program?.toLowerCase().includes('rpl')).length;
  const akselerasiStudents = studentAdministrations.filter(s => s.program?.toLowerCase().includes('akselerasi')).length;

  const totalMarketing = marketingReports.length;
  const totalSurat = suratList.length;
  const totalInventaris = inventarisList.reduce((acc, item) => acc + item.jumlah, 0);

  const totalIncome = kasLedger.reduce((acc, k) => acc + k.inAmount + k.borrowedAmount, 0);
  const totalExpense = kasLedger.reduce((acc, k) => acc + k.outAmount + k.loanedOutAmount, 0);
  const currentBalance = totalIncome - totalExpense;

  const StatCard = ({ title, value, subtext, icon: Icon, theme = 'blue', isTopRow = false }: any) => {
    const themes = {
      blue: {
        iconContainer: 'bg-blue-500 dark:bg-blue-500/20 border-transparent dark:border-blue-500/30',
        icon: 'text-white dark:text-blue-400',
        rightBlock: 'bg-blue-50 dark:bg-blue-500/10',
        rightIcon: 'text-blue-200 dark:text-blue-500/20',
      },
      green: {
        iconContainer: 'bg-emerald-500 dark:bg-emerald-500/20 border-transparent dark:border-emerald-500/30',
        icon: 'text-white dark:text-emerald-400',
        rightBlock: 'bg-emerald-50 dark:bg-emerald-500/10',
        rightIcon: 'text-emerald-200 dark:text-emerald-500/20',
      },
      amber: {
        iconContainer: 'bg-amber-500 dark:bg-amber-500/20 border-transparent dark:border-amber-500/30',
        icon: 'text-white dark:text-amber-400',
        rightBlock: 'bg-amber-50 dark:bg-amber-500/10',
        rightIcon: 'text-amber-200 dark:text-amber-500/20',
      },
      purple: {
        iconContainer: 'bg-purple-500 dark:bg-purple-500/20 border-transparent dark:border-purple-500/30',
        icon: 'text-white dark:text-purple-400',
        rightBlock: 'bg-purple-50 dark:bg-purple-500/10',
        rightIcon: 'text-purple-200 dark:text-purple-500/20',
      }
    };

    const t = themes[theme as keyof typeof themes] || themes.blue;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-[#1A1C23] rounded-2xl shadow-sm border border-slate-100 dark:border-[#2A2D35] relative overflow-hidden group flex"
      >
        {/* Left Content */}
        <div className="p-6 flex-1 relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${t.iconContainer} mb-4`}>
            <Icon size={24} className={t.icon} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${isTopRow ? 'text-slate-900 dark:text-yellow-500' : 'text-slate-900 dark:text-white'}`}>
              {value}
            </h3>
            {subtext && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{subtext}</p>}
          </div>
        </div>
        
        {/* Right Block */}
        <div className={`w-1/3 absolute right-0 top-0 bottom-0 ${t.rightBlock} flex items-center justify-center overflow-hidden`}>
          <Icon size={100} className={`absolute -right-4 ${t.rightIcon} transform group-hover:scale-110 transition-transform duration-300`} />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Internal</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1">Ringkasan aktivitas dan data operasional tim internal.</p>
        </div>
        <div className="flex items-center bg-purple-50 dark:bg-purple-500/10 px-4 py-2 rounded-full shadow-sm border border-purple-200 dark:border-purple-500/30 text-sm font-medium text-purple-700 dark:text-purple-400">
          <Activity size={16} className="mr-2" />
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Mahasiswa" 
          value={totalStudents} 
          subtext={`${activeStudents} Aktif PDDikti`}
          icon={Users}
          theme="blue"
          isTopRow={true}
        />
        <StatCard 
          title="Saldo Kas Internal" 
          value={formatCurrency(currentBalance)} 
          subtext="Total dana tersedia"
          icon={Briefcase}
          theme="green"
          isTopRow={true}
        />
        <StatCard 
          title="Laporan Marketing" 
          value={totalMarketing} 
          subtext="Aktivitas tercatat"
          icon={Megaphone}
          theme="amber"
          isTopRow={true}
        />
        <StatCard 
          title="Total Inventaris" 
          value={totalInventaris} 
          subtext={`${totalSurat} Surat Keluar/Masuk`}
          icon={FolderOpen}
          theme="purple"
          isTopRow={true}
        />
      </div>

      {/* Student Breakdown Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Data Mahasiswa Berdasarkan Program</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Kelas Karyawan" 
            value={karyawanStudents} 
            subtext="Mencakup data Kelas karyawan"
            icon={Users}
            theme="purple"
          />
          <StatCard 
            title="Program RPL" 
            value={rplStudents} 
            subtext="RPL 6 Bulan, 1 Tahun, 2 Tahun"
            icon={Users}
            theme="purple"
          />
          <StatCard 
            title="Program Akselerasi" 
            value={akselerasiStudents} 
            subtext="Akselerasi S1, S2, D3"
            icon={Users}
            theme="purple"
          />
        </div>
      </div>

      {/* Additional Sections can be added here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1C23] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#2A2D35]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aktivitas Mahasiswa Terbaru</h3>
          <div className="space-y-4">
            {studentAdministrations.slice(0, 5).map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111318] rounded-xl border border-slate-100 dark:border-[#2A2D35]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {student.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{student.namaLengkap}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{student.programStudi}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-[#2A2D35] rounded-full text-xs font-medium text-slate-800 dark:text-slate-100">
                  {student.statusData}
                </span>
              </div>
            ))}
            {studentAdministrations.length === 0 && (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center py-4">Belum ada data mahasiswa.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1C23] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#2A2D35]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaksi Kas Terakhir</h3>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">Income</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">Expense</span>
            </div>
          </div>
          <div className="space-y-4">
            {kasLedger.slice(0, 5).map((trx, idx) => {
              const isIncome = trx.inAmount > 0 || trx.borrowedAmount > 0;
              const amount = trx.inAmount || trx.outAmount || trx.loanedOutAmount || trx.borrowedAmount;
              
              let dateStr = trx.date;
              try {
                const d = new Date(trx.date);
                if (!isNaN(d.getTime())) {
                  dateStr = format(d, 'dd MMM yyyy', { locale: id });
                }
              } catch (e) {}

              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111318] rounded-xl border border-slate-100 dark:border-[#2A2D35]">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{trx.notes}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{dateStr}</p>
                  </div>
                  <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount)}
                  </span>
                </div>
              );
            })}
            {kasLedger.length === 0 && (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center py-4">Belum ada transaksi kas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
