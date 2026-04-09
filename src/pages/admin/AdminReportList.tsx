import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';
import { Plus, Search, FileText, Calendar, Trash2, Edit3, Download } from 'lucide-react';
import { AlertModal } from '../../components/AlertModal';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function AdminReportList() {
  const navigate = useNavigate();
  const { adminReports, deleteAdminReport } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const filteredReports = adminReports.filter(report => 
    report.periodeLaporan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.picAdministrasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.year.includes(searchTerm)
  ).sort((a, b) => b.createdAt - a.createdAt);

  const handleDelete = () => {
    if (deleteModal.id) {
      deleteAdminReport(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Laporan Administrasi</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1 text-sm">Kelola dan buat laporan bulanan administrasi</p>
        </div>
        <button
          onClick={() => navigate('/internal/admin/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          Buat Laporan Baru
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-300" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan periode, PIC, bulan, atau tahun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{report.periodeLaporan || `${report.month} ${report.year}`}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(report.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                report.status === 'final' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' 
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
              }`}>
                {report.status === 'final' ? 'Final' : 'Draft'}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">PIC:</span>
                <span className="font-medium text-gray-900 dark:text-white">{report.picAdministrasi || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Surat Masuk/Keluar:</span>
                <span className="font-medium text-gray-900 dark:text-white">{report.mailRecaps?.length || 0} Item</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Inventaris:</span>
                <span className="font-medium text-gray-900 dark:text-white">{report.inventoryItems?.length || 0} Item</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => navigate(`/internal/admin/edit/${report.id}`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => setDeleteModal({ isOpen: true, id: report.id })}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus Laporan"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada laporan</h3>
            <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 max-w-md mx-auto">
              {searchTerm ? 'Tidak ada laporan yang cocok dengan pencarian Anda.' : 'Mulai buat laporan administrasi pertama Anda dengan mengklik tombol di atas.'}
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Hapus Laporan"
        message="Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
