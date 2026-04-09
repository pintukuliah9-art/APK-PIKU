import { useAppStore } from '../../hooks/useAppStore';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useState } from 'react';

export default function InternalReportList() {
  const { internalReports, deleteInternalReport } = useAppStore();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daftar Laporan Internal</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200">Kelola semua laporan internal bulanan yang telah dibuat</p>
        </div>
        <Link
          to="/internal/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Buat Laporan Baru
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Periode</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Mahasiswa Aktif</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Saldo Finance</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Karyawan Aktif</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Tanggal Dibuat</th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {internalReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    Belum ada laporan internal yang dibuat.
                  </td>
                </tr>
              ) : (
                internalReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                      {report.month} {report.year}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      {report.admin.activeStudents} Orang
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400 font-mono">
                      {formatCurrency(report.finance.saldo)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      {report.hr.activeEmployees} Orang
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'final' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status === 'final' ? 'Final' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {format(report.createdAt, 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/internal/edit/${report.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Hapus Laporan',
                              message: 'Apakah Anda yakin ingin menghapus laporan ini?',
                              onConfirm: () => deleteInternalReport(report.id)
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
