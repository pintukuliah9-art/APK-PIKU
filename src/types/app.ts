import { ReportData, InternalReportData, MarketingReportData, AdminReportData, FinanceReportData } from './index';

export interface DailyAllocation {
  id: string;
  date: string; // YYYY-MM-DD
  totalIncome: number;
  allocations: {
    savingDireksi: number;
    fee: number;
    yayasanStisDarulUlum: number;
    yayasanStisBda: number;
    sewaGedung: number;
    operasionalKunciSarjana: number;
    gaji: number;
    [key: string]: number; // Allow dynamic additional categories
  };
  notes: string;
  transactionId?: string; // Link to auto-generated transaction
}

export interface StudentPayment {
  id: string;
  date: string;
  studentName: string;
  kampus?: string;
  totalSetor: number;
  totalTagih: number;
  statusTagihan: string;
  sudahBayar: number;
  sisaTagihan: number;
  ketBerkas: string;
  catatanKeuangan: string;
  periodePengiriman: string;
  transactionId?: string;
}

export interface KasLedgerEntry {
  id: string;
  kasId: string;
  date: string;
  depositDate?: string;
  inAmount: number;
  outAmount: number;
  loanedOutAmount: number;
  borrowedAmount: number;
  notes: string;
  kampus?: string; // Added for Kas Setor
  referenceId?: string; // Link to DailyAllocation ID if generated automatically
  transactionId?: string; // Link to auto-generated transaction
}

export interface InterKasLoan {
  id: string;
  borrowerKasId: string;
  lenderKasId: string;
  amount: number;
  purpose: string;
  date: string;
  dueDate: string;
  status: 'pending' | 'paid';
}

export interface StudentAdministration {
  id: string;
  // Data Pendaftaran
  tanggalDaftar: string;
  jalurInput: string;
  kategoriClosing: string;
  koordinator: string;
  program: string;
  perguruanTinggi: string;
  programStudi: string;
  kloterInput: string;
  periodePendaftaran: string;
  periodeKuliah: string;
  
  // Data Pribadi
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  nik: string;
  namaIbu: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  email: string;
  noHp: string;

  // Data Akademik & Dokumen
  lulusSmaS1: string;
  lulusKuliah: string;
  linkDoc: string;
  ketDokumen: string;
  statusBerkas: string;
  catatanMahasiswa: string;

  // Status & PDDikti
  tanggalInput: string;
  statusData: string;
  linkPddikti: string;
  linkPisn: string;
  nimNpm: string;
  nomorIjazah: string;
  tanggalMasuk: string;
  tanggalLulus: string;
  pasPhoto: string;
  judulSkripsi: string;
  banPt: string;
  gelarAkademik: string;
  ketRevisi: string;

  // Keuangan & Pengiriman
  totalSetor: number;
  statusTagihan: string;
  totalTagih: number;
  sudahBayar: number;
  sisaTagihan: number;
  ketBerkas: string;
  catatanKeuangan: string;
  periodePengiriman: string;
}

export const ADMIN_OPTIONS = {
  JALUR_INPUT: ['Tim Pusat', 'Internal'],
  PERGURUAN_TINGGI: [
    'STAI Syamsul Ulum', 'STEBI Tanggamus', 'Universitas Rokania',
    'Universitas Islam Blitar', 'ITB Mesuji', 'STIS Darul Ulum',
    'STIT Bustanul \'Ulum', 'STIT Multazam', 'STIT Pringsewu', 'STIE ABI Surabaya',
    'IBN Pringsewu', 'STIA MENSIS', 'AMIK Wira Nusantara', 'Universitas Islam An Nur',
    'Institut KH. Ahmad Sanusi', 'Universitas Nahdlatul Ulama Cirebon',
    'STAI Darul Qalam', 'STIT Al-Hikmah'
  ],
  KET_DOKUMEN: [
    'Berkas Lengkap', 'Ijazah Tidak Ada', 'KK Tidak Ada', 'KTP Tidak Ada',
    'Foto Tidak Ada', 'Perbedaan Data', 'Lainnya'
  ],
  STATUS_BERKAS: [
    'Validasi Data', 'Ajukan Input', 'Ajukan Cetak', 'Tunda', 'Batal', 'Selesai'
  ],
  JENIS_KELAMIN: ['Laki-Laki', 'Perempuan'],
  AGAMA: ['Islam', 'Hindu', 'Kristen', 'Katholik'],
  STATUS_DATA: [
    'Validasi Data', 'Proses PDDikti', 'Aktif PDDikti', 'Lulus PISN',
    'Selesai', 'Revisi Sistem', 'Tunda', 'Keluar'
  ],
  GELAR_AKADEMIK: [
    'Sarjana Hukum (S.H.)', 'Sarjana Ekonomi (S.E.)', 'Sarjana Pendidikan (S.Pd.)',
    'Sarjana Manajemen (S.M.)', 'Sarjana Teknik (S.T.)', 'Sarjana Komputer (S.Kom.)',
    'Sarjana Ilmu Administrasi Negara (S.A.P.)', 'Sarjana Ilmu Komunikasi (S.I.Kom.)',
    'Sarjana Bisnis Digital (S.Bns.)', 'Magister Manajemen (M.M.)',
    'Magister Hukum (M.H.)', 'Magister Pendidikan (M.Pd.)'
  ],
  STATUS_TAGIHAN: [
    'Pendaftaran', 'Tagihan Lancar', 'Tagihan Macet', 'Lunas', 'SP 1', 'SP 2',
    'Delete', 'Tagihan Tidak Lancar', 'Revisi Sistem', 'Revisi Cetak'
  ],
  KET_BERKAS: [
    'Pengajuan PDF', 'Pengajuan Cetak', 'Kirim Berkas', 'Selesai',
    'Revisi Sistem', 'Revisi Cetak', 'Tunggu Lulus', 'Belum On'
  ],
  PROGRAM: [
    'Akselerasi S1', 'Akselerasi S2', 'Akselerasi D3', 'RPL 6 Bulan',
    'RPL 1 Tahun', 'RPL 2 Tahun', 'Reguler'
  ]
};

