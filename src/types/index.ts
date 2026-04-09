export interface FinancialItem {
  date?: string;
  source: string;
  detail: string;
  amount: number;
}

export interface AdsSummary {
  program: string;
  targetClosing: number;
  capaianClosing: number;
  keterangan: string;
}

export interface CampaignRecap {
  namaKampanye: string;
  platform: string;
  leads: number;
  cpl: number;
  spendHari: number;
  spendBulan: number;
  impresi: number;
  evaluasi: string;
}

export interface DailyAdsExpense {
  tanggal: string;
  kampanye: string;
  platform: string;
  nominal: number;
  catatan: string;
}

export interface CSRecap {
  namaPetugas: string;
  jumlahChat: number;
  jumlahFollowUp: number;
  jumlahClosing: number;
  responRataRata: string;
  kendala: string;
  catatan: string;
}

export interface CRMProspect {
  sumberProspek: string;
  jumlahProspek: number;
  keterangan: string;
}

export interface MailRecap {
  tanggal: string;
  jenisSurat: string;
  nomorSurat: string;
  asalTujuan: string;
  perihal: string;
  status: string;
}

export interface InventoryItem {
  namaBarang: string;
  jumlah: number;
  kondisi: string;
  lokasi: string;
  keterangan: string;
}

export interface NewDataRecap {
  kampus: string;
  berkasOn: number;
  belumOn: number;
  revisi: number;
  cancel: number;
  selesai: number;
  jumlahData: number;
}

export interface AdminReportData {
  periodeLaporan: string;
  picAdministrasi: string;
  month: string;
  year: string;
  foreword: string;
  conclusion: string;
  mailRecaps: MailRecap[];
  inventoryItems: InventoryItem[];
  regulerData: NewDataRecap[];
  rplData: NewDataRecap[];
  akselerasiData: NewDataRecap[];
  attachments: AttachmentLink[];
  signature: {
    city: string;
    date: string;
    role: string;
    name: string;
    signatureImage?: string;
    stampImage?: string;
  };
}

export const initialAdminReportData: AdminReportData = {
  periodeLaporan: '',
  picAdministrasi: '',
  month: new Date().toLocaleDateString('id-ID', { month: 'long' }).toUpperCase(),
  year: new Date().getFullYear().toString(),
  foreword: '',
  conclusion: '',
  mailRecaps: [],
  inventoryItems: [],
  regulerData: [],
  rplData: [],
  akselerasiData: [],
  attachments: [],
  signature: {
    city: '',
    date: '',
    role: '',
    name: '',
  },
};

export interface MarketingReportData {
  periodeLaporan: string;
  picMarketing: string;
  month: string;
  year: string;
  foreword: string;
  conclusion: string;
  adsSummary: AdsSummary[];
  campaignRecaps: CampaignRecap[];
  dailyAdsExpenses: DailyAdsExpense[];
  csRecaps: CSRecap[];
  crmProspects: CRMProspect[];
  attachments: AttachmentLink[];
  signature: {
    city: string;
    date: string;
    role: string;
    name: string;
    signatureImage?: string;
    stampImage?: string;
  };
}

export const initialMarketingReportData: MarketingReportData = {
  periodeLaporan: '',
  picMarketing: '',
  month: new Date().toLocaleDateString('id-ID', { month: 'long' }).toUpperCase(),
  year: new Date().getFullYear().toString(),
  foreword: '',
  conclusion: '',
  adsSummary: [],
  campaignRecaps: [],
  dailyAdsExpenses: [],
  csRecaps: [],
  crmProspects: [],
  attachments: [],
  signature: {
    city: '',
    date: '',
    role: '',
    name: '',
  },
};

export interface InternalReportData {
  month: string;
  year: string;
  summary: string;
  marketing: {
    spend: number;
    leads: number;
    clicks: number;
    closing: number;
  };
  finance: {
    income: number;
    expense: number;
    saldo: number;
    detailedIncome: FinancialItem[];
    detailedExpense: FinancialItem[];
  };
  admin: {
    activeStudents: number;
    dropout: number;
    graduated: number;
    programs: { label: string; count: number }[];
    studyPrograms: { label: string; count: number }[];
  };
  hr: {
    activeEmployees: number;
    resigned: number;
    recruited: number;
  };
  attachments: AttachmentLink[];
  signature: {
    city: string;
    date: string;
    role: string;
    name: string;
    signatureImage?: string;
    stampImage?: string;
  };
}

export const initialInternalReportData: InternalReportData = {
  month: new Date().toLocaleDateString('id-ID', { month: 'long' }).toUpperCase(),
  year: new Date().getFullYear().toString(),
  summary: '',
  marketing: {
    spend: 0,
    leads: 0,
    clicks: 0,
    closing: 0,
  },
  finance: {
    income: 0,
    expense: 0,
    saldo: 0,
    detailedIncome: [],
    detailedExpense: []
  },
  admin: {
    activeStudents: 0,
    dropout: 0,
    graduated: 0,
    programs: [],
    studyPrograms: []
  },
  hr: {
    activeEmployees: 0,
    resigned: 0,
    recruited: 0,
  },
  attachments: [],
  signature: {
    city: '',
    date: '',
    role: '',
    name: '',
  },
};

