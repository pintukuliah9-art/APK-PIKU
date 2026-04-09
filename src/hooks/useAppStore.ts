import { useState, useEffect } from 'react';
import { SavedReport, SavedInternalReport, SavedMarketingReport, SavedAdminReport, AppSettings, defaultSettings, Transaction, DailyAllocation, KasLedgerEntry, Student, StudentPayment, InterKasLoan, StudentAdministration, Surat, Inventaris, Employee, Attendance, LeaveRequest } from '../types/app';
import { initialReportData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { fetchFromGoogleSheets, postToGoogleSheets } from '../services/googleSheets';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

const STORAGE_KEYS = {
  REPORTS: 'app_reports',
  SETTINGS: 'app_settings',
  TRANSACTIONS: 'app_transactions',
  DAILY_ALLOCATIONS: 'app_daily_allocations',
  KAS_LEDGER: 'app_kas_ledger',
  STUDENTS: 'app_students',
  STUDENT_PAYMENTS: 'app_student_payments',
  INTER_KAS_LOANS: 'app_inter_kas_loans',
  MARKETING_REPORTS: 'app_marketing_reports',
  ADMIN_REPORTS: 'app_admin_reports',
  INTERNAL_REPORTS: 'app_internal_reports',
  STUDENT_ADMINISTRATIONS: 'app_student_administrations',
  SURAT: 'app_surat',
  INVENTARIS: 'app_inventaris',
  EMPLOYEES: 'app_employees',
  ATTENDANCES: 'app_attendances',
  LEAVE_REQUESTS: 'app_leave_requests',
};

export function useAppStore() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [internalReports, setInternalReports] = useState<SavedInternalReport[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyAllocations, setDailyAllocations] = useState<DailyAllocation[]>([]);
  const [kasLedger, setKasLedger] = useState<KasLedgerEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [studentAdministrations, setStudentAdministrations] = useState<StudentAdministration[]>([]);
  const [interKasLoans, setInterKasLoans] = useState<InterKasLoan[]>([]);
  const [marketingReports, setMarketingReports] = useState<SavedMarketingReport[]>([]);
  const [adminReports, setAdminReports] = useState<SavedAdminReport[]>([]);
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [inventarisList, setInventarisList] = useState<Inventaris[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const loadedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const loadedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const loadedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const loadedAllocations = localStorage.getItem(STORAGE_KEYS.DAILY_ALLOCATIONS);
    const loadedLedger = localStorage.getItem(STORAGE_KEYS.KAS_LEDGER);
    const loadedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const loadedStudentPayments = localStorage.getItem(STORAGE_KEYS.STUDENT_PAYMENTS);
    const loadedStudentAdministrations = localStorage.getItem(STORAGE_KEYS.STUDENT_ADMINISTRATIONS);
    const loadedInterKasLoans = localStorage.getItem(STORAGE_KEYS.INTER_KAS_LOANS);
    const loadedMarketingReports = localStorage.getItem(STORAGE_KEYS.MARKETING_REPORTS);
    const loadedInternalReports = localStorage.getItem(STORAGE_KEYS.INTERNAL_REPORTS);
    const loadedSurat = localStorage.getItem(STORAGE_KEYS.SURAT);
    const loadedInventaris = localStorage.getItem(STORAGE_KEYS.INVENTARIS);
    const loadedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    const loadedAttendances = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
    const loadedLeaveRequests = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);

    if (loadedReports) {
      setReports(JSON.parse(loadedReports));
    } else {
      const seedReport: SavedReport = {
        ...initialReportData,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'final',
      };
      setReports([seedReport]);
    }

    if (loadedInternalReports) {
      setInternalReports(JSON.parse(loadedInternalReports));
    }

    if (loadedSurat) setSuratList(JSON.parse(loadedSurat));
    if (loadedInventaris) setInventarisList(JSON.parse(loadedInventaris));
    if (loadedEmployees) setEmployees(JSON.parse(loadedEmployees));
    if (loadedAttendances) setAttendances(JSON.parse(loadedAttendances));
    if (loadedLeaveRequests) setLeaveRequests(JSON.parse(loadedLeaveRequests));

    if (loadedSettings) {
      const parsed = JSON.parse(loadedSettings);
      
      // Force update if the URL is the old default one
      const oldUrl1 = 'https://script.google.com/macros/s/AKfycby5uMJZwY10z2NoeRt-XRjIvgG71IyxOVOuAMQOU-dagx_cNrE_Nv6Yr16xb0sUmJAc/exec';
      const oldUrl2 = 'https://script.google.com/macros/s/AKfycbxQEcVki0WafOlIEj7AfZ7ybUhsoEWLubgGOQsx4Y6Hf7Rrr38usicgQuUxq6ZFcIvrsQ/exec';
      const oldUrl3 = 'https://script.google.com/macros/s/AKfycbzxWN5OUABZKpUsIX28vRjmrMHdCNFyuLqG4UDhAnEXZxv3Z8YqJjzR8NSq1QaMI9PQEw/exec';
      const newUrl = 'https://script.google.com/macros/s/AKfycbwiypLD5DjdL9Dcq49PQ7hjLQ8aDNEgRRzKv_WN6LPeADh0D80Km2hZYoHB_PzMYO0y/exec';
      const currentUrl = (parsed.googleScriptUrl === oldUrl1 || parsed.googleScriptUrl === oldUrl2 || parsed.googleScriptUrl === oldUrl3 || !parsed.googleScriptUrl) ? newUrl : parsed.googleScriptUrl;

      // Merge with default settings to ensure new keys (like googleScriptUrl) are present
      setSettings({ 
        ...defaultSettings, 
        ...parsed, 
        googleScriptUrl: currentUrl,
        googleScriptUrl_marketing: parsed.googleScriptUrl_marketing || defaultSettings.googleScriptUrl_marketing,
        googleScriptUrl_finance: parsed.googleScriptUrl_finance || defaultSettings.googleScriptUrl_finance,
        googleScriptUrl_admin: parsed.googleScriptUrl_admin || defaultSettings.googleScriptUrl_admin,
        adAccounts: parsed.adAccounts || defaultSettings.adAccounts,
        admins: parsed.admins || defaultSettings.admins,
        coordinators: parsed.coordinators || defaultSettings.coordinators,
        campusesReguler: parsed.campusesReguler || defaultSettings.campusesReguler,
        campusesRPL: parsed.campusesRPL || defaultSettings.campusesRPL,
        campusesAkselerasi: parsed.campusesAkselerasi || defaultSettings.campusesAkselerasi,
        adminOptions: parsed.adminOptions || defaultSettings.adminOptions,
        theme: parsed.theme || defaultSettings.theme,
      });
    }

    if (loadedTransactions) {
      setTransactions(JSON.parse(loadedTransactions));
    }

    if (loadedAllocations) {
      setDailyAllocations(JSON.parse(loadedAllocations));
    }

    if (loadedLedger) {
      setKasLedger(JSON.parse(loadedLedger));
    }

    if (loadedStudents) {
      setStudents(JSON.parse(loadedStudents));
    }

    if (loadedStudentPayments) {
      setStudentPayments(JSON.parse(loadedStudentPayments));
    }

    if (loadedStudentAdministrations) {
      setStudentAdministrations(JSON.parse(loadedStudentAdministrations));
    }

    if (loadedInterKasLoans) {
      setInterKasLoans(JSON.parse(loadedInterKasLoans));
    }

    if (loadedMarketingReports) {
      setMarketingReports(JSON.parse(loadedMarketingReports));
    }

    setIsLoaded(true);
  }, []);

  // Firebase Listeners
  useEffect(() => {
    let unsubscribeStudents: () => void;
    let unsubscribeSettings: () => void;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        try {
          unsubscribeStudents = onSnapshot(collection(db, 'studentAdministrations'), (snapshot) => {
            const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentAdministration));
            setStudentAdministrations(studentsData);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'studentAdministrations');
          });

          unsubscribeSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
            if (!snapshot.empty) {
              const settingsDoc = snapshot.docs[0];
              setSettings({ ...defaultSettings, ...settingsDoc.data() } as AppSettings);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'settings');
          });
        } catch (error) {
          console.error('Error setting up Firebase listeners:', error);
        }
      } else {
        if (unsubscribeStudents) unsubscribeStudents();
        if (unsubscribeSettings) unsubscribeSettings();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  // Initial Sync with Cloud if URL exists
  useEffect(() => {
    if (isLoaded && (
      settings.googleScriptUrl || 
      settings.googleScriptUrl_finance ||
      settings.googleScriptUrl_admin ||
      settings.googleScriptUrl_marketing
    )) {
      syncFromCloud();
    }
  }, [
    isLoaded, 
    settings.googleScriptUrl, 
    settings.googleScriptUrl_finance,
    settings.googleScriptUrl_admin,
    settings.googleScriptUrl_marketing
  ]);

  // Save to storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }
  }, [reports, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.DAILY_ALLOCATIONS, JSON.stringify(dailyAllocations));
    }
  }, [dailyAllocations, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.KAS_LEDGER, JSON.stringify(kasLedger));
    }
  }, [kasLedger, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }, [students, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PAYMENTS, JSON.stringify(studentPayments));
    }
  }, [studentPayments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_ADMINISTRATIONS, JSON.stringify(studentAdministrations));
    }
  }, [studentAdministrations, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }, [students, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PAYMENTS, JSON.stringify(studentPayments));
    }
  }, [studentPayments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.INTER_KAS_LOANS, JSON.stringify(interKasLoans));
    }
  }, [interKasLoans, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.MARKETING_REPORTS, JSON.stringify(marketingReports));
    }
  }, [marketingReports, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_REPORTS, JSON.stringify(adminReports));
    }
  }, [adminReports, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.INTERNAL_REPORTS, JSON.stringify(internalReports));
    }
  }, [internalReports, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(suratList));
    }
  }, [suratList, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.INVENTARIS, JSON.stringify(inventarisList));
    }
  }, [inventarisList, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
  }, [employees, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(attendances));
    }
  }, [attendances, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests));
    }
  }, [leaveRequests, isLoaded]);

  const syncFromCloud = async () => {
    setIsSyncing(true);
    try {
      if (settings.googleScriptUrl) {
        const data = await fetchFromGoogleSheets(settings.googleScriptUrl);
        if (data) {
          if (data.reports !== undefined) setReports(data.reports);
          if (data.transactions !== undefined) setTransactions(data.transactions);
          if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
          
          // Load other collections if they exist in the new backend format
          if (data.dailyAllocations !== undefined) setDailyAllocations(data.dailyAllocations || []);
          if (data.kasLedger !== undefined) setKasLedger(data.kasLedger || []);
          if (data.students !== undefined) setStudents(data.students || []);
          if (data.studentPayments !== undefined) setStudentPayments(data.studentPayments || []);
          if (data.interKasLoans !== undefined) setInterKasLoans(data.interKasLoans || []);
          if (data.studentAdministrations !== undefined) setStudentAdministrations(data.studentAdministrations || []);
          if (data.marketingReports !== undefined) setMarketingReports(data.marketingReports || []);
          if (data.adminReports !== undefined) setAdminReports(data.adminReports || []);
          if (data.internalReports !== undefined) setInternalReports(data.internalReports || []);
          if (data.suratList !== undefined) setSuratList(data.suratList || []);
          if (data.inventarisList !== undefined) setInventarisList(data.inventarisList || []);
          if (data.employees !== undefined) setEmployees(data.employees || []);
          if (data.attendances !== undefined) setAttendances(data.attendances || []);
          if (data.leaveRequests !== undefined) setLeaveRequests(data.leaveRequests || []);
        }
      }

      if (settings.googleScriptUrl_admin) {
        const adminData = await fetchFromGoogleSheets(`${settings.googleScriptUrl_admin}?action=getAllData`);
        if (adminData && adminData.status === 'success' && adminData.data) {
          const { 
            adminReports: newAdminReports,
            students: newStudents, 
            studentAdministrations: newStudentAdministrations,
            suratList: newSuratList,
            inventarisList: newInventarisList,
            employees: newEmployees,
            attendances: newAttendances,
            leaveRequests: newLeaveRequests,
            settings: newSettings
          } = adminData.data;
          if (newAdminReports !== undefined) setAdminReports(newAdminReports || []);
          if (newStudents !== undefined) setStudents(newStudents || []);
          if (newStudentAdministrations !== undefined) setStudentAdministrations(newStudentAdministrations || []);
          if (newSuratList !== undefined) setSuratList(newSuratList || []);
          if (newInventarisList !== undefined) setInventarisList(newInventarisList || []);
          if (newEmployees !== undefined) setEmployees(newEmployees || []);
          if (newAttendances !== undefined) setAttendances(newAttendances || []);
          if (newLeaveRequests !== undefined) setLeaveRequests(newLeaveRequests || []);
          if (newSettings !== undefined) setSettings(prev => ({ ...prev, ...newSettings }));
        } else if (adminData && !adminData.status) {
          // Legacy format fallback
          if (adminData.adminReports !== undefined) setAdminReports(adminData.adminReports || []);
          if (adminData.students !== undefined) setStudents(adminData.students || []);
          if (adminData.studentAdministrations !== undefined) setStudentAdministrations(adminData.studentAdministrations || []);
          if (adminData.suratList !== undefined) setSuratList(adminData.suratList || []);
          if (adminData.inventarisList !== undefined) setInventarisList(adminData.inventarisList || []);
          if (adminData.employees !== undefined) setEmployees(adminData.employees || []);
          if (adminData.attendances !== undefined) setAttendances(adminData.attendances || []);
          if (adminData.leaveRequests !== undefined) setLeaveRequests(adminData.leaveRequests || []);
        }
      }

      if (settings.googleScriptUrl_marketing) {
        const marketingData = await fetchFromGoogleSheets(`${settings.googleScriptUrl_marketing}?action=getAllData`);
        if (marketingData && marketingData.status === 'success' && marketingData.data) {
          const { marketingReports: newMarketingReports } = marketingData.data;
          if (newMarketingReports !== undefined) setMarketingReports(newMarketingReports || []);
        } else if (marketingData && !marketingData.status) {
          // Legacy format fallback
          if (marketingData.marketingReports !== undefined) setMarketingReports(marketingData.marketingReports || []);
        }
      }

      if (settings.googleScriptUrl_finance) {
        const financeData = await fetchFromGoogleSheets(`${settings.googleScriptUrl_finance}?action=getAllData`);
        if (financeData && financeData.status === 'success' && financeData.data) {
          const { 
            alokasiDana, pembayaranMahasiswa, bukuBesarKas, hutangPiutang,
            dailyAllocations: newDailyAllocations,
            studentPayments: newStudentPayments,
            kasLedger: newKasLedger,
            interKasLoans: newInterKasLoans,
            transactions: newTransactions
          } = financeData.data;
          
          if (newTransactions !== undefined) {
            setTransactions(newTransactions || []);
          }

          if (newDailyAllocations !== undefined) {
            setDailyAllocations(newDailyAllocations || []);
          } else if (alokasiDana !== undefined) {
            const mappedDailyAllocations = alokasiDana.map((row: any) => ({
              id: row['ID'] || uuidv4(),
              date: row['Tanggal'] || '',
              totalIncome: Number(row['Total Pemasukan']) || 0,
              allocations: {
                savingDireksi: Number(row['Saving Direksi']) || 0,
                fee: Number(row['Fee']) || 0,
                yayasanStisDarulUlum: Number(row['Yayasan STIS Darul Ulum']) || 0,
                yayasanStisBda: Number(row['Yayasan STIS BDA']) || 0,
                sewaGedung: Number(row['Sewa Gedung']) || 0,
                operasionalKunciSarjana: Number(row['Operasional Kunci Sarjana']) || 0,
                gaji: Number(row['Gaji']) || 0,
              },
              notes: row['Keterangan'] || '',
              transactionId: row['Transaction ID'] || '',
            }));
            setDailyAllocations(mappedDailyAllocations);
          }

          if (newStudentPayments !== undefined) {
            setStudentPayments(newStudentPayments || []);
          } else if (pembayaranMahasiswa !== undefined) {
            const mappedStudentPayments = pembayaranMahasiswa.map((row: any) => ({
              id: row['ID'] || uuidv4(),
              date: row['Tanggal'] || '',
              studentName: row['Nama Mahasiswa'] || '',
              kampus: row['Kampus'] || '',
              totalSetor: Number(row['Total Setor']) || 0,
              totalTagih: Number(row['Total Tagihan']) || 0,
              statusTagihan: row['Status Tagihan'] || '',
              sudahBayar: Number(row['Sudah Bayar']) || 0,
              sisaTagihan: Number(row['Sisa Tagihan']) || 0,
              ketBerkas: row['Ket Berkas'] || '',
              catatanKeuangan: row['Catatan Keuangan'] || '',
              periodePengiriman: row['Periode Pengiriman'] || '',
              transactionId: row['Transaction ID'] || '',
            }));
            setStudentPayments(mappedStudentPayments);
          }

          if (newKasLedger !== undefined) {
            setKasLedger(newKasLedger || []);
          } else if (bukuBesarKas !== undefined) {
            const mappedKasLedger = bukuBesarKas.map((row: any) => ({
              id: row['ID'] || uuidv4(),
              kasId: row['Kas ID'] || '',
              date: row['Tanggal Transaksi'] || '',
              depositDate: row['Tanggal Setor'] || '',
              inAmount: Number(row['Pemasukan']) || 0,
              outAmount: Number(row['Pengeluaran']) || 0,
              loanedOutAmount: Number(row['Dipinjamkan']) || 0,
              borrowedAmount: Number(row['Meminjam']) || 0,
              notes: row['Keterangan'] || '',
              kampus: row['Kampus Tujuan'] || '',
              referenceId: row['Reference ID'] || '',
              transactionId: row['Transaction ID'] || '',
            }));
            setKasLedger(mappedKasLedger);
          }

          if (newInterKasLoans !== undefined) {
            setInterKasLoans(newInterKasLoans || []);
          } else if (hutangPiutang !== undefined) {
            const mappedInterKasLoans = hutangPiutang.map((row: any) => ({
              id: row['ID'] || uuidv4(),
              borrowerKasId: row['Kas Peminjam'] || '',
              lenderKasId: row['Kas Pemberi Pinjaman'] || '',
              amount: Number(row['Jumlah']) || 0,
              purpose: row['Tujuan'] || '',
              date: row['Tanggal Pinjam'] || '',
              dueDate: row['Tanggal Jatuh Tempo'] || '',
              status: row['Status'] || 'pending',
            }));
            setInterKasLoans(mappedInterKasLoans);
          }
        }
      }
    } catch (error) {
      // Suppress console.error to avoid spamming the console on network/CORS errors
      // console.error("Failed to sync from cloud", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pushToCloud = async (action: string, data: any) => {
    let targetUrl = settings.googleScriptUrl; // Fallback to main URL

    if (action.includes('MARKETING')) {
      targetUrl = settings.googleScriptUrl_marketing || targetUrl;
    } else if (
      action.includes('TRANSACTION') || 
      action.includes('ALLOCATION') || 
      action.includes('KAS_LEDGER') ||
      action.includes('STUDENT_PAYMENT') ||
      action === 'addDailyAllocation' ||
      action === 'updateDailyAllocation' ||
      action === 'addStudentPayment' ||
      action === 'updateStudentPayment' ||
      action === 'addLedgerEntry' ||
      action === 'updateLedgerEntry' ||
      action === 'addInterKasLoan' ||
      action === 'updateInterKasLoan' ||
      action === 'deleteDailyAllocation' ||
      action === 'deleteStudentPayment' ||
      action === 'deleteLedgerEntry' ||
      action === 'deleteInterKasLoan'
    ) {
      targetUrl = settings.googleScriptUrl_finance || targetUrl;
    } else if (
      action.includes('STUDENT') ||
      action.includes('SURAT') ||
      action.includes('INVENTARIS') ||
      action.includes('EMPLOYEE') ||
      action.includes('ATTENDANCE') ||
      action.includes('LEAVE_REQUEST')
    ) {
      if (action.includes('STUDENT_PAYMENT') || action === 'addStudentPayment') {
        targetUrl = settings.googleScriptUrl_finance || targetUrl;
      } else {
        targetUrl = settings.googleScriptUrl_admin || targetUrl;
      }
    }

    if (!targetUrl) return;

    // Don't await this to keep UI responsive, or handle error silently
    postToGoogleSheets(targetUrl, action, data).catch(() => {
      // Suppress console.error
    });
  };

  const addReport = (report: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: SavedReport = {
      ...report,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setReports((prev) => [newReport, ...prev]);
    syncReportToTransactions(newReport);
    pushToCloud('CREATE_REPORT', newReport);
    return newReport.id;
  };

  const updateReport = (id: string, updates: Partial<SavedReport>) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedReport = { ...r, ...updates, updatedAt: Date.now() };
          syncReportToTransactions(updatedReport);
          pushToCloud('UPDATE_REPORT', updatedReport);
          return updatedReport;
        }
        return r;
      })
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setTransactions((prev) => prev.filter((t) => t.reportId !== id));
    pushToCloud('DELETE_REPORT', { id });
  };

  const deleteAllReports = () => {
    setReports([]);
    pushToCloud('DELETE_ALL_REPORTS', {});
  };

  const addInternalReport = (report: Omit<SavedInternalReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: SavedInternalReport = {
      ...report,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setInternalReports((prev) => [newReport, ...prev]);
    pushToCloud('CREATE_INTERNAL_REPORT', newReport);
    return newReport.id;
  };

  const updateInternalReport = (id: string, updates: Partial<SavedInternalReport>) => {
    setInternalReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedReport = { ...r, ...updates, updatedAt: Date.now() };
          pushToCloud('UPDATE_INTERNAL_REPORT', updatedReport);
          return updatedReport;
        }
        return r;
      })
    );
  };

  const deleteInternalReport = (id: string) => {
    setInternalReports((prev) => prev.filter((r) => r.id !== id));
    pushToCloud('DELETE_INTERNAL_REPORT', { id });
  };

  const syncReportToTransactions = (report: SavedReport) => {
    setTransactions(prevTransactions => {
      const filtered = prevTransactions.filter(t => t.reportId !== report.id);
      
      const newTransactions: Transaction[] = [];
      const getReportDate = () => {
        const months: Record<string, number> = {
          'JANUARI': 0, 'FEBRUARI': 1, 'MARET': 2, 'APRIL': 3, 'MEI': 4, 'JUNI': 5,
          'JULI': 6, 'AGUSTUS': 7, 'SEPTEMBER': 8, 'OKTOBER': 9, 'NOVEMBER': 10, 'DESEMBER': 11
        };
        const monthIndex = months[report.month.toUpperCase()] || 0;
        const year = parseInt(report.year) || new Date().getFullYear();
        return new Date(year, monthIndex + 1, 0).getTime(); 
      };

      const date = getReportDate();
      const desc = `Generated from Report ${report.month} ${report.year}`;

      (report.pintuKuliah || []).forEach(item => {
        if (item.count > 0) {
          newTransactions.push({
            id: uuidv4(),
            reportId: report.id,
            date,
            partnerName: report.partnerName,
            type: 'STUDENT_PINTU',
            category: item.label,
            amount: item.count,
            description: desc
          });
        }
      });

      (report.kunciSarjana || []).forEach(item => {
        if (item.count > 0) {
          newTransactions.push({
            id: uuidv4(),
            reportId: report.id,
            date,
            partnerName: report.partnerName,
            type: 'STUDENT_KUNCI',
            category: item.label,
            amount: item.count,
            description: desc
          });
        }
      });

      const totalIncome = (report.detailedIncome || []).reduce((acc, item) => acc + item.amount, 0);
      const totalExpense = (report.detailedExpense || []).reduce((acc, item) => acc + item.amount, 0);

      if (totalIncome > 0) {
        newTransactions.push({
          id: uuidv4(),
          reportId: report.id,
          date,
          partnerName: report.partnerName,
          type: 'INCOME',
          category: 'Total Pemasukan Laporan',
          amount: totalIncome,
          description: desc
        });
      }

      if (totalExpense > 0) {
        newTransactions.push({
          id: uuidv4(),
          reportId: report.id,
          date,
          partnerName: report.partnerName,
          type: 'EXPENSE',
          category: 'Total Pengeluaran Laporan',
          amount: totalExpense,
          description: desc
        });
      }

      // Sync these new transactions to cloud as well
      const transactionsToDelete = prevTransactions.filter(t => t.reportId === report.id).map(t => t.id);
      
      if (newTransactions.length > 0 || transactionsToDelete.length > 0) {
        pushToCloud('BATCH_TRANSACTIONS', {
          adds: newTransactions,
          deletes: transactionsToDelete
        });
      }

      return [...newTransactions, ...filtered];
    });
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    // Optimistic update
    setSettings(updated);
    pushToCloud('SAVE_SETTINGS', { ...updated, id: 'settings_1' });
    try {
      await setDoc(doc(db, 'settings', 'global'), updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    pushToCloud('CREATE_TRANSACTION', newTransaction);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    pushToCloud('DELETE_TRANSACTION', { id });
  };

  const deleteAllTransactions = () => {
    setTransactions([]);
    pushToCloud('DELETE_ALL_TRANSACTIONS', {});
  };

  const addDailyAllocation = (allocation: Omit<DailyAllocation, 'id' | 'transactionId'>) => {
    const newAllocation: DailyAllocation = {
      ...allocation,
      id: uuidv4(),
    };
    setDailyAllocations((prev) => [newAllocation, ...prev]);
    pushToCloud('addDailyAllocation', newAllocation);

    // Auto-generate ledger entries
    const ledgerEntries: KasLedgerEntry[] = [];
    
    let totalAllocated = 0;
    Object.entries(allocation.allocations).forEach(([kasId, amount]) => {
      if (amount > 0) {
        totalAllocated += amount;
        ledgerEntries.push({
          id: uuidv4(),
          kasId,
          date: allocation.date,
          depositDate: allocation.date,
          inAmount: amount,
          outAmount: 0,
          loanedOutAmount: 0,
          borrowedAmount: 0,
          notes: `Alokasi Harian: ${allocation.notes || '-'}`,
          referenceId: newAllocation.id,
        });
      }
    });

    // Create outAmount entry for kasSetor
    if (totalAllocated > 0) {
      ledgerEntries.push({
        id: uuidv4(),
        kasId: 'kasSetor',
        date: allocation.date,
        depositDate: allocation.date,
        inAmount: 0,
        outAmount: totalAllocated,
        loanedOutAmount: 0,
        borrowedAmount: 0,
        notes: `Distribusi Alokasi Harian: ${allocation.notes || '-'}`,
        referenceId: newAllocation.id,
      });
    }

    if (ledgerEntries.length > 0) {
      setKasLedger((prev) => [...ledgerEntries, ...prev]);
      ledgerEntries.forEach(entry => pushToCloud('addLedgerEntry', entry));
    }
  };

  const updateDailyAllocation = (id: string, updates: Partial<DailyAllocation>) => {
    setDailyAllocations((prev) => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      const allocationToUpdate = updated.find(a => a.id === id);
      if (allocationToUpdate) {
        pushToCloud('updateDailyAllocation', allocationToUpdate);

        // Update ledger entries
        setKasLedger(lPrev => {
          const newLedger = lPrev.filter(l => l.referenceId !== id);
          const newEntries: KasLedgerEntry[] = [];
          
          let totalAllocated = 0;
          Object.entries(allocationToUpdate.allocations).forEach(([kasId, amount]) => {
            if ((amount as number) > 0) {
              totalAllocated += amount as number;
              newEntries.push({
                id: uuidv4(),
                kasId,
                date: allocationToUpdate.date,
                depositDate: allocationToUpdate.date,
                inAmount: amount as number,
                outAmount: 0,
                loanedOutAmount: 0,
                borrowedAmount: 0,
                notes: `Alokasi Harian: ${allocationToUpdate.notes || '-'}`,
                referenceId: id,
              });
            }
          });
          
          if (totalAllocated > 0) {
            newEntries.push({
              id: uuidv4(),
              kasId: 'kasSetor',
              date: allocationToUpdate.date,
              depositDate: allocationToUpdate.date,
              inAmount: 0,
              outAmount: totalAllocated,
              loanedOutAmount: 0,
              borrowedAmount: 0,
              notes: `Distribusi Alokasi Harian: ${allocationToUpdate.notes || '-'}`,
              referenceId: id,
            });
          }
          
          // Delete old entries from cloud
          lPrev.filter(l => l.referenceId === id).forEach(l => pushToCloud('deleteLedgerEntry', { id: l.id }));
          // Add new entries to cloud
          newEntries.forEach(entry => pushToCloud('addLedgerEntry', entry));

          return [...newEntries, ...newLedger];
        });
      }
      return updated;
    });
  };

  const deleteDailyAllocation = (id: string) => {
    setDailyAllocations((prev) => {
      return prev.filter((a) => a.id !== id);
    });
    setKasLedger((prev) => {
      const entriesToDelete = prev.filter((l) => l.referenceId === id);
      entriesToDelete.forEach(entry => pushToCloud('deleteLedgerEntry', { id: entry.id }));
      return prev.filter((l) => l.referenceId !== id);
    });
    pushToCloud('deleteDailyAllocation', { id });
  };

  const addKasLedgerEntry = (entry: Omit<KasLedgerEntry, 'id' | 'transactionId'>) => {
    const transactionId = uuidv4();
    const newEntry: KasLedgerEntry = {
      ...entry,
      id: uuidv4(),
      transactionId,
    };

    // Create transaction if it's not from daily allocation
    if (!entry.referenceId) {
      let type: 'INCOME' | 'EXPENSE' | null = null;
      let amount = 0;
      let category = '';
      
      if (entry.inAmount > 0) {
        type = 'INCOME';
        amount = entry.inAmount;
        category = `Pemasukan Kas (${entry.kasId})`;
      } else if (entry.outAmount > 0) {
        type = 'EXPENSE';
        amount = entry.outAmount;
        category = `Pengeluaran Kas (${entry.kasId})`;
      } else if (entry.loanedOutAmount > 0) {
        type = 'EXPENSE';
        amount = entry.loanedOutAmount;
        category = `Piutang Kas (${entry.kasId})`;
      } else if (entry.borrowedAmount > 0) {
        type = 'INCOME';
        amount = entry.borrowedAmount;
        category = `Hutang Kas (${entry.kasId})`;
      }
      
      if (type && amount > 0) {
        const newTransaction: Transaction = {
          id: transactionId,
          date: new Date(entry.date).getTime(),
          partnerName: 'INTERNAL',
          type,
          category,
          amount,
          description: entry.notes,
        };
        setTransactions((prev) => [newTransaction, ...prev]);
        pushToCloud('CREATE_TRANSACTION', newTransaction);
      }
    }

    setKasLedger((prev) => [newEntry, ...prev]);
    pushToCloud('addLedgerEntry', newEntry);
  };

  const updateKasLedgerEntry = (id: string, updates: Partial<KasLedgerEntry>) => {
    setKasLedger((prev) => {
      const updated = prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry);
      const entryToUpdate = updated.find(e => e.id === id);
      if (entryToUpdate) {
        pushToCloud('updateLedgerEntry', entryToUpdate);
        
        if (entryToUpdate.transactionId && !entryToUpdate.referenceId) {
          let type: 'INCOME' | 'EXPENSE' | null = null;
          let amount = 0;
          let category = '';
          
          if (entryToUpdate.inAmount > 0) {
            type = 'INCOME';
            amount = entryToUpdate.inAmount;
            category = `Pemasukan Kas (${entryToUpdate.kasId})`;
          } else if (entryToUpdate.outAmount > 0) {
            type = 'EXPENSE';
            amount = entryToUpdate.outAmount;
            category = `Pengeluaran Kas (${entryToUpdate.kasId})`;
          } else if (entryToUpdate.loanedOutAmount > 0) {
            type = 'EXPENSE';
            amount = entryToUpdate.loanedOutAmount;
            category = `Piutang Kas (${entryToUpdate.kasId})`;
          } else if (entryToUpdate.borrowedAmount > 0) {
            type = 'INCOME';
            amount = entryToUpdate.borrowedAmount;
            category = `Hutang Kas (${entryToUpdate.kasId})`;
          }
          
          if (type && amount > 0) {
            setTransactions(tPrev => {
              const updatedTransactions = tPrev.map(t => t.id === entryToUpdate.transactionId ? {
                ...t,
                date: new Date(entryToUpdate.date).getTime(),
                type: type as 'INCOME' | 'EXPENSE',
                category,
                amount,
                description: entryToUpdate.notes,
              } : t);
              const updatedTransaction = updatedTransactions.find(t => t.id === entryToUpdate.transactionId);
              if (updatedTransaction) {
                pushToCloud('UPDATE_TRANSACTION', updatedTransaction);
              }
              return updatedTransactions;
            });
          }
        }
      }
      return updated;
    });
  };

  const deleteKasLedgerEntry = (id: string) => {
    setKasLedger((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry && entry.transactionId) {
        setTransactions((tPrev) => tPrev.filter((t) => t.id !== entry.transactionId));
        pushToCloud('DELETE_TRANSACTION', { id: entry.transactionId });
      }
      return prev.filter((e) => e.id !== id);
    });
    pushToCloud('deleteLedgerEntry', { id });
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: uuidv4(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    pushToCloud('CREATE_STUDENT', newStudent);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedStudent = { ...s, ...updates };
          pushToCloud('UPDATE_STUDENT', updatedStudent);
          return updatedStudent;
        }
        return s;
      })
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    pushToCloud('DELETE_STUDENT', { id });
  };

  const addStudentPayment = (payment: Omit<StudentPayment, 'id'>) => {
    const transactionId = uuidv4();
    const newPayment: StudentPayment = {
      ...payment,
      id: uuidv4(),
      transactionId,
    };

    const newTransaction: Transaction = {
      id: transactionId,
      date: new Date(payment.date).getTime(),
      partnerName: 'INTERNAL',
      type: 'INCOME',
      category: 'Pembayaran Mahasiswa',
      amount: payment.sudahBayar,
      description: `${payment.studentName} - ${payment.statusTagihan} - ${payment.catatanKeuangan}`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    pushToCloud('CREATE_TRANSACTION', newTransaction);

    if (payment.totalSetor > 0) {
      const kasSetorEntry: KasLedgerEntry = {
        id: uuidv4(),
        kasId: 'kasSetor',
        date: payment.date,
        inAmount: payment.totalSetor,
        outAmount: 0,
        loanedOutAmount: 0,
        borrowedAmount: 0,
        notes: `Setoran Mahasiswa: ${payment.studentName}`,
        kampus: payment.kampus,
        referenceId: newPayment.id,
      };
      setKasLedger((prev) => [kasSetorEntry, ...prev]);
      pushToCloud('addLedgerEntry', kasSetorEntry);
    }

    setStudentPayments((prev) => [newPayment, ...prev]);
    pushToCloud('addStudentPayment', newPayment);
  };

  const updateStudentPayment = (id: string, updates: Partial<StudentPayment>) => {
    setStudentPayments((prev) => {
      const updated = prev.map(payment => payment.id === id ? { ...payment, ...updates } : payment);
      const paymentToUpdate = updated.find(p => p.id === id);
      if (paymentToUpdate) {
        pushToCloud('updateStudentPayment', paymentToUpdate);
        
        // Also update the associated transaction if it exists
        if (paymentToUpdate.transactionId) {
          setTransactions(tPrev => {
            const updatedTransactions = tPrev.map(t => t.id === paymentToUpdate.transactionId ? {
              ...t,
              date: new Date(paymentToUpdate.date).getTime(),
              amount: paymentToUpdate.sudahBayar,
              description: `${paymentToUpdate.studentName} - ${paymentToUpdate.statusTagihan} - ${paymentToUpdate.catatanKeuangan}`,
            } : t);
            const updatedTransaction = updatedTransactions.find(t => t.id === paymentToUpdate.transactionId);
            if (updatedTransaction) {
              pushToCloud('UPDATE_TRANSACTION', updatedTransaction);
            }
            return updatedTransactions;
          });
        }
        
        // Also update the associated kasSetorEntry if it exists
        setKasLedger(lPrev => {
          const updatedLedger = lPrev.map(l => l.referenceId === id ? {
            ...l,
            date: paymentToUpdate.date,
            inAmount: paymentToUpdate.totalSetor,
            notes: `Setoran Mahasiswa: ${paymentToUpdate.studentName}`,
            kampus: paymentToUpdate.kampus,
          } : l);
          const entryToUpdate = updatedLedger.find(l => l.referenceId === id);
          if (entryToUpdate) {
            pushToCloud('updateLedgerEntry', entryToUpdate);
          }
          return updatedLedger;
        });
      }
      return updated;
    });
  };

  const deleteStudentPayment = (id: string) => {
    setStudentPayments((prev) => {
      const payment = prev.find((p) => p.id === id);
      if (payment && payment.transactionId) {
        setTransactions((tPrev) => tPrev.filter((t) => t.id !== payment.transactionId));
        pushToCloud('DELETE_TRANSACTION', { id: payment.transactionId });
      }
      return prev.filter((p) => p.id !== id);
    });
    setKasLedger((prev) => {
      const entriesToDelete = prev.filter((l) => l.referenceId === id);
      entriesToDelete.forEach(entry => pushToCloud('deleteLedgerEntry', { id: entry.id }));
      return prev.filter((l) => l.referenceId !== id);
    });
    pushToCloud('deleteStudentPayment', { id });
  };

  const addInterKasLoan = (loan: Omit<InterKasLoan, 'id'>) => {
    const newLoan = { ...loan, id: uuidv4() };
    setInterKasLoans(prev => [...prev, newLoan]);
    pushToCloud('addInterKasLoan', newLoan);
  };

  const updateInterKasLoan = (id: string, updates: Partial<InterKasLoan>) => {
    setInterKasLoans(prev => {
      const updated = prev.map(loan => loan.id === id ? { ...loan, ...updates } : loan);
      const loanToUpdate = updated.find(l => l.id === id);
      if (loanToUpdate) {
        pushToCloud('updateInterKasLoan', loanToUpdate);
      }
      return updated;
    });
  };

  const deleteInterKasLoan = (id: string) => {
    setInterKasLoans(prev => prev.filter(loan => loan.id !== id));
    pushToCloud('deleteInterKasLoan', { id });
  };

  const addStudentAdministration = async (admin: Omit<StudentAdministration, 'id'>) => {
    const newAdmin = { ...admin, id: uuidv4() };
    // Optimistic update
    setStudentAdministrations(prev => [newAdmin, ...prev]);
    pushToCloud('CREATE_STUDENT_ADMINISTRATION', newAdmin);
    try {
      await setDoc(doc(db, 'studentAdministrations', newAdmin.id), newAdmin);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `studentAdministrations/${newAdmin.id}`);
    }
  };

  const updateStudentAdministration = async (id: string, updates: Partial<StudentAdministration>) => {
    // Optimistic update
    setStudentAdministrations(prev => {
      const updated = prev.map(admin => admin.id === id ? { ...admin, ...updates } : admin);
      const adminToUpdate = updated.find(a => a.id === id);
      if (adminToUpdate) {
        pushToCloud('UPDATE_STUDENT_ADMINISTRATION', adminToUpdate);
      }
      return updated;
    });
    try {
      await updateDoc(doc(db, 'studentAdministrations', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `studentAdministrations/${id}`);
    }
  };

  const deleteStudentAdministration = async (id: string) => {
    // Optimistic update
    setStudentAdministrations(prev => prev.filter(admin => admin.id !== id));
    pushToCloud('DELETE_STUDENT_ADMINISTRATION', { id });
    try {
      await deleteDoc(doc(db, 'studentAdministrations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `studentAdministrations/${id}`);
    }
  };

  const deleteAllStudentAdministrations = async () => {
    // Optimistic update
    setStudentAdministrations([]);
    pushToCloud('DELETE_ALL_STUDENT_ADMINISTRATIONS', {});
    try {
      // Note: Deleting all documents in a collection from the client is generally not recommended
      // but we'll do it sequentially for now if needed.
      for (const admin of studentAdministrations) {
        await deleteDoc(doc(db, 'studentAdministrations', admin.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `studentAdministrations`);
    }
  };

  const addMarketingReport = (report: Omit<SavedMarketingReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: SavedMarketingReport = {
      ...report,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
    };
    setMarketingReports((prev) => [newReport, ...prev]);
    pushToCloud('CREATE_MARKETING_REPORT', newReport);
    return newReport.id;
  };

  const updateMarketingReport = (id: string, updates: Partial<SavedMarketingReport>) => {
    setMarketingReports((prev) => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r);
      const reportToUpdate = updated.find(r => r.id === id);
      if (reportToUpdate) {
        pushToCloud('UPDATE_MARKETING_REPORT', reportToUpdate);
      }
      return updated;
    });
  };

  const deleteMarketingReport = (id: string) => {
    setMarketingReports((prev) => prev.filter((r) => r.id !== id));
    pushToCloud('DELETE_MARKETING_REPORT', { id });
  };

  const addAdminReport = (report: Omit<SavedAdminReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: SavedAdminReport = {
      ...report,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
    };
    setAdminReports((prev) => [newReport, ...prev]);
    pushToCloud('CREATE_ADMIN_REPORT', newReport);
    return newReport.id;
  };

  const updateAdminReport = (id: string, updates: Partial<SavedAdminReport>) => {
    setAdminReports((prev) => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r);
      const reportToUpdate = updated.find(r => r.id === id);
      if (reportToUpdate) {
        pushToCloud('UPDATE_ADMIN_REPORT', reportToUpdate);
      }
      return updated;
    });
  };

  const deleteAdminReport = (id: string) => {
    setAdminReports((prev) => prev.filter((r) => r.id !== id));
    pushToCloud('DELETE_ADMIN_REPORT', { id });
  };

  const addSurat = (surat: Omit<Surat, 'id'>) => {
    const newSurat = { ...surat, id: uuidv4() };
    setSuratList(prev => [newSurat, ...prev]);
    pushToCloud('CREATE_SURAT', newSurat);
  };

  const updateSurat = (id: string, updates: Partial<Surat>) => {
    setSuratList(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const suratToUpdate = updated.find(s => s.id === id);
      if (suratToUpdate) pushToCloud('UPDATE_SURAT', suratToUpdate);
      return updated;
    });
  };

  const deleteSurat = (id: string) => {
    setSuratList(prev => prev.filter(s => s.id !== id));
    pushToCloud('DELETE_SURAT', { id });
  };

  const addInventaris = (inventaris: Omit<Inventaris, 'id'>) => {
    const newInventaris = { ...inventaris, id: uuidv4() };
    setInventarisList(prev => [newInventaris, ...prev]);
    pushToCloud('CREATE_INVENTARIS', newInventaris);
  };

  const updateInventaris = (id: string, updates: Partial<Inventaris>) => {
    setInventarisList(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, ...updates } : i);
      const inventarisToUpdate = updated.find(i => i.id === id);
      if (inventarisToUpdate) pushToCloud('UPDATE_INVENTARIS', inventarisToUpdate);
      return updated;
    });
  };

  const deleteInventaris = (id: string) => {
    setInventarisList(prev => prev.filter(i => i.id !== id));
    pushToCloud('DELETE_INVENTARIS', { id });
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: uuidv4() };
    setEmployees(prev => [newEmployee, ...prev]);
    pushToCloud('CREATE_EMPLOYEE', newEmployee);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      const employeeToUpdate = updated.find(e => e.id === id);
      if (employeeToUpdate) pushToCloud('UPDATE_EMPLOYEE', employeeToUpdate);
      return updated;
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    pushToCloud('DELETE_EMPLOYEE', { id });
  };

  const addAttendance = (attendance: Omit<Attendance, 'id'>) => {
    const newAttendance = { ...attendance, id: uuidv4() };
    setAttendances(prev => [newAttendance, ...prev]);
    pushToCloud('CREATE_ATTENDANCE', newAttendance);
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendances(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      const attendanceToUpdate = updated.find(a => a.id === id);
      if (attendanceToUpdate) pushToCloud('UPDATE_ATTENDANCE', attendanceToUpdate);
      return updated;
    });
  };

  const deleteAttendance = (id: string) => {
    setAttendances(prev => prev.filter(a => a.id !== id));
    pushToCloud('DELETE_ATTENDANCE', { id });
  };

  const addLeaveRequest = (leaveRequest: Omit<LeaveRequest, 'id'>) => {
    const newLeaveRequest = { ...leaveRequest, id: uuidv4() };
    setLeaveRequests(prev => [newLeaveRequest, ...prev]);
    pushToCloud('CREATE_LEAVE_REQUEST', newLeaveRequest);
  };

  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      const leaveRequestToUpdate = updated.find(l => l.id === id);
      if (leaveRequestToUpdate) pushToCloud('UPDATE_LEAVE_REQUEST', leaveRequestToUpdate);
      return updated;
    });
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
    pushToCloud('DELETE_LEAVE_REQUEST', { id });
  };

  const syncAllToCloud = async () => {
    // With the new backend, data is synced automatically on every change.
    // A full sync is not supported and not necessary.
    return { success: true, message: 'Auto-sync aktif. Data tersinkronisasi secara otomatis pada setiap perubahan.' };
  };

  return {
    reports,
    internalReports,
    settings,
    transactions,
    dailyAllocations,
    kasLedger,
    students,
    studentPayments,
    studentAdministrations,
    interKasLoans,
    marketingReports,
    adminReports,
    suratList,
    inventarisList,
    employees,
    attendances,
    leaveRequests,
    addReport,
    updateReport,
    deleteReport,
    deleteAllReports,
    addInternalReport,
    updateInternalReport,
    deleteInternalReport,
    updateSettings,
    addTransaction,
    deleteTransaction,
    deleteAllTransactions,
    addDailyAllocation,
    updateDailyAllocation,
    deleteDailyAllocation,
    addKasLedgerEntry,
    updateKasLedgerEntry,
    deleteKasLedgerEntry,
    addStudent,
    updateStudent,
    deleteStudent,
    addStudentPayment,
    updateStudentPayment,
    deleteStudentPayment,
    addStudentAdministration,
    updateStudentAdministration,
    deleteStudentAdministration,
    deleteAllStudentAdministrations,
    addInterKasLoan,
    updateInterKasLoan,
    deleteInterKasLoan,
    addMarketingReport,
    updateMarketingReport,
    deleteMarketingReport,
    addAdminReport,
    updateAdminReport,
    deleteAdminReport,
    addSurat,
    updateSurat,
    deleteSurat,
    addInventaris,
    updateInventaris,
    deleteInventaris,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    syncAllToCloud,
    syncFromCloud,
    isLoaded,
    isSyncing,
  };
}
