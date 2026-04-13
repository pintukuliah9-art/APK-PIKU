import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Edit, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SavedFinanceReport } from '../../types/app';
import { formatDateSafe } from '../../lib/utils';

export default function FinanceReportList() {
  const navigate = useNavigate();
  const [financeReports, setFinanceReports] = useState<SavedFinanceReport[]>([]);
  
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

  useEffect(() => {
    const savedReportsJson = localStorage.getItem('finance_reports');
    if (savedReportsJson) {
      try {
        setFinanceReports(JSON.parse(savedReportsJson));
      } catch (e) {
        console.error('Failed to parse finance reports');
      }
    }
  }, []);

  const deleteFinanceReport = (id: string) => {
    const updatedReports = financeReports.filter(report => report.id !== id);
    setFinanceReports(updatedReports);
    localStorage.setItem('finance_reports', JSON.stringify(updatedReports));
  };

  const handleDelete = (id: string, month: string, year: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Laporan',
      message: `Apakah Anda yakin ingin menghapus laporan keuangan bulan ${month} ${year}?`,
      onConfirm: () => {
        deleteFinanceReport(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-blue-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Laporan Keuangan</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1 text-sm">Kelola laporan bulanan keuangan</p>
        </div>
        <button
          onClick={() => navigate('/internal/finance/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium"
        >
          <Plus size={20} />
          Buat Laporan Baru
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {financeReports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Belum ada laporan</h3>
            <p className="text-gray-500 dark:text-slate-400">Mulai dengan membuat laporan keuangan pertama Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {financeReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-blue-50/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Laporan Keuangan {report.month} {report.year}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Dibuat: {formatDateSafe(report.createdAt)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'final' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status === 'final' ? 'Final' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/internal/finance/edit/${report.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit Laporan"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id, report.month, report.year)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Laporan"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