export interface MasterTimMarketing {
  id: string;
  namaLengkap: string;
  posisi: string; // 'Advertiser' | 'CS Admin' | 'SPV'
  status: 'Aktif' | 'Non-Aktif';
}

export interface MasterAkunAds {
  id: string;
  namaAkun: string;
  platform: string; // 'Facebook' | 'Instagram' | 'Google' | 'TikTok'
}

export interface LaporanHarianAds {
  id: string;
  tanggal: string;
  idAkun: string;
  namaCampaign: string;
  spend: number;
  impresi: number;
  jangkauan: number;
  linkClicks: number;
  leadsDihasilkan: number;
}

export interface LaporanHarianCS {
  id: string;
  tanggal: string;
  idKaryawan: string;
  leadsDiterima: number;
  chatMerespon: number;
  responTime: number; // in minutes
  closingReguler: number;
  closingRPL: number;
  closingAkselerasi: number;
}

export interface DataProspekCRM {
  id: string;
  tanggalMasuk: string;
  namaProspek: string;
  noWhatsApp: string;
  sumberLeads: string;
  programDiminati: string;
  statusProspek: 'New' | 'Follow Up' | 'Pemberkasan' | 'Closing' | 'Gagal/Mundur' | string;
  idKaryawanHandle: string;
  tanggalClosing?: string;
}

export interface TargetKPIMarketing {
  id: string;
  bulanTahun: string; // e.g., "2026-03"
  targetSpend: number;
  targetLeads: number;
  targetClosing: number;
  batasMaksimalCPL: number;
}

export interface Surat {
  id: string;
  jenis: 'Masuk' | 'Keluar';
  nomorSurat: string;
  tanggalSurat: string;
  pengirimPenerima: string;
  perihal: string;
  keterangan: string;
  fileUrl?: string;
}

export interface Inventaris {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  jumlah: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  lokasi: string;
  keterangan: string;
  tanggalMasuk: string;
}

export interface Employee {
  id: string;
  nik: string;
  namaLengkap: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  jabatan: string;
  departemen: string;
  tanggalBergabung: string;
  statusKaryawan?: 'Tetap' | 'Kontrak' | 'Magang';
  status: 'Aktif' | 'Non-Aktif';
  noHp: string;
  email: string;
  kontakDarurat?: string;
  sisaCuti?: number;
  gajiPokok?: number;
  rekeningBank?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  tanggal: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpa';
  jamMasuk?: string;
  jamKeluar?: string;
  lemburMulai?: string;
  lemburSelesai?: string;
  keterlambatanMenit?: number;
  keterangan: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahHari?: number;
  jenisCuti: 'Tahunan' | 'Sakit' | 'Melahirkan' | 'Menikah' | 'Berduka' | 'Unpaid Leave' | 'Penting';
  alasan: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  catatanHR?: string;
}

