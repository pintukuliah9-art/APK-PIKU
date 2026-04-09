import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';
import { InternalReportForm } from '../../components/InternalReportForm';
import { InternalReportPreview } from '../../components/InternalReportPreview';
import { InternalReportData, initialInternalReportData } from '../../types';
import { SavedInternalReport } from '../../types/app';
import { Save, Download, ArrowLeft, CheckCircle } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { AlertModal } from '../../components/AlertModal';

export default function InternalReportEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { internalReports, addInternalReport, updateInternalReport, settings } = useAppStore();
  const [data, setData] = useState<InternalReportData>(initialInternalReportData);
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
        filename:     `Laporan_Internal_${data.month}_${data.year}.pdf`,
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
      element.classList.add('w-[210mm]', 'min-h-[297mm]', 'p-[15mm]', 'shadow-lg');
      element.style.width = '';
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const existingReport = internalReports.find(r => r.id === id);
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
  }, [id, internalReports, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (id) {
        updateInternalReport(id, { ...data, status: 'final' });
      } else {
        const newId = addInternalReport({ ...data, status: 'final' });
        navigate(`/internal/edit/${newId}`, { replace: true });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/internal/reports')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {id ? 'Edit Laporan Internal' : 'Buat Laporan Internal'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200">Isi data laporan internal bulanan</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:bg-slate-800/50 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Simpan Laporan
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={20} />
            )}
            Unduh PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Formulir Laporan</h2>
          </div>
          <div className="p-6">
            <InternalReportForm data={data} onChange={setData} />
          </div>
        </div>

        <div className="xl:sticky xl:top-8 h-fit">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preview Dokumen</h2>
              <span className="text-sm text-gray-500 dark:text-slate-400">Ukuran F4 (210 x 330 mm)</span>
            </div>
            <div className="p-6 bg-gray-100 overflow-auto max-h-[calc(100vh-12rem)]">
              <div className="flex justify-center">
                <div ref={componentRef}>
                  <InternalReportPreview data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        {...alertModal}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