export interface BalanceItem {
  uraian: string;
  nominal: number;
}

export interface BalanceSection {
  asetLancar: BalanceItem[];
  asetTetap: BalanceItem[];
  kewajiban: BalanceItem[];
  ekuitas: BalanceItem[];
}

export interface AttachmentLink {
  unit: string;
  jenisLampiran: string;
  link: string;
}

export interface FinanceReportData {
  periodeLaporan: string;
  month: string;
  year: string;
  pintuKuliah: BalanceSection;
  kunciSarjana: BalanceSection;
  attachments: AttachmentLink[];
  signature: {
    city: string;
    date: string;
    role: string;
    name: string;
    signatureImage?: string;
    stampImage?: string;
  };
}

export const initialFinanceReportData: FinanceReportData = {
  periodeLaporan: '',
  month: new Date().toLocaleDateString('id-ID', { month: 'long' }).toUpperCase(),
  year: new Date().getFullYear().toString(),
  pintuKuliah: {
    asetLancar: [],
    asetTetap: [],
    kewajiban: [],
    ekuitas: []
  },
  kunciSarjana: {
    asetLancar: [],
    asetTetap: [],
    kewajiban: [],
    ekuitas: []
  },
  attachments: [],
  signature: {
    city: '',
    date: '',
    role: '',
    name: '',
  },
};

export interface ReportData {
  partnerName: string;
  month: string;
  year: string;
  summary: string;
  pintuKuliah: { label: string; count: number }[];
  kunciSarjana: { label: string; count: number }[];
  detailedIncome: FinancialItem[];
  detailedExpense: FinancialItem[];
  signature: {
    city: string;
    date: string;
    role: string;
    name: string;
    signatureImage?: string;
    stampImage?: string;
  };
}

export const initialReportData: ReportData = {
  partnerName: 'STIS DARUL ULUM',
  month: 'FEBRUARI',
  year: '2026',
  summary: `Kerjasama antara Pintu Kuliah, Kunci Sarjana dan STIS Darul Ulum pada bulan Februari 2026 menunjukkan perkembangan yang positif dalam kegiatan rekrutmen mahasiswa serta pengelolaan program akselerasi pendidikan. Melalui strategi pemasaran digital serta program Rekognisi Pembelajaran Lampau (RPL), total 103 mahasiswa berhasil direkrut selama periode laporan. Secara finansial program ini mencatat total dana masuk sebesar Rp285.458.569 dengan pengeluaran sebesar Rp80.009.889 sehingga menghasilkan saldo akhir sebesar Rp205.448.680.`,
  pintuKuliah: [
    { label: 'Reguler', count: 2 },
    { label: 'RPL 1 Tahun', count: 3 },
    { label: 'RPL 2 Tahun', count: 4 },
    { label: 'RPL 6 Bulan', count: 20 },
  ],
  kunciSarjana: [
    { label: 'S1 Ekonomi Syariah', count: 9 },
    { label: 'S1 Hukum Ekonomi Syariah', count: 65 },
  ],
  detailedIncome: [
    { source: 'Pintu Kuliah', detail: 'Saldo Awal Operasional Januari 2026', amount: 50578869 },
    { source: 'Pintu Kuliah', detail: 'Pembayaran Mahasiswa Program RPL', amount: 96900000 },
    { source: 'Pintu Kuliah', detail: 'Pembayaran Kelas Karyawan', amount: 700000 },
    { source: 'Kunci Sarjana', detail: 'Pembayaran Mahasiswa Program Akselerasi', amount: 137279700 },
  ],
  detailedExpense: [
    { date: '04 Feb 2026', source: 'Pintu Kuliah', detail: 'Biaya Operasional PMB', amount: 28207389 },
    { date: '08 Feb 2026', source: 'Kunci Sarjana', detail: 'Setor Yayasan', amount: 10002500 },
    { date: '10 Feb 2026', source: 'Pintu Kuliah', detail: 'Pengembangan Program Studi', amount: 15000000 },
    { date: '15 Feb 2026', source: 'Kunci Sarjana', detail: 'Amply STIS Darul Ulum', amount: 6500000 },
    { date: '16 Feb 2026', source: 'Kunci Sarjana', detail: 'Pembelian Mobil Operasional', amount: 20000000 },
    { date: '26 Feb 2026', source: 'Kunci Sarjana', detail: 'Administrasi PDDikti', amount: 300000 },
  ],
  signature: {
    city: 'Lampung',
    date: '08 Maret 2026',
    role: 'General Manajer',
    name: 'Muhammad Zidane, S.E., M.M.',
  },
};
