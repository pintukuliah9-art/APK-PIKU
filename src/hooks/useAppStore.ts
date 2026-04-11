import { useState, useEffect } from 'react';
import { SavedReport, SavedInternalReport, SavedMarketingReport, SavedAdminReport, AppSettings, defaultSettings, Transaction, DailyAllocation, KasLedgerEntry, Student, StudentPayment, InterKasLoan, StudentAdministration, Surat, Inventaris, Employee, Attendance, LeaveRequest } from '../types/app';
import { initialReportData } from '../types';
import { v4 as uuidv4 } from 'uuid';
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
    const unsubscribes: (() => void)[] = [];

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        try {
          const setupListener = (collectionName: string, setter: (data: any[]) => void) => {
            const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setter(data);
            }, (error) => {
              handleFirestoreError(error, OperationType.GET, collectionName);
            });
            unsubscribes.push(unsub);
          };

          setupListener('reports', setReports);
          setupListener('internalReports', setInternalReports);
          setupListener('transactions', setTransactions);
          setupListener('dailyAllocations', setDailyAllocations);
          setupListener('kasLedger', setKasLedger);
          setupListener('students', setStudents);
          setupListener('studentPayments', setStudentPayments);
          setupListener('studentAdministrations', setStudentAdministrations);
          setupListener('interKasLoans', setInterKasLoans);
          setupListener('marketingReports', setMarketingReports);
          setupListener('adminReports', setAdminReports);
          setupListener('suratList', setSuratList);
          setupListener('inventarisList', setInventarisList);
          setupListener('employees', setEmployees);
          setupListener('attendances', setAttendances);
          setupListener('leaveRequests', setLeaveRequests);

          const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
            if (!snapshot.empty) {
              const settingsDoc = snapshot.docs.find(doc => doc.id === 'global') || snapshot.docs[0];
              setSettings({ ...defaultSettings, ...settingsDoc.data() } as AppSettings);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'settings');
          });
          unsubscribes.push(unsubSettings);

        } catch (error) {
          console.error('Error setting up Firebase listeners:', error);
        }
      } else {
        unsubscribes.forEach(unsub => unsub());
        unsubscribes.length = 0;
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

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

  const addDocument = async (collectionName: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${collectionName}/${data.id}`);
    }
  };

  const updateDocument = async (collectionName: string, id: string, updates: any) => {
    try {
      await updateDoc(doc(db, collectionName, id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const deleteDocument = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
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
    addDocument('reports', newReport);
    return newReport.id;
  };

  const updateReport = (id: string, updates: Partial<SavedReport>) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedReport = { ...r, ...updates, updatedAt: Date.now() };
          syncReportToTransactions(updatedReport);
          updateDocument('reports', id, updatedReport);
          return updatedReport;
        }
        return r;
      })
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setTransactions((prev) => prev.filter((t) => t.reportId !== id));
    deleteDocument('reports', id);
  };

  const deleteAllReports = () => {
    // Optimistic update
    setReports([]);
    reports.forEach(r => deleteDocument('reports', r.id));
  };

  const addInternalReport = (report: Omit<SavedInternalReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: SavedInternalReport = {
      ...report,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setInternalReports((prev) => [newReport, ...prev]);
    addDocument('internalReports', newReport);
    return newReport.id;
  };

  const updateInternalReport = (id: string, updates: Partial<SavedInternalReport>) => {
    setInternalReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedReport = { ...r, ...updates, updatedAt: Date.now() };
          updateDocument('internalReports', id, updatedReport);
          return updatedReport;
        }
        return r;
      })
    );
  };

  const deleteInternalReport = (id: string) => {
    setInternalReports((prev) => prev.filter((r) => r.id !== id));
    deleteDocument('internalReports', id);
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
      
      transactionsToDelete.forEach(id => deleteDocument('transactions', id));
      newTransactions.forEach(t => addDocument('transactions', t));

      return [...newTransactions, ...filtered];
    });
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    // Optimistic update
    setSettings(updated);
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
    addDocument('transactions', newTransaction);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteDocument('transactions', id);
  };

  const deleteAllTransactions = () => {
    setTransactions([]);
    transactions.forEach(t => deleteDocument('transactions', t.id));
  };

  const addDailyAllocation = (allocation: Omit<DailyAllocation, 'id' | 'transactionId'>) => {
    const newAllocation: DailyAllocation = {
      ...allocation,
      id: uuidv4(),
    };
    setDailyAllocations((prev) => [newAllocation, ...prev]);
    addDocument('dailyAllocations', newAllocation);

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
      ledgerEntries.forEach(entry => addDocument('kasLedger', entry));
    }
  };

  const updateDailyAllocation = (id: string, updates: Partial<DailyAllocation>) => {
    setDailyAllocations((prev) => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      const allocationToUpdate = updated.find(a => a.id === id);
      if (allocationToUpdate) {
        updateDocument('dailyAllocations', id, allocationToUpdate);

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
          lPrev.filter(l => l.referenceId === id).forEach(l => deleteDocument('kasLedger', l.id));
          // Add new entries to cloud
          newEntries.forEach(entry => addDocument('kasLedger', entry));

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
      entriesToDelete.forEach(entry => deleteDocument('kasLedger', entry.id));
      return prev.filter((l) => l.referenceId !== id);
    });
    deleteDocument('dailyAllocations', id);
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
        addDocument('transactions', newTransaction);
      }
    }

    setKasLedger((prev) => [newEntry, ...prev]);
    addDocument('kasLedger', newEntry);
  };

  const updateKasLedgerEntry = (id: string, updates: Partial<KasLedgerEntry>) => {
    setKasLedger((prev) => {
      const updated = prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry);
      const entryToUpdate = updated.find(e => e.id === id);
      if (entryToUpdate) {
        updateDocument('kasLedger', id, entryToUpdate);
        
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
                updateDocument('transactions', updatedTransaction.id, updatedTransaction);
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
        deleteDocument('transactions', entry.transactionId);
      }
      return prev.filter((e) => e.id !== id);
    });
    deleteDocument('kasLedger', id);
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: uuidv4(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    addDocument('students', newStudent);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedStudent = { ...s, ...updates };
          updateDocument('students', id, updatedStudent);
          return updatedStudent;
        }
        return s;
      })
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteDocument('students', id);
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
    addDocument('transactions', newTransaction);

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
      addDocument('kasLedger', kasSetorEntry);
    }

    setStudentPayments((prev) => [newPayment, ...prev]);
    addDocument('studentPayments', newPayment);
  };

  const updateStudentPayment = (id: string, updates: Partial<StudentPayment>) => {
    setStudentPayments((prev) => {
      const updated = prev.map(payment => payment.id === id ? { ...payment, ...updates } : payment);
      const paymentToUpdate = updated.find(p => p.id === id);
      if (paymentToUpdate) {
        updateDocument('studentPayments', id, paymentToUpdate);
        
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
              updateDocument('transactions', updatedTransaction.id, updatedTransaction);
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
            updateDocument('kasLedger', entryToUpdate.id, entryToUpdate);
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
        deleteDocument('transactions', payment.transactionId);
      }
      return prev.filter((p) => p.id !== id);
    });
    setKasLedger((prev) => {
      const entriesToDelete = prev.filter((l) => l.referenceId === id);
      entriesToDelete.forEach(entry => deleteDocument('kasLedger', entry.id));
      return prev.filter((l) => l.referenceId !== id);
    });
    deleteDocument('studentPayments', id);
  };

  const addInterKasLoan = (loan: Omit<InterKasLoan, 'id'>) => {
    const newLoan = { ...loan, id: uuidv4() };
    setInterKasLoans(prev => [...prev, newLoan]);
    addDocument('interKasLoans', newLoan);
  };

  const updateInterKasLoan = (id: string, updates: Partial<InterKasLoan>) => {
    setInterKasLoans(prev => {
      const updated = prev.map(loan => loan.id === id ? { ...loan, ...updates } : loan);
      const loanToUpdate = updated.find(l => l.id === id);
      if (loanToUpdate) {
        updateDocument('interKasLoans', id, loanToUpdate);
      }
      return updated;
    });
  };

  const deleteInterKasLoan = (id: string) => {
    setInterKasLoans(prev => prev.filter(loan => loan.id !== id));
    deleteDocument('interKasLoans', id);
  };

  const addStudentAdministration = async (admin: Omit<StudentAdministration, 'id'>) => {
    const newAdmin = { ...admin, id: uuidv4() };
    // Optimistic update
    setStudentAdministrations(prev => [newAdmin, ...prev]);
    addDocument('studentAdministrations', newAdmin);
  };

  const updateStudentAdministration = async (id: string, updates: Partial<StudentAdministration>) => {
    // Optimistic update
    setStudentAdministrations(prev => {
      const updated = prev.map(admin => admin.id === id ? { ...admin, ...updates } : admin);
      const adminToUpdate = updated.find(a => a.id === id);
      if (adminToUpdate) {
        updateDocument('studentAdministrations', id, adminToUpdate);
      }
      return updated;
    });
  };

  const deleteStudentAdministration = async (id: string) => {
    // Optimistic update
    setStudentAdministrations(prev => prev.filter(admin => admin.id !== id));
    deleteDocument('studentAdministrations', id);
  };

  const deleteAllStudentAdministrations = async () => {
    // Optimistic update
    setStudentAdministrations([]);
    studentAdministrations.forEach(admin => deleteDocument('studentAdministrations', admin.id));
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
    addDocument('marketingReports', newReport);
    return newReport.id;
  };

  const updateMarketingReport = (id: string, updates: Partial<SavedMarketingReport>) => {
    setMarketingReports((prev) => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r);
      const reportToUpdate = updated.find(r => r.id === id);
      if (reportToUpdate) {
        updateDocument('marketingReports', id, reportToUpdate);
      }
      return updated;
    });
  };

  const deleteMarketingReport = (id: string) => {
    setMarketingReports((prev) => prev.filter((r) => r.id !== id));
    deleteDocument('marketingReports', id);
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
    addDocument('adminReports', newReport);
    return newReport.id;
  };

  const updateAdminReport = (id: string, updates: Partial<SavedAdminReport>) => {
    setAdminReports((prev) => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r);
      const reportToUpdate = updated.find(r => r.id === id);
      if (reportToUpdate) {
        updateDocument('adminReports', id, reportToUpdate);
      }
      return updated;
    });
  };

  const deleteAdminReport = (id: string) => {
    setAdminReports((prev) => prev.filter((r) => r.id !== id));
    deleteDocument('adminReports', id);
  };

  const addSurat = (surat: Omit<Surat, 'id'>) => {
    const newSurat = { ...surat, id: uuidv4() };
    setSuratList(prev => [newSurat, ...prev]);
    addDocument('suratList', newSurat);
  };

  const updateSurat = (id: string, updates: Partial<Surat>) => {
    setSuratList(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const suratToUpdate = updated.find(s => s.id === id);
      if (suratToUpdate) updateDocument('suratList', id, suratToUpdate);
      return updated;
    });
  };

  const deleteSurat = (id: string) => {
    setSuratList(prev => prev.filter(s => s.id !== id));
    deleteDocument('suratList', id);
  };

  const addInventaris = (inventaris: Omit<Inventaris, 'id'>) => {
    const newInventaris = { ...inventaris, id: uuidv4() };
    setInventarisList(prev => [newInventaris, ...prev]);
    addDocument('inventarisList', newInventaris);
  };

  const updateInventaris = (id: string, updates: Partial<Inventaris>) => {
    setInventarisList(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, ...updates } : i);
      const inventarisToUpdate = updated.find(i => i.id === id);
      if (inventarisToUpdate) updateDocument('inventarisList', id, inventarisToUpdate);
      return updated;
    });
  };

  const deleteInventaris = (id: string) => {
    setInventarisList(prev => prev.filter(i => i.id !== id));
    deleteDocument('inventarisList', id);
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: uuidv4() };
    setEmployees(prev => [newEmployee, ...prev]);
    addDocument('employees', newEmployee);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      const employeeToUpdate = updated.find(e => e.id === id);
      if (employeeToUpdate) updateDocument('employees', id, employeeToUpdate);
      return updated;
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    deleteDocument('employees', id);
  };

  const addAttendance = (attendance: Omit<Attendance, 'id'>) => {
    const newAttendance = { ...attendance, id: uuidv4() };
    setAttendances(prev => [newAttendance, ...prev]);
    addDocument('attendances', newAttendance);
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendances(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      const attendanceToUpdate = updated.find(a => a.id === id);
      if (attendanceToUpdate) updateDocument('attendances', id, attendanceToUpdate);
      return updated;
    });
  };

  const deleteAttendance = (id: string) => {
    setAttendances(prev => prev.filter(a => a.id !== id));
    deleteDocument('attendances', id);
  };

  const addLeaveRequest = (leaveRequest: Omit<LeaveRequest, 'id'>) => {
    const newLeaveRequest = { ...leaveRequest, id: uuidv4() };
    setLeaveRequests(prev => [newLeaveRequest, ...prev]);
    addDocument('leaveRequests', newLeaveRequest);
  };

  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      const leaveRequestToUpdate = updated.find(l => l.id === id);
      if (leaveRequestToUpdate) updateDocument('leaveRequests', id, leaveRequestToUpdate);
      return updated;
    });
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
    deleteDocument('leaveRequests', id);
  };

  const migrateDataToFirebase = async () => {
    setIsSyncing(true);
    try {
      const getLocalData = (key: string, fallback: any[] = []) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      };

      const collections = [
        { name: 'reports', data: getLocalData(STORAGE_KEYS.REPORTS) },
        { name: 'internalReports', data: getLocalData(STORAGE_KEYS.INTERNAL_REPORTS) },
        { name: 'transactions', data: getLocalData(STORAGE_KEYS.TRANSACTIONS) },
        { name: 'dailyAllocations', data: getLocalData(STORAGE_KEYS.DAILY_ALLOCATIONS) },
        { name: 'kasLedger', data: getLocalData(STORAGE_KEYS.KAS_LEDGER) },
        { name: 'students', data: getLocalData(STORAGE_KEYS.STUDENTS) },
        { name: 'studentPayments', data: getLocalData(STORAGE_KEYS.STUDENT_PAYMENTS) },
        { name: 'studentAdministrations', data: getLocalData(STORAGE_KEYS.STUDENT_ADMINISTRATIONS) },
        { name: 'interKasLoans', data: getLocalData(STORAGE_KEYS.INTER_KAS_LOANS) },
        { name: 'marketingReports', data: getLocalData(STORAGE_KEYS.MARKETING_REPORTS) },
        { name: 'adminReports', data: getLocalData(STORAGE_KEYS.ADMIN_REPORTS) },
        { name: 'suratList', data: getLocalData(STORAGE_KEYS.SURAT) },
        { name: 'inventarisList', data: getLocalData(STORAGE_KEYS.INVENTARIS) },
        { name: 'employees', data: getLocalData(STORAGE_KEYS.EMPLOYEES) },
        { name: 'attendances', data: getLocalData(STORAGE_KEYS.ATTENDANCES) },
        { name: 'leaveRequests', data: getLocalData(STORAGE_KEYS.LEAVE_REQUESTS) },
        // Marketing Store Data
        { name: 'timMarketing', data: getLocalData('app_tim_marketing') },
        { name: 'akunAds', data: getLocalData('app_akun_ads') },
        { name: 'laporanAds', data: getLocalData('app_laporan_ads') },
        { name: 'laporanCS', data: getLocalData('app_laporan_cs') },
        { name: 'prospekCRM', data: getLocalData('app_prospek_crm') },
        { name: 'targetKPI', data: getLocalData('app_target_kpi') },
      ];

      for (const { name, data } of collections) {
        for (const item of data) {
          if (item && item.id) {
            await setDoc(doc(db, name, item.id), item);
          }
        }
      }
      
      const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (localSettings) {
        await setDoc(doc(db, 'settings', 'global'), JSON.parse(localSettings));
      } else if (settings) {
        await setDoc(doc(db, 'settings', 'global'), settings);
      }
      
      return { success: true, message: 'Migrasi data ke Firebase berhasil!' };
    } catch (error) {
      console.error('Migration error:', error);
      return { success: false, message: 'Gagal memigrasikan data ke Firebase.' };
    } finally {
      setIsSyncing(false);
    }
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
    migrateDataToFirebase,
    isLoaded,
    isSyncing,
  };
}