export interface AppSettings {
  googleScriptUrl?: string; // Backend URL Utama
  googleScriptUrl_marketing?: string; // Backend Marketing
  googleScriptUrl_finance?: string; // Backend Keuangan
  googleScriptUrl_admin?: string; // Backend Administrasi
  defaultSigner: {
    name: string;
    role: string;
    city: string;
  };
  programPaths: string[]; // e.g., "Reguler", "RPL 1 Tahun"
  studyPrograms: string[]; // e.g., "S1 Ekonomi Syariah"
  adAccounts: string[]; // e.g., "Akun 1", "Akun 2"
  admins: string[]; // e.g., "Admin A", "Admin B"
  coordinators: string[]; // e.g., "Koordinator X"
  campusesReguler: string[];
  campusesRPL: string[];
  campusesAkselerasi: string[];
  adminOptions: {
    JALUR_INPUT: string[];
    PERGURUAN_TINGGI: string[];
    KET_DOKUMEN: string[];
    STATUS_BERKAS: string[];
    JENIS_KELAMIN: string[];
    AGAMA: string[];
    STATUS_DATA: string[];
    GELAR_AKADEMIK: string[];
    STATUS_TAGIHAN: string[];
    KET_BERKAS: string[];
    PROGRAM: string[];
  };
  incomeCategories: string[];
  expenseCategories: string[];
  theme?: 'light' | 'dark';
  // HR Settings
  hrJabatan?: string[];
  hrDepartemen?: string[];
  hrStatusKaryawan?: string[];
  fundSources?: { id: string; name: string }[];
  internalCashWallets?: { id: string; name: string }[];
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  program: string; // e.g., Reguler, S1 Ekonomi
  registrationDate: number; // timestamp
  fileStatus: 'BELUM_LENGKAP' | 'PROSES' | 'LENGKAP';
  documents: {
    ktp: boolean;
    kk: boolean;
    ijazah: boolean;
    pasFoto: boolean;
    transkrip: boolean;
    [key: string]: boolean;
  };
  notes: string;
}

export interface Transaction {
  id: string;
  reportId?: string; // Optional link to a report
  date: number; // timestamp
  partnerName: string;
  type: 'INCOME' | 'EXPENSE' | 'STUDENT_PINTU' | 'STUDENT_KUNCI';
  category: string; // e.g. "Reguler", "Operasional"
  amount: number; // Money for INCOME/EXPENSE, Count for STUDENT
  description: string;
}

export interface SavedReport extends ReportData {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'final';
}

export interface SavedInternalReport extends InternalReportData {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'final';
}

export interface SavedMarketingReport extends MarketingReportData {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'final';
}

export interface SavedAdminReport extends AdminReportData {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'final';
}

export interface SavedFinanceReport extends FinanceReportData {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'final';
}

