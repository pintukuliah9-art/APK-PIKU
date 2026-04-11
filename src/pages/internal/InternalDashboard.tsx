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

  const totalIncome = kasLedger.filter(k => k.type === 'income').reduce((acc, k) => acc + k.amount, 0);
  const totalExpense = kasLedger.filter(k => k.type === 'expense').reduce((acc, k) => acc + k.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
            <Icon size={24} className="text-slate-700 dark:text-slate-300" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Internal</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1">Ringkasan aktivitas dan data operasional tim internal.</p>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100">
          <Activity size={16} className="mr-2 text-indigo-500" />
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
          color="bg-blue-500"
        />
        <StatCard 
          title="Saldo Kas Internal" 
          value={formatCurrency(currentBalance)} 
          subtext="Total dana tersedia"
          icon={Briefcase}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Laporan Marketing" 
          value={totalMarketing} 
          subtext="Aktivitas tercatat"
          icon={Megaphone}
          color="bg-amber-500"
        />
        <StatCard 
          title="Total Inventaris" 
          value={totalInventaris} 
          subtext={`${totalSurat} Surat Keluar/Masuk`}
          icon={FolderOpen}
          color="bg-indigo-500"
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
            color="bg-blue-600"
          />
          <StatCard 
            title="Program RPL" 
            value={rplStudents} 
            subtext="RPL 6 Bulan, 1 Tahun, 2 Tahun"
            icon={Users}
            color="bg-indigo-600"
          />
          <StatCard 
            title="Program Akselerasi" 
            value={akselerasiStudents} 
            subtext="Akselerasi S1, S2, D3"
            icon={Users}
            color="bg-violet-600"
          />
        </div>
      </div>

      {/* Additional Sections can be added here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aktivitas Mahasiswa Terbaru</h3>
          <div className="space-y-4">
            {studentAdministrations.slice(0, 5).map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {student.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{student.namaLengkap}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{student.programStudi}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-800 dark:text-slate-100">
                  {student.statusData}
                </span>
              </div>
            ))}
            {studentAdministrations.length === 0 && (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center py-4">Belum ada data mahasiswa.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Transaksi Kas Terakhir</h3>
          <div className="space-y-4">
            {kasLedger.slice(0, 5).map((trx, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{trx.description}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{format(new Date(trx.date), 'dd MMM yyyy', { locale: id })}</p>
                </div>
                <span className={`font-bold ${trx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {trx.type === 'income' ? '+' : '-'}{formatCurrency(trx.amount)}
                </span>
              </div>
            ))}
            {kasLedger.length === 0 && (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center py-4">Belum ada transaksi kas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
