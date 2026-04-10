import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { formatCurrency } from '../lib/utils';
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

    return Object.values(summary).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [studentAdministrations, dailyAllocations]);

  return (
    <div className="space-y-6">
      {dailySummary.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="font-semibold text-lg">Ringkasan Arus Kas Harian</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `Rp ${value / 1000000}M`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="totalMasuk" name="Dana Masuk" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalDialokasikan" name="Dialokasikan" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Riwayat Dana Masuk Mahasiswa</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari mahasiswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      
      {filteredPayments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Belum ada data pembayaran mahasiswa.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-medium text-gray-600">Tanggal</th>
                <th className="p-4 font-medium text-gray-600">Nama Mahasiswa</th>
                <th className="p-4 font-medium text-gray-600">Program</th>
                <th className="p-4 font-medium text-gray-600">Kampus</th>
                <th className="p-4 font-medium text-gray-600">Prodi</th>
                <th className="p-4 font-medium text-gray-600 text-right">Total Setor</th>
                <th className="p-4 font-medium text-gray-600 text-right">Total Tagih</th>
                <th className="p-4 font-medium text-gray-600">Status Tagihan</th>
                <th className="p-4 font-medium text-gray-600 text-right">Sudah Bayar</th>
                <th className="p-4 font-medium text-gray-600 text-right">Sisa Tagihan</th>
                <th className="p-4 font-medium text-gray-600">Ket. Berkas</th>
                <th className="p-4 font-medium text-gray-600">Catatan Keuangan</th>
                <th className="p-4 font-medium text-gray-600">Periode Pengiriman</th>
                <th className="p-4 font-medium text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="p-4 whitespace-nowrap">{payment.tanggalDaftar ? format(new Date(payment.tanggalDaftar), 'dd MMMM yyyy', { locale: id }) : '-'}</td>
                  <td className="p-4 font-medium text-gray-900">{payment.namaLengkap}</td>
                  <td className="p-4">{payment.program || '-'}</td>
                  <td className="p-4">{payment.perguruanTinggi || '-'}</td>
                  <td className="p-4">{payment.programStudi || '-'}</td>
                  <td className="p-4 text-right font-medium text-green-600">{formatCurrency(Number(payment.totalSetor) || 0)}</td>
                  <td className="p-4 text-right">{formatCurrency(Number(payment.totalTagih) || 0)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.statusTagihan === 'Lunas' ? 'bg-green-100 text-green-700' :
                      payment.statusTagihan === 'Belum Lunas' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.statusTagihan || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-right">{formatCurrency(Number(payment.sudahBayar) || 0)}</td>
                  <td className="p-4 text-right text-red-600">{formatCurrency(Number(payment.sisaTagihan) || 0)}</td>
                  <td className="p-4">{payment.ketBerkas || '-'}</td>
                  <td className="p-4">{payment.catatanKeuangan || '-'}</td>
                  <td className="p-4">{payment.periodePengiriman || '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(payment)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
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
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
