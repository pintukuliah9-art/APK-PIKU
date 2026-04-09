import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';
import { AdminReportForm } from '../../components/AdminReportForm';
import { AdminReportPreview } from '../../components/AdminReportPreview';
import { AdminReportData, initialAdminReportData } from '../../types';
import { SavedAdminReport } from '../../types/app';
import { Save, Download, ArrowLeft, CheckCircle } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { AlertModal } from '../../components/AlertModal';

export default function AdminReportEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminReports, addAdminReport, updateAdminReport, settings } = useAppStore();
  const [data, setData] = useState<AdminReportData>(initialAdminReportData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Alert Modal State
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleDownloadPDF = async () => {
    const element = componentRef.current?.querySelector('.report-page') as HTMLElement;
    if (!element) return;

    setIsDownloading(true);
    
    // Temporarily adjust classes for PDF generation to ensure margins on all pages
    element.classList.remove('w-[210mm]', 'min-h-[297mm]', 'p-[15mm]', 'shadow-lg', 'shadow-sm');
    element.style.width = '180mm'; // 210mm - 30mm (15mm margin on each side)

    try {
      const opt = {
        margin:       15,
        filename:     `Laporan_Administrasi_${data.month}_${data.year}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['tr', '.break-inside-avoid'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      setAlertModal({
        isOpen: true,
        title: 'Berhasil',
        message: 'PDF berhasil diunduh.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setAlertModal({
        isOpen: true,
        title: 'Gagal Mengunduh',
        message: 'Gagal mengunduh PDF. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      // Restore original classes
      element.classList.add('w-[210mm]', 'min-h-[297mm]', 'p-[15mm]', 'shadow-sm');
      element.style.width = '';
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const existingReport = adminReports.find(r => r.id === id);
      if (existingReport) {
        setData(existingReport);
      }
    } else {
      setData(prev => ({
        ...prev,
        signature: {
          ...prev.signature,
          name: settings.defaultSigner.name,
          role: settings.defaultSigner.role,
          city: settings.defaultSigner.city,
        }
      }));
    }
  }, [id, adminReports, settings]);

  const handleSave = async (status: 'draft' | 'final' = 'draft') => {
    setIsSaving(true);
    try {
      if (id) {
        updateAdminReport(id, { ...data, status });
        setAlertModal({
          isOpen: true,
          title: 'Berhasil',
          message: `Laporan berhasil diperbarui sebagai ${status === 'final' ? 'Final' : 'Draft'}.`,
          type: 'success'
        });
      } else {
        const newId = addAdminReport({ ...data, status });
        navigate(`/internal/admin/edit/${newId}`, { replace: true });
        setAlertModal({
          isOpen: true,
          title: 'Berhasil',
          message: `Laporan baru berhasil disimpan sebagai ${status === 'final' ? 'Final' : 'Draft'}.`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to save report', error);
      setAlertModal({
        isOpen: true,
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan laporan.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-blue-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/internal/admin/reports')}
            className="p-2 text-slate-600 dark:text-slate-400 dark:text-blue-200 hover:text-slate-900 dark:text-white hover:bg-blue-800/50 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {id ? 'Edit Laporan Administrasi' : 'Buat Laporan Administrasi'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1 text-sm">
              {id ? 'Perbarui data laporan yang sudah ada' : 'Isi form di bawah untuk membuat laporan baru'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-800/50 text-blue-100 hover:bg-blue-700/50 rounded-xl transition-colors font-medium border border-blue-700/50 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
          <button
            onClick={() => handleSave('final')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-green-900/20 disabled:opacity-50"
          >
            <CheckCircle size={18} />
            Simpan Final
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            <Download size={18} />
            {isDownloading ? 'Memproses PDF...' : 'Unduh PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Form Laporan</h2>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
            <AdminReportForm data={data} onChange={setData} />
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-200/50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Pratinjau Dokumen</h2>
            <span className="text-xs text-gray-500 dark:text-slate-400">Ukuran F4 (210 x 330 mm)</span>
          </div>
          <div className="p-8 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar flex-1 bg-gray-100">
            <div ref={componentRef} className="flex flex-col gap-8 items-center">
              <AdminReportPreview data={data} />
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
