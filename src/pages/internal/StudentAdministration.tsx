import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { StudentAdministration } from '../../types/app';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { 
  Users, 
  FileCheck, 
  FileWarning, 
  FileX, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  Database,
  Download,
  Upload,
  RefreshCw,
  FileDown,
  Settings,
  X
} from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import * as XLSX from 'xlsx';

const initialFormData: Omit<StudentAdministration, 'id'> = {
  tanggalDaftar: format(new Date(), 'dd MMMM yyyy', { locale: enUS }),
  jalurInput: '',
  koordinator: '',
  program: '',
  perguruanTinggi: '',
  programStudi: '',
  kloterInput: '',
  periodePendaftaran: '',
  periodeKuliah: '',
  namaLengkap: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  nik: '',
  namaIbu: '',
  kelurahan: '',
  kecamatan: '',
  kabupatenKota: '',
  provinsi: '',
  email: '',
  noHp: '',
  lulusSmaS1: '',
  lulusKuliah: '',
  linkDoc: '',
  ketDokumen: '',
  statusBerkas: '',
  catatanMahasiswa: '',
  tanggalInput: format(new Date(), 'dd MMMM yyyy', { locale: enUS }),
  statusData: '',
  linkPddikti: '',
  linkPisn: '',
  nimNpm: '',
  nomorIjazah: '',
  tanggalMasuk: '',
  tanggalLulus: '',
  pasPhoto: '',
  judulSkripsi: '',
  banPt: '',
  gelarAkademik: '',
  ketRevisi: '',
  totalSetor: 0,
  statusTagihan: '',
  totalTagih: 0,
  sudahBayar: 0,
  sisaTagihan: 0,
  ketBerkas: '',
  catatanKeuangan: '',
  periodePengiriman: ''
};

const AVAILABLE_EXPORT_COLUMNS = [
  { id: 'tanggalDaftar', label: 'TANGGAL DAFTAR' },
  { id: 'jalurInput', label: 'JALUR INPUT' },
  { id: 'koordinator', label: 'KOORDINATOR' },
  { id: 'program', label: 'PROGRAM' },
  { id: 'perguruanTinggi', label: 'PERGURUAN TINGGI' },
  { id: 'programStudi', label: 'PROGRAM STUDI' },
  { id: 'kloterInput', label: 'KLOTER INPUT' },
  { id: 'periodePendaftaran', label: 'PERIODE PENDAFTARAN' },
  { id: 'periodeKuliah', label: 'PERIODE KULIAH' },
  { id: 'namaLengkap', label: 'NAMA LENGKAP' },
  { id: 'tempatLahir', label: 'TEMPAT LAHIR' },
  { id: 'tanggalLahir', label: 'TANGGAL LAHIR' },
  { id: 'jenisKelamin', label: 'JENIS KELAMIN' },
  { id: 'agama', label: 'AGAMA' },
  { id: 'nik', label: 'NIK' },
  { id: 'namaIbu', label: 'NAMA IBU' },
  { id: 'kelurahan', label: 'KELURAHAN' },
  { id: 'kecamatan', label: 'KECAMATAN' },
  { id: 'kabupatenKota', label: 'KABUPATEN/KOTA' },
  { id: 'provinsi', label: 'PROVINSI' },
  { id: 'email', label: 'EMAIL' },
  { id: 'noHp', label: 'NO HP' },
  { id: 'lulusSmaS1', label: 'LULUS SMA/S1' },
  { id: 'lulusKuliah', label: 'LULUS KULIAH' },
  { id: 'linkDoc', label: 'LINK DOC' },
  { id: 'ketDokumen', label: 'KET DOKUMEN' },
  { id: 'statusBerkas', label: 'STATUS BERKAS' },
  { id: 'catatanMahasiswa', label: 'CATATAN MAHASISWA' },
  { id: 'statusData', label: 'STATUS DATA' },
  { id: 'linkPddikti', label: 'LINK PDDIKTI' },
  { id: 'linkPisn', label: 'LINK PISN' },
  { id: 'nimNpm', label: 'NIM/NPM' },
  { id: 'nomorIjazah', label: 'NOMOR IJAZAH' },
  { id: 'tanggalInput', label: 'TANGGAL INPUT' },
  { id: 'tanggalMasuk', label: 'TANGGAL MASUK' },
  { id: 'tanggalLulus', label: 'TANGGAL LULUS' },
  { id: 'pasPhoto', label: 'PAS PHOTO' },
  { id: 'judulSkripsi', label: 'JUDUL SKRIPSI' },
  { id: 'banPt', label: 'BAN PT' },
  { id: 'gelarAkademik', label: 'GELAR AKADEMIK' },
  { id: 'ketRevisi', label: 'KET REVISI' },
  { id: 'totalSetor', label: 'TOTAL SETOR' },
  { id: 'statusTagihan', label: 'STATUS TAGIHAN' },
  { id: 'totalTagih', label: 'TOTAL TAGIH' },
  { id: 'sudahBayar', label: 'SUDAH BAYAR' },
  { id: 'sisaTagihan', label: 'SISA TAGIHAN' },
  { id: 'ketBerkas', label: 'KET BERKAS' },
  { id: 'catatanKeuangan', label: 'CATATAN KEUANGAN' },
  { id: 'periodePengiriman', label: 'PERIODE PENGIRIMAN' }
];