export const defaultSettings: AppSettings = {
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwiypLD5DjdL9Dcq49PQ7hjLQ8aDNEgRRzKv_WN6LPeADh0D80Km2hZYoHB_PzMYO0y/exec',
  googleScriptUrl_marketing: '',
  googleScriptUrl_finance: '',
  googleScriptUrl_admin: '',
  defaultSigner: {
    name: '',
    role: '',
    city: '',
  },
  programPaths: [
    'Akselerasi S1', 'Akselerasi S2', 'Akselerasi D3', 'RPL 6 Bulan',
    'RPL 1 Tahun', 'RPL 2 Tahun', 'Reguler'
  ],
  studyPrograms: [
    'S1 Hukum Ekonomi Syariah', 'S1 Ekonomi Syariah', 'S2 Pendidikan Agama Islam',
    'S2 Hukum Keluarga Islam', 'S2 Manajemen', 'S2 Manajemen Pendidikan Islam',
    'S1 Pend. Jasmani, Kes & Rekreasi', 'S1 Teknik Elektro', 'S1 Teknik Sipil',
    'S1 Teknik Informatika', 'S1 Ilmu Administrasi Negara', 'S1 Manajemen',
    'S1 Akuntansi', 'S1 Ilmu Hukum', 'S1 Pendidikan Biologi',
    'S1 Pendidikan Guru Sekolah Dasar', 'S1 Pendidikan PKn',
    'S1 Pendidikan Bahasa Inggris', 'S1 Perbankan Syariah',
    'S1 Bimbingan Konseling Islam', 'S1 Manajemen Pendidikan Islam',
    'S1 Pendidikan Agama Islam', 'S1 Pendidikan Guru Madrasah Ibtidaiyah',
    'S1 Pendidikan Bahasa Arab', 'S1 Pendidikan Islam Anak Usia Dini',
    'S1 Sistem & Teknologi Informasi', 'S1 Manajemen Retail', 'S1 Bisnis Digital',
    'S1 Hukum Keluarga Islam', 'S1 Ilmu Komunikasi', 'S1 Ilmu Pemerintahan',
    'D3 Manajemen Informatika'
  ],
  adAccounts: [],
  admins: [],
  coordinators: [
    'Internal Br. Jaya', 'Internal STIS DU', 'Internal STIT BU', 'Internal ITBM',
    'Dastam', 'Akbar Kurniawan', 'Roni Laksono', 'H. Darmanto', 'Dr. Saparuddin',
    'Hj. Yunani', 'Stefanus', 'Aliunsyah', 'Fajar Nurhardianto', 'Mungafif',
    'Dwi Ari Sandi', 'Desty', 'Edi Lawfirm', 'Sita Tami', 'Usman Jayadi',
    'Roberto Awayka', 'Alfin Syafrizal', 'Yandi', 'Johan', 'Ersa', 'Ebing Karmiza',
    'Satria Tori', 'Sopyan', 'Qomar', 'Bagus Ariex', 'Dane', 'Lutfi Hakim',
    'M. Ilham', 'Rustam Efendi', 'Joko Irianto', 'Silvana', 'Saifudin',
    'Taufik Hidayat', 'Waluyo', 'Puja', 'Moh. Ali Murtadlo', 'Kohar Zainudin',
    'Herdi Ferdiansyah', 'Syarifudin Punggur', 'Brian Brimob', 'Egi Brimob',
    'Ikhwanul Akbar', 'Yazer Ibrahim', 'Irfan Andi', 'Asyari', 'Alfarizi',
    'Ferdi Brimob', 'Rimbun', 'Jamilatun N', 'Hawwin Huda', 'Arman Lbh',
    'Syahromi Riau', 'Gus M. Khoiron', 'Mafazi Reliyo', 'Zulfadli', 'Rio Dumai',
    'Maman Suryaman', 'Ir. Arsen', 'Rian', 'Maman Arief', 'Ari Wantoro', 'I Made',
    'Yusron', 'Masduki', 'Novarino', 'Lawfirm', 'Rio Chrisna', 'Anggi',
    'Salamu Solihin', 'M Akrom', 'Jimi', 'Adhi Yahya Muzaki', 'Heru Papua',
    'Afif', 'Andi Pranata R', 'Yusuf Amin', 'Herdi F', 'Edunitas', 'SBK', 'K2',
    'Kita Kuliah', 'Abdul Kadir'
  ],
  campusesReguler: [
    'STAI Syamsul Ulum', 'STEBI Tanggamus', 'Universitas Rokania',
    'Universitas Islam Blitar', 'ITB Mesuji', 'STIS Darul Ulum',
    'STIT Bustanul \'Ulum', 'STIT Multazam', 'STIT Pringsewu', 'STIE ABI Surabaya',
    'IBN Pringsewu', 'STIA MENSIS', 'AMIK Wira Nusantara', 'Universitas Islam An Nur',
    'Institut KH. Ahmad Sanusi', 'Universitas Nahdlatul Ulama Cirebon',
    'STAI Darul Qalam', 'STIT Al-Hikmah'
  ],
  campusesRPL: [],
  campusesAkselerasi: [],
  adminOptions: ADMIN_OPTIONS,
  incomeCategories: [],
  expenseCategories: [],
  theme: 'light',
  hrJabatan: ['Staff', 'Supervisor', 'Manager', 'Direktur'],
  hrDepartemen: ['Marketing', 'Finance', 'Akademik', 'HRD', 'IT'],
  hrStatusKaryawan: ['Tetap', 'Kontrak', 'Magang', 'Freelance'],
  fundSources: [
    { id: 'fs_karyawan', name: 'Program Kelas Karyawan' },
    { id: 'fs_rpl', name: 'Program RPL' },
    { id: 'fs_akselerasi', name: 'Program Akselerasi' },
    { id: 'fs_kampus', name: 'Dana Kampus' },
    { id: 'fs_pribadi', name: 'Dana Pribadi' }
  ],
  internalCashWallets: [
    { id: 'savingDireksi', name: 'Kas Saving Direksi' },
    { id: 'fee', name: 'Kas Fee' },
    { id: 'yayasanStisDarulUlum', name: 'Kas Yayasan STIS Darul Ulum' },
    { id: 'yayasanStisBda', name: 'Kas Yayasan STIS BDA' },
    { id: 'sewaGedung', name: 'Kas Sewa Gedung' },
    { id: 'operasionalKunciSarjana', name: 'Kas Operasional Kunci Sarjana' },
    { id: 'gaji', name: 'Kas Gaji' },
    { id: 'kasSetor', name: 'Kas Setor' }
  ]
};
