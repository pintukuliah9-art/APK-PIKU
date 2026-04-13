import React, { useState, useMemo } from 'react';
import { useAppStore } from '../contexts/AppStoreContext';
import { formatCurrency, parseDateSafe, formatDateSafe } from '../lib/utils';
import { Trash2, Search, TrendingUp, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentAdministration } from '../types/app';
import { ConfirmModal } from './ConfirmModal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  onEdit: (payment: StudentAdministration) => void;
}

export function StudentPaymentsTab({ onEdit }: Props) {
  const { studentAdministrations, deleteStudentAdministration, dailyAllocations } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPayments = studentAdministrations.filter(payment => 
    (payment.namaLengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.statusTagihan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.catatanKeuangan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.periodePengiriman || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.perguruanTinggi && payment.perguruanTinggi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const dailySummary = useMemo(() => {
    const summary: Record<string, { date: string; totalMasuk: number; totalDialokasikan: number; sisa: number }> = {};
    
    // Aggregate incoming payments
    studentAdministrations.forEach(p => {
      const date = p.tanggalDaftar || '';
      if (!summary[date]) {
        summary[date] = { date: date, totalMasuk: 0, totalDialokasikan: 0, sisa: 0 };
      }
      summary[date].totalMasuk += Number(p.sudahBayar) || 0;
    });

    // Aggregate allocations
    dailyAllocations.forEach(a => {
      if (!summary[a.date]) {
        summary[a.date] = { date: a.date, totalMasuk: 0, totalDialokasikan: 0, sisa: 0 };
      }
      summary[a.date].totalDialokasikan += a.totalIncome;
    });

    // Calculate remaining
    Object.values(summary).forEach(s => {
      s.sisa = s.totalMasuk - s.totalDialokasikan;
    });

    return Object.values(summary).sort((a, b) => parseDateSafe(a.date).getTime() - parseDateSafe(b.date).getTime());
  }, [studentAdministrations, dailyAllocations]);

  return (
    <div className="space-y-6">
      {dailySummary.length > 0 && (
        <div className="bg-white dark:bg-[#1A1C23] rounded-xl shadow-sm border border-slate-100 dark:border-[#2A2D35] p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Ringkasan Arus Kas Harian</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-20" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `Rp ${value / 1000000}M`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: '#F3F4F6', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1A1C23', color: '#fff' }}
                />
                <Bar dataKey="totalMasuk" name="Dana Masuk" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalDialokasikan" name="Dialokasikan" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1C23] rounded-xl shadow-sm border border-slate-100 dark:border-[#2A2D35] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-[#2A2D35] flex justify-between items-center">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Riwayat Dana Masuk Mahasiswa</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari mahasiswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 dark:border-[#2A2D35] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#111318] text-slate-900 dark:text-white"
          />
        </div>
      </div>
      
      {filteredPayments.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          Belum ada data pembayaran mahasiswa.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-[#111318] border-b border-slate-100 dark:border-[#2A2D35] text-sm">
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Tanggal</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Nama Mahasiswa</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Program</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Kampus</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Prodi</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400 text-right">Total Setor</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400 text-right">Total Tagih</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Status Tagihan</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400 text-right">Sudah Bayar</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400 text-right">Sisa Tagihan</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Ket. Berkas</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Catatan Keuangan</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Periode Pengiriman</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2A2D35] text-sm">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-[#111318] transition-colors">
                  <td className="p-4 whitespace-nowrap text-slate-900 dark:text-white">{payment.tanggalDaftar ? formatDateSafe(payment.tanggalDaftar, 'dd MMMM yyyy') : '-'}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{payment.namaLengkap}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{payment.program || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{payment.perguruanTinggi || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{payment.programStudi || '-'}</td>
                  <td className="p-4 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(payment.totalSetor) || 0)}</td>
                  <td className="p-4 text-right text-slate-900 dark:text-white">{formatCurrency(Number(payment.totalTagih) || 0)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.statusTagihan === 'Lunas' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' :
                      payment.statusTagihan === 'Belum Lunas' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}>
                      {payment.statusTagihan || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-900 dark:text-white">{formatCurrency(Number(payment.sudahBayar) || 0)}</td>
                  <td className="p-4 text-right text-rose-600 dark:text-rose-400">{formatCurrency(Number(payment.sisaTagihan) || 0)}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{payment.ketBerkas || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{payment.catatanKeuangan || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{payment.periodePengiriman || '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(payment)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Hapus Pembayaran',
                            message: 'Apakah Anda yakin ingin menghapus data pembayaran ini?',
                            onConfirm: () => deleteStudentAdministration(payment.id)
                          });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