const STATUS_INFO = [
  { status: 'Validasi Data', desc: 'Pengecekan kebenaran identitas mahasiswa' },
  { status: 'Proses PDDikti', desc: 'Data sedang dalam antrean sinkronisasi ke sistem pusat.' },
  { status: 'Aktif PDDikti', desc: 'Terdaftar resmi sebagai mahasiswa yang sedang kuliah.' },
  { status: 'Lulus PISN', desc: 'Tahap pemberian nomor ijazah nasional secara otomatis.' },
  { status: 'Selesai', desc: 'Seluruh proses pelaporan data telah final dan sukses.' },
  { status: 'Revisi Sistem', desc: 'Ada data yang salah dan perlu diperbaiki oleh kampus.' },
  { status: 'Tunda', desc: 'Proses dihentikan sementara karena syarat belum lengkap.' },
  { status: 'Keluar', desc: 'Berhenti kuliah (Drop Out, Mengundurkan Diri, atau Pindah).' }
];

export default function StudentAdministrationPage() {
  const { studentAdministrations, addStudentAdministration, updateStudentAdministration, deleteStudentAdministration, deleteAllStudentAdministrations, settings, syncFromCloud, isSyncing } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [visibleFilters, setVisibleFilters] = useState<string[]>(() => {
    const saved = localStorage.getItem('studentAdmin_visibleFilters');
    return saved ? JSON.parse(saved) : ['program', 'statusBerkas', 'statusData'];
  });
  const [exportColumns, setExportColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('studentAdmin_exportColumns');
    return saved ? JSON.parse(saved) : AVAILABLE_EXPORT_COLUMNS.map(c => c.id);
  });

  React.useEffect(() => {
    localStorage.setItem('studentAdmin_visibleFilters', JSON.stringify(visibleFilters));
  }, [visibleFilters]);

  React.useEffect(() => {
    localStorage.setItem('studentAdmin_exportColumns', JSON.stringify(exportColumns));
  }, [exportColumns]);

  const getUniqueValues = (field: keyof StudentAdministration) => {
    const values = new Set(studentAdministrations.map(s => s[field]).filter(Boolean));
    return Array.from(values).sort() as string[];
  };

  const AVAILABLE_FILTERS = useMemo(() => [
    { id: 'jalurInput', label: 'Jalur Input', options: settings.adminOptions?.JALUR_INPUT || [] },
    { id: 'koordinator', label: 'Koordinator', options: settings.coordinators || [] },
    { id: 'program', label: 'Program', options: settings.adminOptions?.PROGRAM || [] },
    { id: 'perguruanTinggi', label: 'Perguruan Tinggi', options: [...(settings.campusesReguler||[]), ...(settings.campusesRPL||[]), ...(settings.campusesAkselerasi||[])] },
    { id: 'programStudi', label: 'Program Studi', options: getUniqueValues('programStudi') },
    { id: 'kloterInput', label: 'Kloter Input', options: getUniqueValues('kloterInput') },
    { id: 'periodePendaftaran', label: 'Periode Pendaftaran', options: getUniqueValues('periodePendaftaran') },
    { id: 'periodeKuliah', label: 'Periode Kuliah', options: getUniqueValues('periodeKuliah') },
    { id: 'jenisKelamin', label: 'Jenis Kelamin', options: settings.adminOptions?.JENIS_KELAMIN || [] },
    { id: 'agama', label: 'Agama', options: settings.adminOptions?.AGAMA || [] },
    { id: 'ketDokumen', label: 'Ket Dokumen', options: settings.adminOptions?.KET_DOKUMEN || [] },
    { id: 'statusBerkas', label: 'Status Berkas', options: settings.adminOptions?.STATUS_BERKAS || [] },
    { id: 'statusData', label: 'Status Data', options: settings.adminOptions?.STATUS_DATA || [] },
    { id: 'statusTagihan', label: 'Status Tagihan', options: settings.adminOptions?.STATUS_TAGIHAN || [] },
    { id: 'ketBerkas', label: 'Ket Berkas', options: settings.adminOptions?.KET_BERKAS || [] },
  ], [settings, studentAdministrations]);

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

  const [formData, setFormData] = useState<Omit<StudentAdministration, 'id'>>(initialFormData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let importedCount = 0;
        for (const row of data as any[]) {
          const newStudent: Omit<StudentAdministration, 'id'> = {
            tanggalDaftar: row['TANGGAL'] || row['TANGGAL DAFTAR'] || format(new Date(), 'dd MMMM yyyy', { locale: enUS }),
            jalurInput: row['JALUR INPUT'] || '',
            koordinator: row['KOORDINATOR'] || '',
            program: row['PROGRAM'] || '',
            perguruanTinggi: row['PERGURUAN TINGGI'] || '',
            programStudi: row['PROGRAM STUDI'] || '',
            kloterInput: row['KLOTER INPUT'] || '',
            periodePendaftaran: row['PERIODE PENDAFTARAN'] || '',
            periodeKuliah: row['PERIODE KULIAH'] || '',
            namaLengkap: row['NAMA LENGKAP'] || row['NAMA'] || '',
            tempatLahir: row['TEMPAT LAHIR'] || '',
            tanggalLahir: row['TANGGAL LAHIR'] || '',
            jenisKelamin: row['JENIS KELAMIN'] || '',
            agama: row['AGAMA'] || '',
            nik: row['NIK']?.toString() || '',
            namaIbu: row['NAMA IBU'] || '',
            kelurahan: row['KELURAHAN'] || '',
            kecamatan: row['KECAMATAN'] || '',
            kabupatenKota: row['KABUPATEN/KOTA'] || row['KABUPATEN'] || '',
            provinsi: row['PROVINSI'] || '',
            email: row['EMAIL'] || '',
            noHp: row['NO HP']?.toString() || row['WHATSAPP']?.toString() || '',
            lulusSmaS1: row['LULUS SMA/S1'] || '',
            lulusKuliah: row['LULUS KULIAH'] || '',
            linkDoc: row['LINK DOC'] || '',
            ketDokumen: row['KET DOKUMEN'] || row['KETERANGAN'] || '',
            statusBerkas: row['STATUS BERKAS'] || '',
            catatanMahasiswa: row['CATATAN MAHASISWA'] || row['CATATAN'] || '',
            tanggalInput: format(new Date(), 'dd MMMM yyyy', { locale: enUS }),
            statusData: row['STATUS DATA'] || '',
            linkPddikti: row['LINK PDDIKTI'] || '',
            linkPisn: row['LINK PISN'] || '',
            nimNpm: row['NIM/NPM']?.toString() || row['NIM']?.toString() || row['NPM']?.toString() || '',
            nomorIjazah: row['NOMOR IJAZAH']?.toString() || '',
            tanggalMasuk: row['TANGGAL MASUK'] || '',
            tanggalLulus: row['TANGGAL LULUS'] || '',
            pasPhoto: row['PAS PHOTO'] || '',
            judulSkripsi: row['JUDUL SKRIPSI'] || '',
            banPt: row['BAN PT'] || '',
            gelarAkademik: row['GELAR AKADEMIK'] || '',
            ketRevisi: row['KET REVISI'] || '',
            totalSetor: Number(row['TOTAL SETOR']) || 0,
            statusTagihan: row['STATUS TAGIHAN'] || '',
            totalTagih: Number(row['TOTAL TAGIH']) || 0,
            sudahBayar: Number(row['SUDAH BAYAR']) || 0,
            sisaTagihan: Number(row['SISA TAGIHAN']) || 0,
            ketBerkas: row['KET BERKAS'] || '',
            catatanKeuangan: row['CATATAN KEUANGAN'] || '',
            periodePengiriman: row['PERIODE PENGIRIMAN'] || ''
          };
          
          addStudentAdministration(newStudent);
          importedCount++;
        }
        alert(`Berhasil mengimpor ${importedCount} data mahasiswa.`);
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Terjadi kesalahan saat mengimpor file Excel. Pastikan formatnya sesuai.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleOpenForm = (student?: StudentAdministration) => {
    if (student) {
      setEditingId(student.id);
      const { id, ...rest } = student;
      setFormData(rest);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateStudentAdministration(editingId, formData);
    } else {
      addStudentAdministration(formData);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filtering
  const filteredStudents = useMemo(() => {
    return studentAdministrations.filter(s => {
      let matchFilters = true;
      for (const filterId of visibleFilters) {
        const filterValue = activeFilters[filterId];
        if (filterValue && filterValue !== 'ALL') {
          if (s[filterId as keyof StudentAdministration] !== filterValue) {
            matchFilters = false;
            break;
          }
        }
      }

      const matchSearch = s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.noHp.includes(searchTerm) ||
                          s.nik.includes(searchTerm);
      
      return matchFilters && matchSearch;
    }).sort((a, b) => new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime());
  }, [studentAdministrations, activeFilters, visibleFilters, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: studentAdministrations.length,
      berkasLengkap: studentAdministrations.filter(s => s.ketDokumen === 'Berkas Lengkap').length,
      aktifPddikti: studentAdministrations.filter(s => s.statusData === 'Aktif PDDikti').length,
      tundaBatal: studentAdministrations.filter(s => ['Tunda', 'Batal', 'Keluar'].includes(s.statusBerkas) || ['Tunda', 'Keluar'].includes(s.statusData)).length,
      karyawan: studentAdministrations.filter(s => s.program?.toLowerCase().includes('karyawan')).length,
      rpl: studentAdministrations.filter(s => s.program?.toLowerCase().includes('rpl')).length,
      akselerasi: studentAdministrations.filter(s => s.program?.toLowerCase().includes('akselerasi')).length,
    };
  }, [studentAdministrations]);

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="text-gray-400">-</span>;
    if (['Selesai', 'Validasi Data', 'Aktif PDDikti', 'Lulus PISN'].includes(status)) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12}/> {status}</span>;
    }
    if (['Ajukan Input', 'Ajukan Cetak', 'Proses PDDikti', 'Revisi Sistem', 'Revisi Cetak'].includes(status)) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12}/> {status}</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12}/> {status}</span>;
  };

  const formatTanggal = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // fallback if invalid
      return format(date, 'dd MMMM yyyy', { locale: enUS });
    } catch (e) {
      return dateString;
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredStudents.map((student, index) => {
      const row: any = { 'NO': index + 1 };
      
      exportColumns.forEach(colId => {
        const colDef = AVAILABLE_EXPORT_COLUMNS.find(c => c.id === colId);
        if (colDef) {
          let value = student[colId as keyof StudentAdministration];
          if (['tanggalDaftar', 'tanggalLahir', 'tanggalInput', 'tanggalMasuk', 'tanggalLulus'].includes(colId)) {
            value = formatTanggal(value as string);
          }
          row[colDef.label] = value;
        }
      });
      
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Mahasiswa');
    
    // Generate buffer and save
    XLSX.writeFile(workbook, `Data_Mahasiswa_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  const downloadTemplate = () => {
    const templateData = [{
      'TANGGAL DAFTAR': '25 March 2026',
      'JALUR INPUT': 'Reguler',
      'KOORDINATOR': 'Budi',
      'PROGRAM': 'Pintu Kuliah',
      'PERGURUAN TINGGI': 'STIS Darul Ulum',
      'PROGRAM STUDI': 'S1 Ekonomi Syariah',
      'KLOTER INPUT': 'Kloter 1',
      'PERIODE PENDAFTARAN': 'July 2026',
      'PERIODE KULIAH': 'Ganjil 2026/2027',
      'NAMA LENGKAP': 'Ahmad Santoso',
      'TEMPAT LAHIR': 'Jakarta',
      'TANGGAL LAHIR': '01 January 2000',
      'JENIS KELAMIN': 'Laki-laki',
      'AGAMA': 'Islam',
      'NIK': '3171234567890001',
      'NAMA IBU': 'Siti',
      'KELURAHAN': 'Gambir',
      'KECAMATAN': 'Gambir',
      'KABUPATEN/KOTA': 'Jakarta Pusat',
      'PROVINSI': 'DKI Jakarta',
      'EMAIL': 'ahmad@example.com',
      'NO HP': '081234567890',
      'LULUS SMA/S1': 'SMAN 1 Jakarta',
      'LULUS KULIAH': '-',
      'LINK DOC': 'https://drive.google.com/...',
      'KET DOKUMEN': 'Berkas Lengkap',
      'STATUS BERKAS': 'Selesai',
      'CATATAN MAHASISWA': 'Mahasiswa pindahan',
      'STATUS DATA': 'Aktif PDDikti',
      'LINK PDDIKTI': 'https://pddikti.kemdikbud.go.id/...',
      'LINK PISN': '-',
      'NIM/NPM': '2026001',
      'NOMOR IJAZAH': '-',
      'TANGGAL MASUK': '01 August 2026',
      'TANGGAL LULUS': '-',
      'PAS PHOTO': 'https://drive.google.com/...',
      'JUDUL SKRIPSI': '-',
      'BAN PT': 'Baik Sekali',
      'GELAR AKADEMIK': '-',
      'KET REVISI': '-',
      'TOTAL SETOR': 0,
      'STATUS TAGIHAN': 'Lunas',
      'TOTAL TAGIH': 0,
      'SUDAH BAYAR': 0,
      'SISA TAGIHAN': 0,
      'KET BERKAS': 'Selesai',
      'CATATAN KEUANGAN': '-',
      'PERIODE PENGIRIMAN': 'Jan 2026'
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');
    
    XLSX.writeFile(workbook, `Template_Import_Mahasiswa.xlsx`);
  };

  const [activeTab, setActiveTab] = useState<'data' | 'kanban' | 'pengaturan'>('data');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Administrasi Mahasiswa</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1">Kelola data pendaftaran, dokumen, dan status PDDikti mahasiswa</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab !== 'pengaturan' && (
            <>
              <button
                onClick={() => syncFromCloud()}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? 'Sinkronisasi...' : 'Sinkronkan'}
              </button>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
              >
                <FileDown size={18} />
                Template
              </button>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImportExcel}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 shadow-sm shadow-amber-200"
              >
                <Upload size={18} />
                {isImporting ? 'Mengimpor...' : 'Import'}
              </button>
              <button
                onClick={exportToExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium shadow-sm shadow-emerald-200"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Hapus Semua Data',
                    message: 'Apakah Anda yakin ingin menghapus SEMUA data administrasi mahasiswa? Tindakan ini tidak dapat dibatalkan dan akan menghapus data di server.',
                    onConfirm: () => {
                      deleteAllStudentAdministrations();
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors font-medium border border-rose-100 dark:border-rose-800/50"
              >
                <Trash2 size={18} />
                Hapus Semua
              </button>
              <button
                onClick={() => handleOpenForm()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm shadow-indigo-200"
              >
                <Plus size={18} />
                Tambah
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'data'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Data Mahasiswa
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'kanban'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Kanban Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'pengaturan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Pengaturan
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'data' ? (
        <>
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users size={24} />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Mahasiswa</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.total}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <FileCheck size={24} />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Berkas Lengkap</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.berkasLengkap}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Database size={24} />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktif PDDikti</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.aktifPddikti}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/20 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <FileWarning size={24} />
            </div>
            <p className="text-sm font-medium text-rose-800">Tunda / Batal / Keluar</p>
          </div>
          <h3 className="text-3xl font-bold text-rose-900 tracking-tight">{stats.tundaBatal}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500 dark:text-slate-400" />
            {visibleFilters.map(filterId => {
              const filterDef = AVAILABLE_FILTERS.find(f => f.id === filterId);
              if (!filterDef) return null;
              return (
                <select
                  key={filterId}
                  value={activeFilters[filterId] || 'ALL'}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, [filterId]: e.target.value }))}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="ALL">Semua {filterDef.label}</option>
                  {filterDef.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              );
            })}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              title="Pengaturan Filter & Export"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama, NIK, no HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">NO</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">TANGGAL</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">NAMA LENGKAP</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">PERGURUAN TINGGI</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">PROGRAM STUDI</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">LULUS SMA/S1</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">LULUS KULIAH</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">TEMPAT LAHIR</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">TANGGAL LAHIR</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">JENIS KELAMIN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">AGAMA</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">NIK</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">NAMA IBU</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">KELURAHAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">KECAMATAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">KABUPATEN/KOTA</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">PROVINSI</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">KETERANGAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">TOTAL SETOR</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">STATUS TAGIHAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">TOTAL TAGIH</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">SUDAH BAYAR</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">SISA TAGIHAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">KET. BERKAS</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">CATATAN KEUANGAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">PERIODE PENGIRIMAN</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-slate-800/50">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{formatTanggal(student.tanggalDaftar)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">{student.namaLengkap}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.perguruanTinggi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.programStudi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.lulusSmaS1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.lulusKuliah}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.tempatLahir}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{formatTanggal(student.tanggalLahir)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.jenisKelamin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.agama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.nik}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.namaIbu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.kelurahan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.kecamatan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.kabupatenKota}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.provinsi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.catatanMahasiswa || student.ketDokumen || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(student.totalSetor || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.statusTagihan || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(student.totalTagih || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(student.sudahBayar || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(student.sisaTagihan || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.ketBerkas || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.catatanKeuangan || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-100">{student.periodePengiriman || '-'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenForm(student)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Hapus Data Mahasiswa',
                            message: 'Apakah Anda yakin ingin menghapus data mahasiswa ini?',
                            onConfirm: () => deleteStudentAdministration(student.id)
                          });
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={19} className="px-6 py-12 text-center text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database size={32} className="text-slate-500 dark:text-slate-400 mb-2" />
                      <p>Tidak ada data mahasiswa yang sesuai dengan filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : activeTab === 'kanban' ? (
        <KanbanDashboard students={studentAdministrations} />
      ) : activeTab === 'pengaturan' ? (
        <PengaturanStudentAdminTab />
      ) : null}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingId ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 transition-colors">✕</button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="studentAdminForm" onSubmit={handleSubmit} className="space-y-8 text-slate-900 dark:text-white">
                
                {/* Section 1: Data Pendaftaran */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg"><FileCheck size={16}/></span>
                    Data Pendaftaran
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Daftar</label>
                      <input type="text" placeholder="Contoh: 31 July 1999" name="tanggalDaftar" value={formData.tanggalDaftar} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jalur Input</label>
                      <select name="jalurInput" value={formData.jalurInput} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Jalur</option>
                        {settings.adminOptions?.JALUR_INPUT?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Koordinator</label>
                      <input type="text" name="koordinator" value={formData.koordinator} onChange={handleChange} list="coordinators" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                      <datalist id="coordinators">
                        {settings.coordinators.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Program</label>
                      <select name="program" value={formData.program} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Program</option>
                        {settings.adminOptions?.PROGRAM?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Perguruan Tinggi</label>
                      <select name="perguruanTinggi" value={formData.perguruanTinggi} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih PT</option>
                        {settings.adminOptions?.PERGURUAN_TINGGI?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Program Studi</label>
                      <select name="programStudi" value={formData.programStudi} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Prodi</option>
                        {settings.studyPrograms?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kloter Input</label>
                      <input type="text" name="kloterInput" value={formData.kloterInput} onChange={handleChange} placeholder="Contoh: Kloter 1" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Periode Pendaftaran</label>
                      <input type="text" name="periodePendaftaran" value={formData.periodePendaftaran} onChange={handleChange} placeholder="Contoh: July 2026" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Periode Kuliah</label>
                      <input type="text" name="periodeKuliah" value={formData.periodeKuliah} onChange={handleChange} placeholder="Sesuai Kampus-RPL/Reguler" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Data Pribadi */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg"><Users size={16}/></span>
                    Data Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                      <input type="text" name="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tempat Lahir</label>
                      <input type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                      <input type="text" placeholder="Contoh: 31 July 1999" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                      <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih</option>
                        {settings.adminOptions?.JENIS_KELAMIN?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Agama</label>
                      <select name="agama" value={formData.agama} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih</option>
                        {settings.adminOptions?.AGAMA?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">NIK (16 Digit)</label>
                      <input type="text" name="nik" value={formData.nik} onChange={handleChange} maxLength={16} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Ibu Kandung</label>
                      <input type="text" name="namaIbu" value={formData.namaIbu} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">No. HP / WhatsApp</label>
                      <input type="tel" name="noHp" required value={formData.noHp} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    
                    {/* Alamat */}
                    <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kelurahan</label>
                        <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kecamatan</label>
                        <input type="text" name="kecamatan" value={formData.kecamatan} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kabupaten/Kota</label>
                        <input type="text" name="kabupatenKota" value={formData.kabupatenKota} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
                        <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Data Akademik & Dokumen */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg"><GraduationCap size={16}/></span>
                    Data Akademik & Dokumen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tahun Lulus SMA/S1</label>
                      <input type="text" name="lulusSmaS1" value={formData.lulusSmaS1} onChange={handleChange} placeholder="Contoh: 2017" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tahun Lulus Kuliah (Target)</label>
                      <input type="text" name="lulusKuliah" value={formData.lulusKuliah} onChange={handleChange} placeholder="Contoh: 2026" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Link Dokumen (Drive)</label>
                      <input type="url" name="linkDoc" value={formData.linkDoc} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan Dokumen</label>
                      <select name="ketDokumen" value={formData.ketDokumen} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Keterangan</option>
                        {settings.adminOptions?.KET_DOKUMEN?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Berkas</label>
                      <select name="statusBerkas" value={formData.statusBerkas} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Status</option>
                        {settings.adminOptions?.STATUS_BERKAS?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Mahasiswa</label>
                      <textarea name="catatanMahasiswa" value={formData.catatanMahasiswa} onChange={handleChange} rows={2} placeholder="Misal: Req IPK, Judul Skripsi, dll" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Status & PDDikti */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg"><Database size={16}/></span>
                    Status & PDDikti
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Input</label>
                      <input type="text" placeholder="Contoh: 31 July 1999" name="tanggalInput" value={formData.tanggalInput} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Data</label>
                      <select name="statusData" value={formData.statusData} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Status Data</option>
                        {settings.adminOptions?.STATUS_DATA?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Link PDDikti</label>
                      <input type="url" name="linkPddikti" value={formData.linkPddikti} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Link PISN</label>
                      <input type="url" name="linkPisn" value={formData.linkPisn} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">NIM / NPM</label>
                      <input type="text" name="nimNpm" value={formData.nimNpm} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Ijazah</label>
                      <input type="text" name="nomorIjazah" value={formData.nomorIjazah} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Masuk</label>
                      <input type="text" placeholder="Contoh: 31 July 1999" name="tanggalMasuk" value={formData.tanggalMasuk} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Lulus</label>
                      <input type="text" placeholder="Contoh: 31 July 1999" name="tanggalLulus" value={formData.tanggalLulus} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pas Photo (Link Drive)</label>
                      <input type="url" name="pasPhoto" value={formData.pasPhoto} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Skripsi</label>
                      <input type="text" name="judulSkripsi" value={formData.judulSkripsi} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">BAN-PT</label>
                      <input type="text" name="banPt" value={formData.banPt} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gelar Akademik</label>
                      <select name="gelarAkademik" value={formData.gelarAkademik} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Gelar</option>
                        {settings.adminOptions?.GELAR_AKADEMIK?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan Revisi</label>
                      <input type="text" name="ketRevisi" value={formData.ketRevisi} onChange={handleChange} placeholder="Catatan Jika Revisi" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Keuangan & Pengiriman */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Database size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Keuangan & Pengiriman</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Data tagihan dan pengiriman berkas</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Total Setor</label>
                      <input type="number" name="totalSetor" value={formData.totalSetor} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Status Tagihan</label>
                      <select name="statusTagihan" value={formData.statusTagihan} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Status Tagihan</option>
                        {settings.adminOptions?.STATUS_TAGIHAN?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Total Tagih</label>
                      <input type="number" name="totalTagih" value={formData.totalTagih} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Sudah Bayar</label>
                      <input type="number" name="sudahBayar" value={formData.sudahBayar} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Sisa Tagihan</label>
                      <input type="number" name="sisaTagihan" value={formData.sisaTagihan} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Ket. Berkas</label>
                      <select name="ketBerkas" value={formData.ketBerkas} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Pilih Ket. Berkas</option>
                        {settings.adminOptions?.KET_BERKAS?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Catatan Keuangan</label>
                      <input type="text" name="catatanKeuangan" value={formData.catatanKeuangan} onChange={handleChange} placeholder="Khusus Masalah Pembayaran" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Periode Pengiriman</label>
                      <input type="text" name="periodePengiriman" value={formData.periodePengiriman} onChange={handleChange} placeholder="Tanggal Kirim Berkas (Jan 2026)" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 font-medium transition-colors shadow-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                form="studentAdminForm"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm shadow-indigo-200"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Pengaturan Tampilan & Export</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Filter Settings */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Filter size={18} className="text-indigo-500" />
                  Kolom Filter Aktif
                </h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {AVAILABLE_FILTERS.map(filter => (
                    <label key={filter.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={visibleFilters.includes(filter.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleFilters(prev => [...prev, filter.id]);
                          } else {
                            setVisibleFilters(prev => prev.filter(id => id !== filter.id));
                            // Also remove from activeFilters
                            setActiveFilters(prev => {
                              const newFilters = { ...prev };
                              delete newFilters[filter.id];
                              return newFilters;
                            });
                          }
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Settings */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Download size={18} className="text-emerald-500" />
                  Kolom Export Excel
                </h3>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setExportColumns(AVAILABLE_EXPORT_COLUMNS.map(c => c.id))}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Pilih Semua
                  </button>
                  <button
                    onClick={() => setExportColumns([])}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Hapus Semua
                  </button>
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {AVAILABLE_EXPORT_COLUMNS.map(col => (
                    <label key={col.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={exportColumns.includes(col.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportColumns(prev => [...prev, col.id]);
                          } else {
                            setExportColumns(prev => prev.filter(id => id !== col.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Tutup & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

function PengaturanStudentAdminTab() {
  const { settings, updateSettings } = useAppStore();
  const [newProgramPath, setNewProgramPath] = useState('');
  const [newStudyProgram, setNewStudyProgram] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newCampus, setNewCampus] = useState('');

  const handleAdd = (field: 'programPaths' | 'studyPrograms' | 'coordinators' | 'campusesReguler', value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    const current = settings[field] || [];
    if (!current.includes(value.trim())) {
      updateSettings({ [field]: [...current, value.trim()] });
    }
    setter('');
  };

  const handleDelete = (field: 'programPaths' | 'studyPrograms' | 'coordinators' | 'campusesReguler', item: string) => {
    const current = settings[field] || [];
    updateSettings({ [field]: current.filter(i => i !== item) });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jalur Input / Program */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Jalur Input / Program</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newProgramPath}
              onChange={e => setNewProgramPath(e.target.value)}
              placeholder="Tambah jalur input..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAdd('programPaths', newProgramPath, setNewProgramPath)}
            />
            <button
              onClick={() => handleAdd('programPaths', newProgramPath, setNewProgramPath)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.programPaths || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDelete('programPaths', item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Program Studi */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Program Studi</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStudyProgram}
              onChange={e => setNewStudyProgram(e.target.value)}
              placeholder="Tambah program studi..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAdd('studyPrograms', newStudyProgram, setNewStudyProgram)}
            />
            <button
              onClick={() => handleAdd('studyPrograms', newStudyProgram, setNewStudyProgram)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.studyPrograms || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDelete('studyPrograms', item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Koordinator */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Koordinator</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCoordinator}
              onChange={e => setNewCoordinator(e.target.value)}
              placeholder="Tambah koordinator..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAdd('coordinators', newCoordinator, setNewCoordinator)}
            />
            <button
              onClick={() => handleAdd('coordinators', newCoordinator, setNewCoordinator)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.coordinators || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDelete('coordinators', item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Perguruan Tinggi */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Perguruan Tinggi</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCampus}
              onChange={e => setNewCampus(e.target.value)}
              placeholder="Tambah perguruan tinggi..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAdd('campusesReguler', newCampus, setNewCampus)}
            />
            <button
              onClick={() => handleAdd('campusesReguler', newCampus, setNewCampus)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.campusesReguler || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDelete('campusesReguler', item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanDashboard({ students }: { students: StudentAdministration[] }) {
  const [selectedProgram, setSelectedProgram] = useState<{ title: string, keyword: string } | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);

  const programs = [
    { title: "Kelas Karyawan", keyword: "Karyawan" },
    { title: "Program RPL", keyword: "RPL" },
    { title: "Program Akselerasi", keyword: "Akselerasi" }
  ];

  if (!selectedProgram) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pilih Program</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map(prog => {
            const count = students.filter(s => s.program?.toLowerCase().includes(prog.keyword.toLowerCase())).length;
            return (
              <div 
                key={prog.keyword} 
                onClick={() => setSelectedProgram(prog)} 
                className="cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Program</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{prog.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{count} Mahasiswa</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!selectedCampus) {
    const programStudents = students.filter(s => s.program?.toLowerCase().includes(selectedProgram.keyword.toLowerCase()));
    const campuses = Array.from(new Set(programStudents.map(s => s.perguruanTinggi).filter(Boolean)));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedProgram(null)} 
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pilih Kampus - {selectedProgram.title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campuses.map(campus => {
            const count = programStudents.filter(s => s.perguruanTinggi === campus).length;
            return (
              <div 
                key={campus} 
                onClick={() => setSelectedCampus(campus)} 
                className="cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Database size={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Kampus</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{campus}</h3>
                <p className="text-slate-600 dark:text-slate-400">{count} Mahasiswa</p>
              </div>
            );
          })}
          {campuses.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">Tidak ada data kampus untuk program ini.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const campusStudents = students.filter(s => 
    s.program?.toLowerCase().includes(selectedProgram.keyword.toLowerCase()) && 
    s.perguruanTinggi === selectedCampus
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSelectedCampus(null)} 
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedProgram.title} - {selectedCampus}</h2>
      </div>
      <KanbanBoard 
        title={`${selectedProgram.title} - ${selectedCampus}`} 
        programKeyword={selectedProgram.keyword} 
        campus={selectedCampus}
        students={campusStudents} 
      />
    </div>
  );
}

function KanbanBoard({ title, programKeyword, campus, students }: { title: string, programKeyword: string, campus: string, students: StudentAdministration[] }) {
  const settingsKey = `kanban_cols_${programKeyword}_${campus}`;
  const [visibleCols, setVisibleCols] = useState<string[]>(() => {
    const saved = localStorage.getItem(settingsKey);
    return saved ? JSON.parse(saved) : ['namaLengkap', 'programStudi', 'statusBerkas'];
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCol = (colId: string) => {
    const newCols = visibleCols.includes(colId) ? visibleCols.filter(id => id !== colId) : [...visibleCols, colId];
    setVisibleCols(newCols);
    localStorage.setItem(settingsKey, JSON.stringify(newCols));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Mahasiswa</h2>
          <p className="text-sm text-slate-500">Total: {students.length} Mahasiswa</p>
        </div>
        <div className="relative" ref={settingsRef}>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings size={16} />
            Pengaturan Tabel
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10 max-h-96 overflow-y-auto p-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kolom Ditampilkan</p>
              </div>
              {AVAILABLE_EXPORT_COLUMNS.map(col => (
                <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={visibleCols.includes(col.id)}
                    onChange={() => toggleCol(col.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 bg-slate-50 dark:bg-slate-950">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATUS_INFO.map(info => {
            const colStudents = students.filter(s => s.statusData === info.status);
            return (
              <div key={info.status} className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{info.status}</h3>
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded-full">
                      {colStudents.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{info.desc}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-0 max-h-[400px]">
                  {colStudents.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/30 sticky top-0 z-10">
                        <tr>
                          {visibleCols.map(colId => {
                            const colDef = AVAILABLE_EXPORT_COLUMNS.find(c => c.id === colId);
                            return (
                              <th key={colId} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                {colDef?.label}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {colStudents.map(student => (
                          <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-white dark:bg-slate-900">
                            {visibleCols.map(colId => (
                              <td key={colId} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {student[colId as keyof StudentAdministration] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Tidak ada data
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
