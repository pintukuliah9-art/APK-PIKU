import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FinanceReportForm } from '../../components/FinanceReportForm';
import { FinanceReportPreview } from '../../components/FinanceReportPreview';
import { FinanceReportData, initialFinanceReportData } from '../../types';
import { SavedFinanceReport } from '../../types/app';
import { Save, Download, ArrowLeft, CheckCircle } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { AlertModal } from '../../components/AlertModal';

export default function FinanceReportEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<FinanceReportData>(initialFinanceReportData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' });
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const savedReportsJson = localStorage.getItem('finance_reports');
      if (savedReportsJson) {
        const savedReports: SavedFinanceReport[] = JSON.parse(savedReportsJson);
        const report = savedReports.find(r => r.id === id);
        if (report) {
          setData(report);
          return;
        }
      }
    }

    const savedDraft = localStorage.getItem('finance_report_draft');
    if (savedDraft && !id) {
      try {
        setData(JSON.parse(savedDraft));
      } catch (e) {
        console.error('Failed to parse saved draft');
      }
    }
  }, [id]);

  const handleSaveDraft = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('finance_report_draft', JSON.stringify(data));
      setAlertModal({
        isOpen: true,
        title: 'Berhasil',
        message: 'Draft laporan berhasil disimpan.',
        type: 'success'
      });
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Gagal Menyimpan',
        message: 'Gagal menyimpan draft. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        filename:     `Laporan_Keuangan_${data.month}_${data.year}.pdf`,
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

  const handleSaveFinal = () => {
    setIsSaving(true);
    try {
      const savedReportsJson = localStorage.getItem('finance_reports');
      let savedReports: SavedFinanceReport[] = savedReportsJson ? JSON.parse(savedReportsJson) : [];
      
      if (id) {
        savedReports = savedReports.map(r => r.id === id ? { ...data, id, updatedAt: Date.now(), status: 'final' as const } : r);
      } else {
        const newReport: SavedFinanceReport = {
          ...data,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'final' as const
        };
        savedReports.push(newReport);
      }
      
      localStorage.setItem('finance_reports', JSON.stringify(savedReports));
      if (!id) {
        localStorage.removeItem('finance_report_draft');
      }
      
      setAlertModal({
        isOpen: true,
        title: 'Berhasil',
        message: 'Laporan final berhasil disimpan.',
        type: 'success'
      });
      
      setTimeout(() => {
        navigate('/internal/finance/reports');
      }, 1500);
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Gagal Menyimpan',
        message: 'Gagal menyimpan laporan final. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-white dark:bg-slate-900 border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-500 dark:text-slate-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editor Laporan Keuangan</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Draft
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 dark:text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Memproses...' : 'Download PDF'}
              </button>
              <button
                onClick={handleSaveFinal}
                disabled={isSaving}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 dark:text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Simpan Final
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Data Laporan</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Isi data laporan keuangan di bawah ini.</p>
              </div>
              <div className="p-6 h-[calc(100vh-250px)] overflow-y-auto">
                <FinanceReportForm data={data} onChange={setData} />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden sticky top-24">
              <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Preview Laporan</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Tampilan laporan yang akan dicetak.</p>
                </div>
              </div>
              <div className="p-6 bg-gray-200 h-[calc(100vh-250px)] overflow-y-auto flex justify-center">
                <div ref={componentRef} className="transform scale-[0.85] origin-top">
                  <FinanceReportPreview data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
