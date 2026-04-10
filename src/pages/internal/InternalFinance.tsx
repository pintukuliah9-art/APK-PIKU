import React, { useState } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { Plus, Trash2, Calendar, DollarSign, PieChart, ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Edit2 } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'motion/react';
import { KasLedgerEntry } from '../../types/app';
import { StudentPaymentsTab } from '../../components/StudentPaymentsTab';
import { formatNumberInput, parseNumberInput } from '../../lib/utils';
import { ConfirmModal } from '../../components/ConfirmModal';

const WALLET_STYLES = [
  { color: 'bg-green-100 text-green-600', border: 'border-green-200' },
  { color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  { color: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
  { color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
  { color: 'bg-gray-100 text-gray-600 dark:text-slate-400', border: 'border-gray-200 dark:border-slate-700' },
  { color: 'bg-teal-100 text-teal-600', border: 'border-teal-200' },
  { color: 'bg-rose-100 text-rose-600', border: 'border-rose-200' },
  { color: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200' },
];

const getWalletStyle = (index: number) => WALLET_STYLES[index % WALLET_STYLES.length];

export default function InternalFinance() {
  const { 
    dailyAllocations, 
    kasLedger, 
    addDailyAllocation, 
    updateDailyAllocation,
    deleteDailyAllocation, 
    addKasLedgerEntry, 
    updateKasLedgerEntry,
    deleteKasLedgerEntry, 
    updateStudentAdministration,
    studentAdministrations,
    interKasLoans,
    addInterKasLoan,
    updateInterKasLoan,
    deleteInterKasLoan,
    settings
  } = useAppStore();
  const fundSources = settings.fundSources || [];
  const internalCashWallets = settings.internalCashWallets || [];
  const allWallets = [...fundSources, ...internalCashWallets];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedKas, setSelectedKas] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sumberDana' | 'dompetKas' | 'payments' | 'allocations' | 'pengaturan'>('sumberDana');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  
  // Form state for Daily Allocation
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [savingDireksi, setSavingDireksi] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [yayasanStisDarulUlum, setYayasanStisDarulUlum] = useState<number>(0);
  const [yayasanStisBda, setYayasanStisBda] = useState<number>(0);
  const [sewaGedung, setSewaGedung] = useState<number>(0);
  const [operasionalKunciSarjana, setOperasionalKunciSarjana] = useState<number>(0);
  const [gaji, setGaji] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Form state for Ledger Entry
  const [ledgerDate, setLedgerDate] = useState(new Date().toISOString().split('T')[0]);
  const [ledgerDepositDate, setLedgerDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [ledgerType, setLedgerType] = useState<'in' | 'out' | 'loanOut' | 'borrow'>('out');
  const [ledgerAmount, setLedgerAmount] = useState<number>(0);
  const [ledgerNotes, setLedgerNotes] = useState('');
  const [ledgerKampus, setLedgerKampus] = useState('');

  // Form state for Student Payment
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStudentName, setPaymentStudentName] = useState('');
  const [paymentKampus, setPaymentKampus] = useState('');
  const [paymentTotalSetor, setPaymentTotalSetor] = useState<number>(0);
  const [paymentTotalTagih, setPaymentTotalTagih] = useState<number>(0);
  const [paymentStatusTagihan, setPaymentStatusTagihan] = useState('');
  const [paymentSudahBayar, setPaymentSudahBayar] = useState<number>(0);
  const [paymentSisaTagihan, setPaymentSisaTagihan] = useState<number>(0);
  const [paymentKetBerkas, setPaymentKetBerkas] = useState('');
  const [paymentCatatanKeuangan, setPaymentCatatanKeuangan] = useState('');
  const [paymentPeriodePengiriman, setPaymentPeriodePengiriman] = useState('');

  // Form state for Inter Kas Loan
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanBorrowerKasId, setLoanBorrowerKasId] = useState('');
  const [loanLenderKasId, setLoanLenderKasId] = useState('');
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanPurpose, setLoanPurpose] = useState('');

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

  const handleOpenAllocationModal = () => {
    setEditingAllocationId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setTotalIncome(0);
    setSavingDireksi(0);
    setFee(0);
    setYayasanStisDarulUlum(0);
    setYayasanStisBda(0);
    setSewaGedung(0);
    setOperasionalKunciSarjana(0);
    setGaji(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenLedgerModal = () => {
    setEditingLedgerId(null);
    setLedgerDate(new Date().toISOString().split('T')[0]);
    setLedgerDepositDate(new Date().toISOString().split('T')[0]);
    setLedgerType('out');
    setLedgerAmount(0);
    setLedgerNotes('');
    setLedgerKampus('');
    setIsLedgerModalOpen(true);
  };

  const handleOpenPaymentModal = () => {
    setEditingPaymentId(null);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentStudentName('');
    setPaymentKampus('');
    setPaymentTotalSetor(0);
    setPaymentTotalTagih(0);
    setPaymentStatusTagihan('');
    setPaymentSudahBayar(0);
    setPaymentSisaTagihan(0);
    setPaymentKetBerkas('');
    setPaymentCatatanKeuangan('');
    setPaymentPeriodePengiriman('');
    setIsPaymentModalOpen(true);
  };

  const handleOpenLoanModal = () => {
    setEditingLoanId(null);
    setLoanDate(new Date().toISOString().split('T')[0]);
    setLoanDueDate('');
    setLoanBorrowerKasId('');
    setLoanLenderKasId('');
    setLoanAmount(0);
    setLoanPurpose('');
    setIsLoanModalOpen(true);
  };

  const totalAllocated = savingDireksi + fee + yayasanStisDarulUlum + yayasanStisBda + sewaGedung + operasionalKunciSarjana + gaji;
  const remaining = totalIncome - totalAllocated;

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allocationData = {
      date,
      totalIncome,
      allocations: {
        savingDireksi,
        fee,
        yayasanStisDarulUlum,
        yayasanStisBda,
        sewaGedung,
        operasionalKunciSarjana,
        gaji,
      },
      notes
    };

    if (editingAllocationId) {
      updateDailyAllocation(editingAllocationId, allocationData);
    } else {
      addDailyAllocation(allocationData);
    }
    
    setIsModalOpen(false);
    setEditingAllocationId(null);
    // Reset form
    setTotalIncome(0);
    setSavingDireksi(0);
    setFee(0);
    setYayasanStisDarulUlum(0);
    setYayasanStisBda(0);
    setSewaGedung(0);
    setOperasionalKunciSarjana(0);
    setGaji(0);
    setNotes('');
  };

  const handleSaveLedgerEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKas) return;

    const entryData = {
      kasId: selectedKas,
      date: ledgerDate,
      depositDate: ledgerType === 'borrow' ? ledgerDepositDate : undefined,
      inAmount: ledgerType === 'in' ? ledgerAmount : 0,
      outAmount: ledgerType === 'out' ? ledgerAmount : 0,
      loanedOutAmount: ledgerType === 'loanOut' ? ledgerAmount : 0,
      borrowedAmount: ledgerType === 'borrow' ? ledgerAmount : 0,
      notes: ledgerNotes,
      kampus: selectedKas === 'kasSetor' ? ledgerKampus : undefined,
    };

    if (editingLedgerId) {
      updateKasLedgerEntry(editingLedgerId, entryData);
    } else {
      addKasLedgerEntry(entryData);
    }

    setIsLedgerModalOpen(false);
    setEditingLedgerId(null);
    setLedgerAmount(0);
    setLedgerNotes('');
    setLedgerKampus('');
  };

  const handleSaveStudentPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData = {
      tanggalDaftar: paymentDate,
      namaLengkap: paymentStudentName,
      perguruanTinggi: paymentKampus,
      totalSetor: paymentTotalSetor,
      totalTagih: paymentTotalTagih,
      statusTagihan: paymentStatusTagihan,
      sudahBayar: paymentSudahBayar,
      sisaTagihan: paymentSisaTagihan,
      ketBerkas: paymentKetBerkas,
      catatanKeuangan: paymentCatatanKeuangan,
      periodePengiriman: paymentPeriodePengiriman,
    };

    if (editingPaymentId) {
      updateStudentAdministration(editingPaymentId, paymentData);
    }

    setIsPaymentModalOpen(false);
    setEditingPaymentId(null);
    setPaymentStudentName('');
    setPaymentKampus('');
    setPaymentTotalSetor(0);
    setPaymentTotalTagih(0);
    setPaymentStatusTagihan('');
    setPaymentSudahBayar(0);
    setPaymentSisaTagihan(0);
    setPaymentKetBerkas('');
    setPaymentCatatanKeuangan('');
    setPaymentPeriodePengiriman('');
  };

  const handlePaymentTotalTagihChange = (val: number) => {
    setPaymentTotalTagih(val);
    setPaymentSisaTagihan(val - paymentSudahBayar);
  };

  const handlePaymentSudahBayarChange = (val: number) => {
    setPaymentSudahBayar(val);
    setPaymentSisaTagihan(paymentTotalTagih - val);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanBorrowerKasId || !loanLenderKasId || loanAmount <= 0) return;

    const loanData = {
      borrowerKasId: loanBorrowerKasId,
      lenderKasId: loanLenderKasId,
      amount: loanAmount,
      purpose: loanPurpose,
      date: loanDate,
      dueDate: loanDueDate,
      status: 'pending' as const
    };

    if (editingLoanId) {
      updateInterKasLoan(editingLoanId, loanData);
    } else {
      addInterKasLoan(loanData);
    }

    setIsLoanModalOpen(false);
    setEditingLoanId(null);
    setLoanBorrowerKasId('');
    setLoanLenderKasId('');
    setLoanAmount(0);
    setLoanPurpose('');
    setLoanDueDate('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAutoIncomeEntries = (kasId: string) => {
    if (kasId === 'fs_akselerasi') {
      return studentAdministrations
        .filter(s => s.program?.toLowerCase().includes('akselerasi') && (Number(s.sudahBayar) || 0) > 0)
        .map(s => ({
          id: `auto-${s.id}`,
          kasId,
          date: s.tanggalDaftar || new Date().toISOString().split('T')[0],
          inAmount: Number(s.sudahBayar) || 0,
          outAmount: 0,
          loanedOutAmount: 0,
          borrowedAmount: 0,
          notes: `Pembayaran SPP/Pendidikan: ${s.namaLengkap} (${s.program})`,
          referenceId: 'auto',
        }));
    }
    if (kasId === 'fs_rpl') {
      return studentAdministrations
        .filter(s => s.program?.toLowerCase().includes('rpl') && (Number(s.sudahBayar) || 0) > 0)
        .map(s => ({
          id: `auto-${s.id}`,
          kasId,
          date: s.tanggalDaftar || new Date().toISOString().split('T')[0],
          inAmount: Number(s.sudahBayar) || 0,
          outAmount: 0,
          loanedOutAmount: 0,
          borrowedAmount: 0,
          notes: `Pembayaran SPP/Pendidikan: ${s.namaLengkap} (${s.program})`,
          referenceId: 'auto',
        }));
    }
    if (kasId === 'fs_karyawan') {
      return studentAdministrations
        .filter(s => (s.program?.toLowerCase().includes('reguler') || s.program?.toLowerCase().includes('karyawan')) && (Number(s.sudahBayar) || 0) > 0)
        .map(s => ({
          id: `auto-${s.id}`,
          kasId,
          date: s.tanggalDaftar || new Date().toISOString().split('T')[0],
          inAmount: Number(s.sudahBayar) || 0,
          outAmount: 0,
          loanedOutAmount: 0,
          borrowedAmount: 0,
          notes: `Pembayaran SPP/Pendidikan: ${s.namaLengkap} (${s.program})`,
          referenceId: 'auto',
        }));
    }
    return [];
  };

  const calculateKasBalance = (kasId: string) => {
    const entries = kasLedger.filter(e => e.kasId === kasId);
    const autoEntries = getAutoIncomeEntries(kasId);
    const ledgerBalance = [...entries, ...autoEntries].reduce((acc, curr) => acc + curr.inAmount - curr.outAmount - curr.loanedOutAmount + curr.borrowedAmount, 0);
    
    const loansBorrowed = interKasLoans.filter(l => l.borrowerKasId === kasId && l.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
    const loansLent = interKasLoans.filter(l => l.lenderKasId === kasId && l.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

    return ledgerBalance + loansBorrowed - loansLent;
  };

  if (selectedKas) {
    const kasInfo = allWallets.find(k => k.id === selectedKas);
    const ledgerEntries = [...kasLedger.filter(e => e.kasId === selectedKas), ...getAutoIncomeEntries(selectedKas)];
    
    // Add pending loans to the ledger view
    const relatedLoans = interKasLoans.filter(l => (l.borrowerKasId === selectedKas || l.lenderKasId === selectedKas) && l.status === 'pending');
    relatedLoans.forEach(loan => {
      if (loan.borrowerKasId === selectedKas) {
        ledgerEntries.push({
          id: `loan-${loan.id}`,
          kasId: selectedKas,
          date: loan.date,
          inAmount: 0,
          outAmount: 0,
          loanedOutAmount: 0,
          borrowedAmount: loan.amount,
          notes: `Pinjaman dari ${allWallets.find(k => k.id === loan.lenderKasId)?.name} - ${loan.purpose} (Jatuh Tempo: ${loan.dueDate})`,
        });
      }
      if (loan.lenderKasId === selectedKas) {
        ledgerEntries.push({
          id: `loan-${loan.id}`,
          kasId: selectedKas,
          date: loan.date,
          inAmount: 0,
          outAmount: 0,
          loanedOutAmount: loan.amount,
          borrowedAmount: 0,
          notes: `Memberikan pinjaman ke ${allWallets.find(k => k.id === loan.borrowerKasId)?.name} - ${loan.purpose} (Jatuh Tempo: ${loan.dueDate})`,
        });
      }
    });

    const entries = ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    const entriesWithBalance = entries.map(entry => {
      runningBalance += (entry.inAmount - entry.outAmount - entry.loanedOutAmount + entry.borrowedAmount);
      return { ...entry, balance: runningBalance };
    });

    // Calculate balance per kampus for Kas Setor
    const kampusBalances: Record<string, number> = {};
    if (selectedKas === 'kasSetor') {
      entries.forEach(entry => {
        const kampus = entry.kampus || 'Lainnya';
        if (!kampusBalances[kampus]) {
          kampusBalances[kampus] = 0;
        }
        kampusBalances[kampus] += (entry.inAmount - entry.outAmount - entry.loanedOutAmount + entry.borrowedAmount);
      });
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedKas(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{kasInfo?.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200">Buku besar dan riwayat transaksi kas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Dana Masuk</h3>
            <p className="text-xl font-bold text-green-600 mt-2">
              {formatCurrency(entries.reduce((acc, curr) => acc + curr.inAmount, 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Dipakai</h3>
            <p className="text-xl font-bold text-red-600 mt-2">
              {formatCurrency(entries.reduce((acc, curr) => acc + curr.outAmount, 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Dipinjamkan</h3>
            <p className="text-xl font-bold text-orange-600 mt-2">
              {formatCurrency(entries.reduce((acc, curr) => acc + curr.loanedOutAmount, 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Meminjam</h3>
            <p className="text-xl font-bold text-blue-600 mt-2">
              {formatCurrency(entries.reduce((acc, curr) => acc + curr.borrowedAmount, 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 bg-blue-50">
            <h3 className="text-sm font-medium text-blue-800">Saldo Akhir</h3>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {formatCurrency(runningBalance)}
            </p>
          </div>
        </div>

        {selectedKas === 'kasSetor' && Object.keys(kampusBalances).length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg">Saldo Kas Setor per Kampus</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(kampusBalances).map(([kampus, balance]) => (
                <div key={kampus} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="text-sm font-medium text-indigo-800">{kampus}</h4>
                  <p className="text-xl font-bold text-indigo-900 mt-1">{formatCurrency(balance)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Riwayat Transaksi</h3>
            <button
              onClick={handleOpenLedgerModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} />
              Tambah Transaksi
            </button>
          </div>
          
          {entriesWithBalance.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
              Belum ada data transaksi untuk kas ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-sm">
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400">Tanggal Transaksi</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400">Tanggal Deposit</th>
                    {selectedKas === 'kasSetor' && <th className="p-4 font-medium text-gray-600 dark:text-slate-400">Kampus</th>}
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400">Keterangan</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-right">Dana Masuk</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-right">Dipakai</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-right">Dipinjamkan</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-right">Meminjam</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-right">Saldo</th>
                    <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {entriesWithBalance.reverse().map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:bg-slate-800/50">
                      <td className="p-4 whitespace-nowrap">{item.date}</td>
                      <td className="p-4 whitespace-nowrap">{item.depositDate || '-'}</td>
                      {selectedKas === 'kasSetor' && <td className="p-4 whitespace-nowrap">{item.kampus || '-'}</td>}
                      <td className="p-4">{item.notes}</td>
                      <td className="p-4 text-right text-green-600">{item.inAmount > 0 ? formatCurrency(item.inAmount) : '-'}</td>
                      <td className="p-4 text-right text-red-600">{item.outAmount > 0 ? formatCurrency(item.outAmount) : '-'}</td>
                      <td className="p-4 text-right text-orange-600">{item.loanedOutAmount > 0 ? formatCurrency(item.loanedOutAmount) : '-'}</td>
                      <td className="p-4 text-right text-blue-600">{item.borrowedAmount > 0 ? formatCurrency(item.borrowedAmount) : '-'}</td>
                      <td className="p-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.balance)}</td>
                      <td className="p-4 text-center">
                        {!item.referenceId && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingLedgerId(item.id);
                                setLedgerDate(item.date);
                                setLedgerDepositDate(item.depositDate || item.date);
                                if (item.inAmount > 0) {
                                  setLedgerType('in');
                                  setLedgerAmount(item.inAmount);
                                } else if (item.outAmount > 0) {
                                  setLedgerType('out');
                                  setLedgerAmount(item.outAmount);
                                } else if (item.loanedOutAmount > 0) {
                                  setLedgerType('loanOut');
                                  setLedgerAmount(item.loanedOutAmount);
                                } else if (item.borrowedAmount > 0) {
                                  setLedgerType('borrow');
                                  setLedgerAmount(item.borrowedAmount);
                                }
                                setLedgerNotes(item.notes);
                                setLedgerKampus(item.kampus || '');
                                setIsLedgerModalOpen(true);
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Hapus Transaksi',
                                  message: 'Apakah Anda yakin ingin menghapus transaksi ini?',
                                  onConfirm: () => deleteKasLedgerEntry(item.id)
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Tambah Transaksi Kas */}
        {isLedgerModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingLedgerId ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas'}</h2>
                <button onClick={() => setIsLedgerModalOpen(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">✕</button>
              </div>
              
              <form onSubmit={handleSaveLedgerEntry} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Transaksi</label>
                    <input
                      type="date"
                      required
                      value={ledgerDate}
                      onChange={(e) => setLedgerDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {ledgerType === 'borrow' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Deposit</label>
                      <input
                        type="date"
                        required
                        value={ledgerDepositDate}
                        onChange={(e) => setLedgerDepositDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setLedgerType('in')}
                      className={`p-2 text-sm rounded-lg border flex items-center justify-center gap-1 ${ledgerType === 'in' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}
                    >
                      <ArrowDownRight size={16} /> Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => setLedgerType('out')}
                      className={`p-2 text-sm rounded-lg border flex items-center justify-center gap-1 ${ledgerType === 'out' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}
                    >
                      <ArrowUpRight size={16} /> Keluar
                    </button>
                    <button
                      type="button"
                      onClick={() => setLedgerType('loanOut')}
                      className={`p-2 text-sm rounded-lg border flex items-center justify-center gap-1 ${ledgerType === 'loanOut' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}
                    >
                      <ArrowUpRight size={16} /> Dipinjamkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setLedgerType('borrow')}
                      className={`p-2 text-sm rounded-lg border flex items-center justify-center gap-1 ${ledgerType === 'borrow' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}
                    >
                      <ArrowDownRight size={16} /> Meminjam
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
                  <input
                    type="text"
                    required
                    value={formatNumberInput(ledgerAmount)}
                    onChange={(e) => setLedgerAmount(parseNumberInput(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedKas === 'kasSetor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kampus Tujuan</label>
                    <select
                      required
                      value={ledgerKampus}
                      onChange={(e) => setLedgerKampus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kampus</option>
                      {settings.adminOptions?.PERGURUAN_TINGGI?.map((pt, i) => (
                        <option key={`${pt}-${i}`} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Keterangan</label>
                  <textarea
                    required
                    value={ledgerNotes}
                    onChange={(e) => setLedgerNotes(e.target.value)}
                    placeholder={ledgerType === 'borrow' ? 'Contoh: Dipinjam oleh Budi' : 'Keterangan transaksi...'}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsLedgerModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const totalDanaMasuk = studentAdministrations.reduce((acc, curr) => acc + (Number(curr.sudahBayar) || 0), 0);
  const totalDialokasikan = dailyAllocations.reduce((acc, curr) => {
    return acc + Object.values(curr.allocations).reduce((sum: number, val) => sum + ((val as number) || 0), 0);
  }, 0);
  const totalBelumDialokasikan = totalDanaMasuk - totalDialokasikan;
  const totalDanaKeluar = kasLedger.reduce((acc, curr) => {
    const isInternalTransfer = curr.kasId === 'kasSetor' && curr.notes.startsWith('Distribusi Alokasi Harian');
    if (isInternalTransfer) return acc;
    return acc + curr.outAmount;
  }, 0);
  const sisaSaldo = allWallets.reduce((acc, wallet) => acc + calculateKasBalance(wallet.id), 0);

  const allocationData = [
    { name: 'Saving Direksi', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.savingDireksi, 0), color: '#16a34a' },
    { name: 'Fee', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.fee, 0), color: '#2563eb' },
    { name: 'Yayasan DU', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.yayasanStisDarulUlum, 0), color: '#ea580c' },
    { name: 'Yayasan BDA', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.yayasanStisBda, 0), color: '#9333ea' },
    { name: 'Sewa Gedung', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.sewaGedung, 0), color: '#4b5563' },
    { name: 'Ops Kunci Sarjana', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.operasionalKunciSarjana, 0), color: '#0d9488' },
    { name: 'Gaji', value: dailyAllocations.reduce((acc, curr) => acc + curr.allocations.gaji, 0), color: '#e11d48' },
  ].filter(d => d.value > 0);

  const recentTransactions = [...kasLedger]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Keuangan Internal</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1">Kelola alokasi harian dan pantau buku besar masing-masing kas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
          {activeTab === 'allocations' && (
            <button
              onClick={handleOpenAllocationModal}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-200"
            >
              <Plus size={18} />
              Alokasi Dana Harian
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('sumberDana')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'sumberDana' ? 'text-blue-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
          }`}
        >
          Dashboard Sumber Dana
          {activeTab === 'sumberDana' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('dompetKas')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'dompetKas' ? 'text-blue-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
          }`}
        >
          Dashboard Dompet Kas
          {activeTab === 'dompetKas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'payments' ? 'text-blue-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
          }`}
        >
          Dana Masuk Mahasiswa
          {activeTab === 'payments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'allocations' ? 'text-blue-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
          }`}
        >
          Riwayat Alokasi Harian
          {activeTab === 'allocations' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pengaturan')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'pengaturan' ? 'text-blue-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
          }`}
        >
          Pengaturan
          {activeTab === 'pengaturan' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'sumberDana' || activeTab === 'dompetKas' ? (
        <div className="space-y-6">
          {/* Bento Grid Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-2xl shadow-sm border border-blue-700 text-slate-900 dark:text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <PieChart size={160} />
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 dark:text-blue-200 font-medium">Sisa Saldo Keseluruhan</h3>
              <p className="text-4xl font-bold mt-2 tabular-nums">
                {formatCurrency(sisaSaldo)}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 text-sm">Total Dana Masuk</p>
                  <p className="text-xl font-semibold tabular-nums">{formatCurrency(totalDanaMasuk)}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 text-sm">Belum Dialokasikan</p>
                  <p className="text-xl font-semibold text-orange-300 tabular-nums">{formatCurrency(totalBelumDialokasikan)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Dialokasikan</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2 tabular-nums">
                  {formatCurrency(totalDialokasikan)}
                </p>
              </div>
              <div className="mt-4 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={40}>
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Dana Keluar</h3>
                <p className="text-2xl font-bold text-red-600 mt-2 tabular-nums">
                  {formatCurrency(totalDanaKeluar)}
                </p>
              </div>
              <div className="mt-4 flex items-end h-24 space-x-1">
                {/* Fake mini bar chart for visual effect */}
                {[40, 70, 45, 90, 65, 85, 60].map((h, i) => (
                  <div key={i} className="bg-red-100 w-full rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Digital Wallets */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {activeTab === 'sumberDana' ? 'Sumber Dana' : 'Dompet Kas Internal'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(activeTab === 'sumberDana' ? fundSources : internalCashWallets).map((kas, index) => {
                const style = getWalletStyle(index);
                const balance = calculateKasBalance(kas.id);
                return (
                  <div 
                    key={kas.id} 
                    onClick={() => setSelectedKas(kas.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 group ${style.color.replace('text-', 'bg-').replace('100', '50')} ${style.border}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${style.color}`}>
                        <DollarSign size={20} />
                      </div>
                      <ArrowUpRight size={20} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{kas.name}</h3>
                    <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(balance)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Timeline */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Aktivitas Terkini</h3>
              </div>
              <div className="p-6 space-y-6">
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-slate-400 text-sm">Belum ada aktivitas.</p>
                ) : (
                  recentTransactions.map((trx, idx) => {
                    const isIncome = trx.inAmount > 0 || trx.borrowedAmount > 0;
                    const amount = trx.inAmount || trx.outAmount || trx.loanedOutAmount || trx.borrowedAmount;
                    const kasName = allWallets.find(k => k.id === trx.kasId)?.name || 'Kas';
                    
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className={`mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {isIncome ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{trx.notes}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{kasName} • {new Date(trx.date).toLocaleDateString('id-ID')}</p>
                          <p className={`text-sm font-bold mt-1 tabular-nums ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pinjaman Antar Kas */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pinjaman Antar Kas</h2>
                </div>
                <button
                  onClick={handleOpenLoanModal}
                  className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Pinjaman
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3">Peminjam</th>
                      <th className="px-6 py-3">Pemberi</th>
                      <th className="px-6 py-3">Jumlah</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interKasLoans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                          Belum ada catatan pinjaman antar kas
                        </td>
                      </tr>
                    ) : (
                      interKasLoans.map((loan) => (
                        <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-slate-800/50">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {allWallets.find(k => k.id === loan.borrowerKasId)?.name || loan.borrowerKasId}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                            {allWallets.find(k => k.id === loan.lenderKasId)?.name || loan.lenderKasId}
                          </td>
                          <td className="px-6 py-4 font-medium text-orange-600 tabular-nums">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              loan.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {loan.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {loan.status === 'pending' && (
                                <button
                                  onClick={() => updateInterKasLoan(loan.id, { status: 'paid' })}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium bg-green-50 px-2 py-1 rounded"
                                >
                                  Tandai Lunas
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingLoanId(loan.id);
                                  setLoanDate(loan.date);
                                  setLoanDueDate(loan.dueDate || '');
                                  setLoanBorrowerKasId(loan.borrowerKasId);
                                  setLoanLenderKasId(loan.lenderKasId);
                                  setLoanAmount(loan.amount);
                                  setLoanPurpose(loan.purpose);
                                  setIsLoanModalOpen(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Hapus Pinjaman',
                                    message: 'Apakah Anda yakin ingin menghapus catatan pinjaman ini?',
                                    onConfirm: () => deleteInterKasLoan(loan.id)
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'payments' ? (
        <StudentPaymentsTab onEdit={(payment) => {
          setEditingPaymentId(payment.id);
          setPaymentDate(payment.tanggalDaftar || '');
          setPaymentStudentName(payment.namaLengkap || '');
          setPaymentKampus(payment.perguruanTinggi || '');
          setPaymentTotalSetor(Number(payment.totalSetor) || 0);
          setPaymentTotalTagih(Number(payment.totalTagih) || 0);
          setPaymentStatusTagihan(payment.statusTagihan || '');
          setPaymentSudahBayar(Number(payment.sudahBayar) || 0);
          setPaymentSisaTagihan(Number(payment.sisaTagihan) || 0);
          setPaymentKetBerkas(payment.ketBerkas || '');
          setPaymentCatatanKeuangan(payment.catatanKeuangan || '');
          setPaymentPeriodePengiriman(payment.periodePengiriman || '');
          setIsPaymentModalOpen(true);
        }} />
      ) : activeTab === 'allocations' ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Riwayat Alokasi Dana Harian</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-sm">
                  <th className="p-4 font-medium text-gray-600 dark:text-slate-400">Tanggal</th>
                  <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-right">Total Dana Masuk</th>
                  <th className="p-4 font-medium text-gray-600 dark:text-slate-400">Keterangan</th>
                  <th className="p-4 font-medium text-gray-600 dark:text-slate-400 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {dailyAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-slate-400">
                      Belum ada data alokasi harian.
                    </td>
                  </tr>
                ) : (
                  dailyAllocations.map((allocation) => (
                    <tr key={allocation.id} className="hover:bg-gray-50 dark:bg-slate-800/50">
                      <td className="p-4 whitespace-nowrap">{allocation.date}</td>
                      <td className="p-4 text-right font-medium text-green-600 tabular-nums">{formatCurrency(allocation.totalIncome)}</td>
                      <td className="p-4">{allocation.notes || '-'}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingAllocationId(allocation.id);
                              setDate(allocation.date);
                              setTotalIncome(allocation.totalIncome);
                              setSavingDireksi(allocation.allocations.savingDireksi || 0);
                              setFee(allocation.allocations.fee || 0);
                              setYayasanStisDarulUlum(allocation.allocations.yayasanStisDarulUlum || 0);
                              setYayasanStisBda(allocation.allocations.yayasanStisBda || 0);
                              setSewaGedung(allocation.allocations.sewaGedung || 0);
                              setOperasionalKunciSarjana(allocation.allocations.operasionalKunciSarjana || 0);
                              setGaji(allocation.allocations.gaji || 0);
                              setNotes(allocation.notes || '');
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Alokasi',
                                message: 'Apakah Anda yakin ingin menghapus data alokasi ini?',
                                onConfirm: () => deleteDailyAllocation(allocation.id)
                              });
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'pengaturan' ? (
        <PengaturanFinanceTab />
      ) : null}

      {/* Modal Tambah Alokasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingAllocationId ? 'Edit Alokasi Harian' : 'Tambah Alokasi Harian'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveAllocation} className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Total Dana Masuk (Rp)</label>
                  <input
                    type="text"
                    required
                    value={formatNumberInput(totalIncome)}
                    onChange={(e) => setTotalIncome(parseNumberInput(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-blue-700"
                  />
                  {studentAdministrations.filter(p => p.tanggalDaftar === date).reduce((sum, p) => sum + (Number(p.sudahBayar) || 0), 0) > 0 && (
                    <div className="mt-2 flex items-center justify-between text-sm bg-blue-50 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-blue-800">Dana mhs hari ini: <strong>{formatCurrency(studentAdministrations.filter(p => p.tanggalDaftar === date).reduce((sum, p) => sum + (Number(p.sudahBayar) || 0), 0))}</strong></span>
                      <button 
                        type="button" 
                        onClick={() => setTotalIncome(studentAdministrations.filter(p => p.tanggalDaftar === date).reduce((sum, p) => sum + (Number(p.sudahBayar) || 0), 0))}
                        className="text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Gunakan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">Rincian Alokasi ke Kas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Saving Direksi</label>
                    <input
                      type="text"
                      value={formatNumberInput(savingDireksi)}
                      onChange={(e) => setSavingDireksi(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Fee</label>
                    <input
                      type="text"
                      value={formatNumberInput(fee)}
                      onChange={(e) => setFee(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Yayasan/Kampus STIS Darul Ulum</label>
                    <input
                      type="text"
                      value={formatNumberInput(yayasanStisDarulUlum)}
                      onChange={(e) => setYayasanStisDarulUlum(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Yayasan/Kampus STIS BDA</label>
                    <input
                      type="text"
                      value={formatNumberInput(yayasanStisBda)}
                      onChange={(e) => setYayasanStisBda(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Sewa Gedung</label>
                    <input
                      type="text"
                      value={formatNumberInput(sewaGedung)}
                      onChange={(e) => setSewaGedung(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Operasional Kunci Sarjana</label>
                    <input
                      type="text"
                      value={formatNumberInput(operasionalKunciSarjana)}
                      onChange={(e) => setOperasionalKunciSarjana(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Gaji</label>
                    <input
                      type="text"
                      value={formatNumberInput(gaji)}
                      onChange={(e) => setGaji(parseNumberInput(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg flex justify-between items-center font-medium ${remaining < 0 ? 'bg-red-100 text-red-700' : remaining > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  <span>Sisa Belum Dialokasikan:</span>
                  <span>{formatCurrency(remaining)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Alokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Tambah Pembayaran Mahasiswa */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingPaymentId ? 'Edit Pembayaran Mahasiswa' : 'Tambah Pembayaran Mahasiswa'}</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">✕</button>
            </div>
            
            <form onSubmit={handleSaveStudentPayment} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={paymentStudentName}
                    onChange={(e) => setPaymentStudentName(e.target.value)}
                    placeholder="Nama lengkap mahasiswa"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kampus Tujuan Setor</label>
                  <select
                    required
                    value={paymentKampus}
                    onChange={(e) => setPaymentKampus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kampus</option>
                    {settings.adminOptions?.PERGURUAN_TINGGI?.map((pt, i) => (
                      <option key={`${pt}-${i}`} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Total Setor (Rp)</label>
                  <input
                    type="text"
                    required
                    value={formatNumberInput(paymentTotalSetor)}
                    onChange={(e) => setPaymentTotalSetor(parseNumberInput(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Total Tagih (Rp)</label>
                  <input
                    type="text"
                    required
                    value={formatNumberInput(paymentTotalTagih)}
                    onChange={(e) => handlePaymentTotalTagihChange(parseNumberInput(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status Tagihan</label>
                  <select
                    required
                    value={paymentStatusTagihan}
                    onChange={(e) => setPaymentStatusTagihan(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Status</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="Cicilan">Cicilan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sudah Bayar (Rp)</label>
                  <input
                    type="text"
                    required
                    value={formatNumberInput(paymentSudahBayar)}
                    onChange={(e) => handlePaymentSudahBayarChange(parseNumberInput(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sisa Tagihan (Rp)</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formatNumberInput(paymentSisaTagihan)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Ket. Berkas</label>
                  <input
                    type="text"
                    required
                    value={paymentKetBerkas}
                    onChange={(e) => setPaymentKetBerkas(e.target.value)}
                    placeholder="Contoh: Lengkap / Menyusul"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Catatan Keuangan</label>
                  <input
                    type="text"
                    required
                    value={paymentCatatanKeuangan}
                    onChange={(e) => setPaymentCatatanKeuangan(e.target.value)}
                    placeholder="Catatan..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Periode Pengiriman</label>
                  <input
                    type="text"
                    required
                    value={paymentPeriodePengiriman}
                    onChange={(e) => setPaymentPeriodePengiriman(e.target.value)}
                    placeholder="Contoh: Ganjil 2024/2025"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Loan Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingLoanId ? 'Edit Pinjaman Antar Kas' : 'Catat Pinjaman Antar Kas'}</h2>
              <button onClick={() => setIsLoanModalOpen(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleSaveLoan} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Pinjam</label>
                <input
                  type="date"
                  required
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Peminjam</label>
                <select
                  required
                  value={loanBorrowerKasId}
                  onChange={(e) => setLoanBorrowerKasId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kas Peminjam</option>
                  {allWallets.map(k => (
                    <option key={k.id} value={k.id} disabled={k.id === loanLenderKasId}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kas Pemberi Pinjaman</label>
                <select
                  required
                  value={loanLenderKasId}
                  onChange={(e) => setLoanLenderKasId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kas Pemberi Pinjaman</option>
                  {allWallets.map(k => (
                    <option key={k.id} value={k.id} disabled={k.id === loanBorrowerKasId}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jumlah Pinjaman</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 dark:text-slate-400">Rp</span>
                  <input
                    type="text"
                    required
                    value={formatNumberInput(loanAmount)}
                    onChange={(e) => setLoanAmount(parseNumberInput(e.target.value))}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Keperluan</label>
                <input
                  type="text"
                  required
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  placeholder="Contoh: Keperluan Direksi"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jatuh Tempo (Opsional)</label>
                <input
                  type="date"
                  value={loanDueDate}
                  onChange={(e) => setLoanDueDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button type="button" onClick={() => setIsLoanModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}

function PengaturanFinanceTab() {
  const { settings, updateSettings } = useAppStore();
  const [newKampus, setNewKampus] = useState('');
  const [newFundSource, setNewFundSource] = useState('');
  const [newInternalWallet, setNewInternalWallet] = useState('');

  const fundSources = settings.fundSources || [];
  const internalCashWallets = settings.internalCashWallets || [];

  const handleAddKampus = () => {
    if (newKampus && !settings.campusesReguler.includes(newKampus)) {
      updateSettings({ campusesReguler: [...settings.campusesReguler, newKampus] });
      setNewKampus('');
    }
  };

  const handleDeleteKampus = (kampus: string) => {
    updateSettings({ campusesReguler: settings.campusesReguler.filter(k => k !== kampus) });
  };

  const handleAddFundSource = () => {
    if (newFundSource && !fundSources.find(f => f.name === newFundSource)) {
      const newId = `fs_${Date.now()}`;
      updateSettings({ fundSources: [...fundSources, { id: newId, name: newFundSource }] });
      setNewFundSource('');
    }
  };

  const handleDeleteFundSource = (id: string) => {
    updateSettings({ fundSources: fundSources.filter(f => f.id !== id) });
  };

  const handleAddInternalWallet = () => {
    if (newInternalWallet && !internalCashWallets.find(w => w.name === newInternalWallet)) {
      const newId = `iw_${Date.now()}`;
      updateSettings({ internalCashWallets: [...internalCashWallets, { id: newId, name: newInternalWallet }] });
      setNewInternalWallet('');
    }
  };

  const handleDeleteInternalWallet = (id: string) => {
    updateSettings({ internalCashWallets: internalCashWallets.filter(w => w.id !== id) });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daftar Sumber Dana</h3>
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Nama Sumber Dana (Contoh: Program RPL)" 
            value={newFundSource}
            onChange={e => setNewFundSource(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleAddFundSource}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Nama Sumber Dana</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {fundSources.map((fs) => (
                <tr key={fs.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-3 text-slate-900 dark:text-white">{fs.name}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDeleteFundSource(fs.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daftar Dompet Kas Internal</h3>
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Nama Dompet Kas (Contoh: Kas Gaji)" 
            value={newInternalWallet}
            onChange={e => setNewInternalWallet(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleAddInternalWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Nama Dompet Kas</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {internalCashWallets.map((wallet) => (
                <tr key={wallet.id} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-3 text-slate-900 dark:text-white">{wallet.name}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDeleteInternalWallet(wallet.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daftar Kampus (Kas Setor)</h3>
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Nama Kampus" 
            value={newKampus}
            onChange={e => setNewKampus(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleAddKampus}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah Kampus
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium">Nama Kampus</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {settings.campusesReguler.map((kampus, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-3 text-slate-900 dark:text-white">{kampus}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDeleteKampus(kampus)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

