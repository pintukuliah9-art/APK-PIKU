import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Target, TrendingUp, Calendar, DollarSign, 
  BarChart2, PieChart, UserCheck, Plus, ChevronDown, ChevronUp, Trash2, Edit
} from 'lucide-react';
import { formatCurrency, formatNumberInput, parseNumberInput } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { useMarketingStore } from '../../hooks/useMarketingStore';
import { v4 as uuidv4 } from 'uuid';
import { LaporanHarianAds, LaporanHarianCS, DataProspekCRM } from '../../types/app';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function MarketingDashboard() {
  const { 
    timMarketing, akunAds, laporanAds, laporanCS, prospekCRM, targetKPI,
    addLaporanAds, updateLaporanAds, deleteLaporanAds,
    addLaporanCS, updateLaporanCS, deleteLaporanCS,
    addProspekCRM, updateProspekCRM, deleteProspekCRM,
    init
  } = useMarketingStore();

  useEffect(() => {
    init();
  }, [init]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'laporanAds' | 'laporanCS' | 'prospek' | 'pengaturan'>('dashboard');

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Dashboard Calculations
  const totalSpend = useMemo(() => laporanAds.reduce((acc, curr) => acc + curr.spend, 0), [laporanAds]);
  const totalLeads = useMemo(() => laporanAds.reduce((acc, curr) => acc + curr.leadsDihasilkan, 0), [laporanAds]);
  const totalClicks = useMemo(() => laporanAds.reduce((acc, curr) => acc + curr.linkClicks, 0), [laporanAds]);
  const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;

  const totalClosingReguler = useMemo(() => laporanCS.reduce((acc, curr) => acc + curr.closingReguler, 0), [laporanCS]);
  const totalClosingRPL = useMemo(() => laporanCS.reduce((acc, curr) => acc + curr.closingRPL, 0), [laporanCS]);
  const totalClosingAkselerasi = useMemo(() => laporanCS.reduce((acc, curr) => acc + curr.closingAkselerasi, 0), [laporanCS]);
  const totalClosing = totalClosingReguler + totalClosingRPL + totalClosingAkselerasi;

  const totalProspek = prospekCRM.length;
  const conversionRate = totalLeads > 0 ? (totalClosing / totalLeads) * 100 : 0;

  // Chart Data
  const trendData = useMemo(() => {
    const dates = Array.from(new Set([...laporanAds.map(l => l.tanggal), ...laporanCS.map(l => l.tanggal)])).sort();
    return dates.map(date => {
      const leads = laporanAds.filter(l => l.tanggal === date).reduce((acc, curr) => acc + curr.leadsDihasilkan, 0);
      const closing = laporanCS.filter(l => l.tanggal === date).reduce((acc, curr) => acc + curr.closingReguler + curr.closingRPL + curr.closingAkselerasi, 0);
      return { date, leads, closing };
    });
  }, [laporanAds, laporanCS]);

  const pieData = [
    { name: 'Reguler', value: totalClosingReguler, color: '#3B82F6' },
    { name: 'RPL', value: totalClosingRPL, color: '#10B981' },
    { name: 'Akselerasi', value: totalClosingAkselerasi, color: '#F59E0B' },
  ];

  // Ad Account Performance
  const adAccountPerformanceData = useMemo(() => {
    const data: Record<string, { spend: number, leads: number, clicks: number, impresi: number, jangkauan: number }> = {};
    laporanAds.forEach(r => {
      const akun = akunAds.find(a => a.id === r.idAkun)?.namaAkun || 'Unknown';
      if (!data[akun]) data[akun] = { spend: 0, leads: 0, clicks: 0, impresi: 0, jangkauan: 0 };
      data[akun].spend += r.spend;
      data[akun].leads += r.leadsDihasilkan;
      data[akun].clicks += r.linkClicks;
      data[akun].impresi += r.impresi;
      data[akun].jangkauan += r.jangkauan;
    });
    return Object.entries(data).sort((a, b) => b[1].leads - a[1].leads);
  }, [laporanAds, akunAds]);

  // Admin Performance
  const adminPerformanceData = useMemo(() => {
    const data: Record<string, { chat: number, closing: number, responTimeTotal: number, responTimeCount: number }> = {};
    laporanCS.forEach(r => {
      const admin = timMarketing.find(t => t.id === r.idKaryawan)?.namaLengkap || 'Unknown';
      if (!data[admin]) data[admin] = { chat: 0, closing: 0, responTimeTotal: 0, responTimeCount: 0 };
      data[admin].chat += r.chatMerespon;
      data[admin].closing += (r.closingReguler + r.closingRPL + r.closingAkselerasi);
      data[admin].responTimeTotal += r.responTime;
      data[admin].responTimeCount += 1;
    });
    return Object.entries(data).sort((a, b) => b[1].closing - a[1].closing);
  }, [laporanCS, timMarketing]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Marketing & Ads</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200">Monitoring performa Facebook Ads, Leads, dan Closing Tim.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('laporanAds')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'laporanAds' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50'}`}>Laporan Ads</button>
          <button onClick={() => setActiveTab('laporanCS')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'laporanCS' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50'}`}>Laporan CS</button>
          <button onClick={() => setActiveTab('prospek')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'prospek' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50'}`}>Prospek CRM</button>
          <button onClick={() => setActiveTab('pengaturan')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pengaturan' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-slate-800/50'}`}>Pengaturan</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Leads (FB Ads)</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalLeads}</h3>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Target size={20} />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                <span className="text-green-600 font-medium">{(totalLeads / (totalClicks || 1) * 100).toFixed(1)}%</span> Click-to-Lead Ratio
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Ad Spend (Nominal)</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalSpend)}</h3>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Cost Per Lead (CPL): <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(costPerLead)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Closing</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalClosing}</h3>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Conversion Rate: <span className="font-medium text-green-600">{conversionRate.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Prospek CRM</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalProspek}</h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Users size={20} />
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Total data prospek aktif
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tren Leads vs Closing</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="leads" name="Leads Masuk" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="closing" name="Closing Berhasil" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Detail Closing per Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-blue-800">Reguler</h4>
                      <span className="text-xl font-bold text-blue-600">{totalClosingReguler}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-green-800">RPL</h4>
                      <span className="text-xl font-bold text-green-600">{totalClosingRPL}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-orange-800">Akselerasi</h4>
                      <span className="text-xl font-bold text-orange-600">{totalClosingAkselerasi}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribusi Program</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performa Akun Iklan</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Akun Iklan</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Leads</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">CPR</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {adAccountPerformanceData.map(([name, data]) => (
                      <tr key={name} className="hover:bg-gray-50 dark:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{data.leads}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{formatCurrency(data.leads > 0 ? data.spend / data.leads : 0)}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{formatCurrency(data.spend)}</td>
                      </tr>
                    ))}
                    {adAccountPerformanceData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">Belum ada data performa iklan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performa CS Admin</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Nama Admin</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Chat</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Closing</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {adminPerformanceData.map(([name, data]) => (
                      <tr key={name} className="hover:bg-gray-50 dark:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{data.chat}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{data.closing}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{(data.chat > 0 ? (data.closing / data.chat) * 100 : 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                    {adminPerformanceData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">Belum ada data performa admin.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'laporanAds' && <LaporanAdsTab />}
      {activeTab === 'laporanCS' && <LaporanCSTab />}
      {activeTab === 'prospek' && <ProspekCRMTab />}
      {activeTab === 'pengaturan' && <PengaturanMarketingTab />}

    </div>
  );
}

// --- Sub Components for Tabs ---

function LaporanAdsTab() {
  const { laporanAds, akunAds, addLaporanAds, updateLaporanAds, deleteLaporanAds } = useMarketingStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState<Omit<LaporanHarianAds, 'id'>>({
    tanggal: new Date().toISOString().split('T')[0],
    idAkun: '',
    namaCampaign: '',
    spend: 0,
    impresi: 0,
    jangkauan: 0,
    linkClicks: 0,
    leadsDihasilkan: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateLaporanAds(editingId, formData);
    } else {
      addLaporanAds({ ...formData });
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (report: LaporanHarianAds) => {
    setFormData(report);
    setEditingId(report.id);
    setIsFormOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Laporan Harian Ads</h2>
        <button onClick={() => { 
          setEditingId(null); 
          setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            idAkun: '', spend: 0, impresi: 0, jangkauan: 0, linkClicks: 0, leadsDihasilkan: 0, keterangan: ''
          });
          setIsFormOpen(true); 
        }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} /> Tambah Laporan Ads
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Akun Ads</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Spend</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Leads</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">CPR</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {laporanAds.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(report => {
                const akun = akunAds.find(a => a.id === report.idAkun)?.namaAkun || 'Unknown';
                const cpr = report.leadsDihasilkan > 0 ? report.spend / report.leadsDihasilkan : 0;
                return (
                  <tr key={report.id} className="hover:bg-gray-50 dark:bg-slate-800/50">
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{report.tanggal}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{akun}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{formatCurrency(report.spend)}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{report.leadsDihasilkan}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{formatCurrency(cpr)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(report)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit size={16} /></button>
                      <button onClick={() => { 
                        setConfirmModal({
                          isOpen: true,
                          title: 'Hapus Laporan Ads',
                          message: 'Apakah Anda yakin ingin menghapus laporan ini?',
                          onConfirm: () => deleteLaporanAds(report.id)
                        });
                      }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {laporanAds.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">Belum ada data laporan ads.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Tambah'} Laporan Ads</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Akun Ads</label>
                  <select required value={formData.idAkun} onChange={e => setFormData({...formData, idAkun: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Pilih Akun...</option>
                    {akunAds.map(a => <option key={a.id} value={a.id}>{a.namaAkun}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Campaign</label>
                  <input type="text" required value={formData.namaCampaign} onChange={e => setFormData({...formData, namaCampaign: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Spend (Rp)</label>
                  <input type="text" required value={formatNumberInput(formData.spend)} onChange={e => setFormData({...formData, spend: parseNumberInput(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Leads Dihasilkan</label>
                  <input type="number" required value={formData.leadsDihasilkan} onChange={e => setFormData({...formData, leadsDihasilkan: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Link Clicks</label>
                  <input type="number" required value={formData.linkClicks} onChange={e => setFormData({...formData, linkClicks: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Impresi</label>
                  <input type="number" value={formData.impresi} onChange={e => setFormData({...formData, impresi: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jangkauan</label>
                  <input type="number" value={formData.jangkauan} onChange={e => setFormData({...formData, jangkauan: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}

function LaporanCSTab() {
  const { laporanCS, timMarketing, addLaporanCS, updateLaporanCS, deleteLaporanCS } = useMarketingStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState<Omit<LaporanHarianCS, 'id'>>({
    tanggal: new Date().toISOString().split('T')[0],
    idKaryawan: '',
    leadsDiterima: 0,
    chatMerespon: 0,
    responTime: 0,
    closingReguler: 0,
    closingRPL: 0,
    closingAkselerasi: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateLaporanCS(editingId, formData);
    } else {
      addLaporanCS({ ...formData });
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (report: LaporanHarianCS) => {
    setFormData(report);
    setEditingId(report.id);
    setIsFormOpen(true);
  };

  const csAdmins = timMarketing.filter(t => t.posisi === 'CS Admin' || t.posisi === 'SPV' || t.posisi === 'Advertiser');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Laporan Harian CS</h2>
        <button onClick={() => { 
          setEditingId(null); 
          setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            idKaryawan: '', leadsDiterima: 0, chatMerespon: 0, responTime: 0, closingReguler: 0, closingRPL: 0, closingAkselerasi: 0
          });
          setIsFormOpen(true); 
        }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} /> Tambah Laporan CS
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">CS Admin</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Leads Diterima</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Chat Merespon</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Total Closing</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Respon Time</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {laporanCS.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(report => {
                const admin = timMarketing.find(t => t.id === report.idKaryawan)?.namaLengkap || 'Unknown';
                const totalClosing = report.closingReguler + report.closingRPL + report.closingAkselerasi;
                return (
                  <tr key={report.id} className="hover:bg-gray-50 dark:bg-slate-800/50">
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{report.tanggal}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{admin}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{report.leadsDiterima}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{report.chatMerespon}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{totalClosing}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{report.responTime} mnt</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(report)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit size={16} /></button>
                      <button onClick={() => { 
                        setConfirmModal({
                          isOpen: true,
                          title: 'Hapus Laporan CS',
                          message: 'Apakah Anda yakin ingin menghapus laporan ini?',
                          onConfirm: () => deleteLaporanCS(report.id)
                        });
                      }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {laporanCS.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">Belum ada data laporan CS.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Tambah'} Laporan CS</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CS Admin</label>
                  <select required value={formData.idKaryawan} onChange={e => setFormData({...formData, idKaryawan: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Pilih Admin...</option>
                    {csAdmins.map(a => <option key={a.id} value={a.id}>{a.namaLengkap}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Leads Diterima</label>
                  <input type="number" required value={formData.leadsDiterima} onChange={e => setFormData({...formData, leadsDiterima: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Chat Merespon</label>
                  <input type="number" required value={formData.chatMerespon} onChange={e => setFormData({...formData, chatMerespon: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Respon Time (Menit)</label>
                  <input type="number" required value={formData.responTime} onChange={e => setFormData({...formData, responTime: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Closing Reguler</label>
                  <input type="number" required value={formData.closingReguler} onChange={e => setFormData({...formData, closingReguler: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Closing RPL</label>
                  <input type="number" required value={formData.closingRPL} onChange={e => setFormData({...formData, closingRPL: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Closing Akselerasi</label>
                  <input type="number" required value={formData.closingAkselerasi} onChange={e => setFormData({...formData, closingAkselerasi: e.target.value === '' ? '' as any : parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}

function ProspekCRMTab() {
  const { prospekCRM, timMarketing, addProspekCRM, updateProspekCRM, deleteProspekCRM } = useMarketingStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState<Omit<DataProspekCRM, 'id'>>({
    tanggalMasuk: new Date().toISOString().split('T')[0],
    namaProspek: '',
    noWhatsApp: '',
    sumberLeads: 'FB Ads',
    programDiminati: 'Reguler',
    statusProspek: 'New',
    idKaryawanHandle: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProspekCRM(editingId, formData);
    } else {
      addProspekCRM({ ...formData });
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (prospek: DataProspekCRM) => {
    setFormData(prospek);
    setEditingId(prospek.id);
    setIsFormOpen(true);
  };

  const csAdmins = timMarketing.filter(t => t.posisi === 'CS Admin' || t.posisi === 'SPV' || t.posisi === 'Advertiser');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Prospek CRM</h2>
        <button onClick={() => { 
          setEditingId(null); 
          setFormData({
            tanggalMasuk: new Date().toISOString().split('T')[0],
            namaProspek: '', noWhatsApp: '', sumberLeads: 'FB Ads', programDiminati: 'Reguler', statusProspek: 'New', idKaryawanHandle: ''
          });
          setIsFormOpen(true); 
        }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} /> Tambah Prospek
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Nama Prospek</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">No WA</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Program</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">PIC</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prospekCRM.sort((a, b) => new Date(b.tanggalMasuk).getTime() - new Date(a.tanggalMasuk).getTime()).map(prospek => {
                const pic = timMarketing.find(t => t.id === prospek.idKaryawanHandle)?.namaLengkap || 'Unknown';
                return (
                  <tr key={prospek.id} className="hover:bg-gray-50 dark:bg-slate-800/50">
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{prospek.tanggalMasuk}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{prospek.namaProspek}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{prospek.noWhatsApp}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{prospek.programDiminati}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${prospek.statusProspek === 'Closing' ? 'bg-green-100 text-green-700' : 
                          prospek.statusProspek === 'Follow Up' ? 'bg-blue-100 text-blue-700' : 
                          prospek.statusProspek === 'Gagal/Mundur' ? 'bg-red-100 text-red-700' : 
                          'bg-gray-100 text-gray-700 dark:text-slate-300'}`}>
                        {prospek.statusProspek}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{pic}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(prospek)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit size={16} /></button>
                      <button onClick={() => { 
                        setConfirmModal({
                          isOpen: true,
                          title: 'Hapus Prospek',
                          message: 'Apakah Anda yakin ingin menghapus prospek ini?',
                          onConfirm: () => deleteProspekCRM(prospek.id)
                        });
                      }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {prospekCRM.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">Belum ada data prospek CRM.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Tambah'} Prospek CRM</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Masuk</label>
                  <input type="date" required value={formData.tanggalMasuk} onChange={e => setFormData({...formData, tanggalMasuk: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Prospek</label>
                  <input type="text" required value={formData.namaProspek} onChange={e => setFormData({...formData, namaProspek: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">No WhatsApp</label>
                  <input type="text" required value={formData.noWhatsApp} onChange={e => setFormData({...formData, noWhatsApp: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sumber Leads</label>
                  <select required value={formData.sumberLeads} onChange={e => setFormData({...formData, sumberLeads: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="FB Ads">FB Ads</option>
                    <option value="IG Ads">IG Ads</option>
                    <option value="Tiktok Ads">Tiktok Ads</option>
                    <option value="Organik">Organik</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Program Diminati</label>
                  <select required value={formData.programDiminati} onChange={e => setFormData({...formData, programDiminati: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="Reguler">Reguler</option>
                    <option value="RPL">RPL</option>
                    <option value="Akselerasi">Akselerasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status Prospek</label>
                  <select required value={formData.statusProspek} onChange={e => setFormData({...formData, statusProspek: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="New">New</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Pemberkasan">Pemberkasan</option>
                    <option value="Closing">Closing</option>
                    <option value="Gagal/Mundur">Gagal/Mundur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">PIC (CS Admin)</label>
                  <select required value={formData.idKaryawanHandle} onChange={e => setFormData({...formData, idKaryawanHandle: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Pilih Admin...</option>
                    {csAdmins.map(a => <option key={a.id} value={a.id}>{a.namaLengkap}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}

function PengaturanMarketingTab() {
  const { 
    timMarketing, akunAds, targetKPI,
    addTimMarketing, deleteTimMarketing,
    addAkunAds, deleteAkunAds,
    addTargetKPI, deleteTargetKPI
  } = useMarketingStore();

  const [newTim, setNewTim] = useState({ namaLengkap: '', posisi: 'Advertiser', status: 'Aktif' });
  const [newAkun, setNewAkun] = useState({ namaAkun: '', platform: 'Facebook' });
  const [newKPI, setNewKPI] = useState({ bulanTahun: '', targetSpend: 0, targetLeads: 0, targetClosing: 0, batasMaksimalCPL: 0 });

  return (
    <div className="space-y-8">
      {/* Tim Marketing */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Data Tim Marketing</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Nama Lengkap" 
            value={newTim.namaLengkap}
            onChange={e => setNewTim({...newTim, namaLengkap: e.target.value})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <select 
            value={newTim.posisi}
            onChange={e => setNewTim({...newTim, posisi: e.target.value})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          >
            <option value="Advertiser">Advertiser</option>
            <option value="CS Admin">CS Admin</option>
            <option value="SPV">SPV</option>
          </select>
          <select 
            value={newTim.status}
            onChange={e => setNewTim({...newTim, status: e.target.value})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          >
            <option value="Aktif">Aktif</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>
          <button 
            onClick={() => {
              if (newTim.namaLengkap) {
                addTimMarketing(newTim as any);
                setNewTim({ namaLengkap: '', posisi: 'Advertiser', status: 'Aktif' });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah Tim
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Nama Lengkap</th>
                <th className="pb-3 font-medium">Posisi</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {timMarketing.map(tim => (
                <tr key={tim.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-3 text-slate-900 dark:text-white">{tim.namaLengkap}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{tim.posisi}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{tim.status}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => deleteTimMarketing(tim.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Akun Ads */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Data Akun Ads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Nama Akun" 
            value={newAkun.namaAkun}
            onChange={e => setNewAkun({...newAkun, namaAkun: e.target.value})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <select 
            value={newAkun.platform}
            onChange={e => setNewAkun({...newAkun, platform: e.target.value})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          >
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Google">Google</option>
            <option value="TikTok">TikTok</option>
          </select>
          <button 
            onClick={() => {
              if (newAkun.namaAkun) {
                addAkunAds(newAkun as any);
                setNewAkun({ namaAkun: '', platform: 'Facebook' });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah Akun
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Nama Akun</th>
                <th className="pb-3 font-medium">Platform</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {akunAds.map(akun => (
                <tr key={akun.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-3 text-slate-900 dark:text-white">{akun.namaAkun}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{akun.platform}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => deleteAkunAds(akun.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target KPI */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Target KPI Bulanan</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <input 
            type="month" 
            value={newKPI.bulanTahun}
            onChange={e => setNewKPI({...newKPI, bulanTahun: e.target.value})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <input 
            type="number" 
            placeholder="Target Spend" 
            value={newKPI.targetSpend || ''}
            onChange={e => setNewKPI({...newKPI, targetSpend: Number(e.target.value)})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <input 
            type="number" 
            placeholder="Target Leads" 
            value={newKPI.targetLeads || ''}
            onChange={e => setNewKPI({...newKPI, targetLeads: Number(e.target.value)})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <input 
            type="number" 
            placeholder="Target Closing" 
            value={newKPI.targetClosing || ''}
            onChange={e => setNewKPI({...newKPI, targetClosing: Number(e.target.value)})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <input 
            type="number" 
            placeholder="Batas CPL" 
            value={newKPI.batasMaksimalCPL || ''}
            onChange={e => setNewKPI({...newKPI, batasMaksimalCPL: Number(e.target.value)})}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <button 
            onClick={() => {
              if (newKPI.bulanTahun) {
                addTargetKPI(newKPI as any);
                setNewKPI({ bulanTahun: '', targetSpend: 0, targetLeads: 0, targetClosing: 0, batasMaksimalCPL: 0 });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Bulan</th>
                <th className="pb-3 font-medium">Target Spend</th>
                <th className="pb-3 font-medium">Target Leads</th>
                <th className="pb-3 font-medium">Target Closing</th>
                <th className="pb-3 font-medium">Batas CPL</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {targetKPI.map(kpi => (
                <tr key={kpi.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-3 text-slate-900 dark:text-white">{kpi.bulanTahun}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{formatCurrency(kpi.targetSpend)}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{kpi.targetLeads}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{kpi.targetClosing}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{formatCurrency(kpi.batasMaksimalCPL)}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => deleteTargetKPI(kpi.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
