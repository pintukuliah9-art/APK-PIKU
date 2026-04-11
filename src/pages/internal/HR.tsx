import React, { useState } from 'react';
import { Users, UserCheck, Clock, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../contexts/AppStoreContext';
import { Employee, Attendance, LeaveRequest } from '../../types/app';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function HRDashboard() {
  const { 
    employees, attendances, leaveRequests, 
    addEmployee, updateEmployee, deleteEmployee,
    addAttendance, updateAttendance, deleteAttendance,
    addLeaveRequest, updateLeaveRequest, deleteLeaveRequest
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'karyawan' | 'absensi' | 'cuti' | 'pengaturan'>('karyawan');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Employee State
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<Partial<Employee>>({
    nik: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    jabatan: '',
    departemen: '',
    tanggalBergabung: new Date().toISOString().split('T')[0],
    statusKaryawan: 'Tetap',
    status: 'Aktif',
    noHp: '',
    email: '',
    kontakDarurat: '',
    sisaCuti: 12,
    gajiPokok: 0,
    rekeningBank: '',
  });

  // Attendance State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [attendanceForm, setAttendanceForm] = useState<Partial<Attendance>>({
    employeeId: '',
    tanggal: new Date().toISOString().split('T')[0],
    status: 'Hadir',
    jamMasuk: '08:00',
    jamKeluar: '17:00',
    lemburMulai: '',
    lemburSelesai: '',
    keterlambatanMenit: 0,
    keterangan: '',
  });

  // Leave Request State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [leaveForm, setLeaveForm] = useState<Partial<LeaveRequest>>({
    employeeId: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
    jumlahHari: 1,
    jenisCuti: 'Tahunan',
    alasan: '',
    status: 'Menunggu',
    catatanHR: '',
  });

  // Derived Data
  const today = new Date().toISOString().split('T')[0];
  const activeEmployeesCount = employees.filter(e => e.status === 'Aktif').length;
  const presentTodayCount = attendances.filter(a => a.tanggal === today && a.status === 'Hadir').length;
  const leaveTodayCount = attendances.filter(a => a.tanggal === today && (a.status === 'Cuti' || a.status === 'Izin' || a.status === 'Sakit')).length;

  const filteredEmployees = employees.filter(e => 
    e.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendances = attendances.filter(a => {
    const employee = employees.find(e => e.id === a.employeeId);
    return employee?.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
           a.tanggal.includes(searchTerm);
  }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const filteredLeaves = leaveRequests.filter(l => {
    const employee = employees.find(e => e.id === l.employeeId);
    return employee?.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.tanggalMulai).getTime() - new Date(a.tanggalMulai).getTime());

  // Handlers
  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeForm);
    } else {
      addEmployee(employeeForm as Omit<Employee, 'id'>);
    }
    setShowEmployeeModal(false);
    setEditingEmployee(null);
    setEmployeeForm({
      nik: '',
      namaLengkap: '',
      tempatLahir: '',
      tanggalLahir: '',
      alamat: '',
      jabatan: '',
      departemen: '',
      tanggalBergabung: new Date().toISOString().split('T')[0],
      statusKaryawan: 'Tetap',
      status: 'Aktif',
      noHp: '',
      email: '',
      kontakDarurat: '',
      sisaCuti: 12,
      gajiPokok: 0,
      rekeningBank: '',
    });
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAttendance) {
      updateAttendance(editingAttendance.id, attendanceForm);
    } else {
      addAttendance(attendanceForm as Omit<Attendance, 'id'>);
    }
    setShowAttendanceModal(false);
    setEditingAttendance(null);
    setAttendanceForm({
      employeeId: '',
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Hadir',
      jamMasuk: '08:00',
      jamKeluar: '17:00',
      lemburMulai: '',
      lemburSelesai: '',
      keterlambatanMenit: 0,
      keterangan: '',
    });
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLeave) {
      updateLeaveRequest(editingLeave.id, leaveForm);
    } else {
      addLeaveRequest(leaveForm as Omit<LeaveRequest, 'id'>);
    }
    setShowLeaveModal(false);
    setEditingLeave(null);
    setLeaveForm({
      employeeId: '',
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date().toISOString().split('T')[0],
      jumlahHari: 1,
      jenisCuti: 'Tahunan',
      alasan: '',
      status: 'Menunggu',
      catatanHR: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard SDM (HR)</h1>
          <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200 mt-1">Manajemen karyawan, absensi, dan cuti.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Karyawan Aktif</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeEmployeesCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Hadir Hari Ini</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{presentTodayCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Izin / Cuti Hari Ini</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{leaveTodayCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('karyawan')}
              className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'karyawan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Data Karyawan
            </button>
            <button
              onClick={() => setActiveTab('absensi')}
              className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'absensi'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Absensi
            </button>
            <button
              onClick={() => setActiveTab('cuti')}
              className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'cuti'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Pengajuan Cuti
            </button>
            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'pengaturan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Pengaturan
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {activeTab !== 'pengaturan' && (
              <button
                onClick={() => {
                  if (activeTab === 'karyawan') setShowEmployeeModal(true);
                  else if (activeTab === 'absensi') setShowAttendanceModal(true);
                  else setShowLeaveModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto justify-center"
              >
                <Plus size={20} />
                Tambah {activeTab === 'karyawan' ? 'Karyawan' : activeTab === 'absensi' ? 'Absensi' : 'Cuti'}
              </button>
            )}
          </div>

          {activeTab === 'karyawan' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 text-sm">
                    <th className="p-4 border-b">NIK</th>
                    <th className="p-4 border-b">Nama Lengkap</th>
                    <th className="p-4 border-b">Jabatan</th>
                    <th className="p-4 border-b">Departemen</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50 dark:bg-slate-800/50">
                        <td className="p-4 font-mono text-sm">{employee.nik}</td>
                        <td className="p-4 font-medium">{employee.namaLengkap}</td>
                        <td className="p-4">{employee.jabatan}</td>
                        <td className="p-4">{employee.departemen}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setEditingEmployee(employee);
                              setEmployeeForm(employee);
                              setShowEmployeeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Karyawan',
                                message: 'Apakah Anda yakin ingin menghapus karyawan ini?',
                                onConfirm: () => deleteEmployee(employee.id)
                              });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Belum ada data karyawan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'absensi' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 text-sm">
                    <th className="p-4 border-b">Tanggal</th>
                    <th className="p-4 border-b">Nama Karyawan</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b">Jam Masuk</th>
                    <th className="p-4 border-b">Jam Keluar</th>
                    <th className="p-4 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendances.length > 0 ? (
                    filteredAttendances.map((attendance) => {
                      const employee = employees.find(e => e.id === attendance.employeeId);
                      return (
                        <tr key={attendance.id} className="border-b hover:bg-gray-50 dark:bg-slate-800/50">
                          <td className="p-4">{attendance.tanggal}</td>
                          <td className="p-4 font-medium">{employee?.namaLengkap || 'Unknown'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendance.status === 'Hadir' ? 'bg-green-100 text-green-800' : 
                              attendance.status === 'Izin' || attendance.status === 'Sakit' ? 'bg-yellow-100 text-yellow-800' :
                              attendance.status === 'Cuti' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {attendance.status}
                            </span>
                          </td>
                          <td className="p-4">{attendance.jamMasuk || '-'}</td>
                          <td className="p-4">{attendance.jamKeluar || '-'}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setEditingAttendance(attendance);
                                setAttendanceForm(attendance);
                                setShowAttendanceModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Hapus Absensi',
                                  message: 'Apakah Anda yakin ingin menghapus absensi ini?',
                                  onConfirm: () => deleteAttendance(attendance.id)
                                });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Belum ada data absensi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cuti' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 text-sm">
                    <th className="p-4 border-b">Nama Karyawan</th>
                    <th className="p-4 border-b">Jenis Cuti</th>
                    <th className="p-4 border-b">Tanggal Mulai</th>
                    <th className="p-4 border-b">Tanggal Selesai</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => {
                      const employee = employees.find(e => e.id === leave.employeeId);
                      return (
                        <tr key={leave.id} className="border-b hover:bg-gray-50 dark:bg-slate-800/50">
                          <td className="p-4 font-medium">{employee?.namaLengkap || 'Unknown'}</td>
                          <td className="p-4">{leave.jenisCuti}</td>
                          <td className="p-4">{leave.tanggalMulai}</td>
                          <td className="p-4">{leave.tanggalSelesai}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              leave.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 
                              leave.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setEditingLeave(leave);
                                setLeaveForm(leave);
                                setShowLeaveModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Hapus Pengajuan Cuti',
                                  message: 'Apakah Anda yakin ingin menghapus pengajuan cuti ini?',
                                  onConfirm: () => deleteLeaveRequest(leave.id)
                                });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Belum ada data pengajuan cuti.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'pengaturan' && (
            <PengaturanHRTab />
          )}
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h2 className="text-xl font-bold">
                {editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan'}
              </h2>
              <button onClick={() => setShowEmployeeModal(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">NIK</label>
                  <input
                    type="text"
                    value={employeeForm.nik}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, nik: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={employeeForm.namaLengkap}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, namaLengkap: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={employeeForm.tempatLahir || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, tempatLahir: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={employeeForm.tanggalLahir || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, tanggalLahir: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Alamat</label>
                <textarea
                  value={employeeForm.alamat || ''}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, alamat: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={employeeForm.jabatan}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, jabatan: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Departemen</label>
                  <input
                    type="text"
                    value={employeeForm.departemen}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, departemen: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Bergabung</label>
                  <input
                    type="date"
                    value={employeeForm.tanggalBergabung}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, tanggalBergabung: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status Karyawan</label>
                  <select
                    value={employeeForm.statusKaryawan || 'Tetap'}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, statusKaryawan: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Magang">Magang</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status Aktif</label>
                  <select
                    value={employeeForm.status}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as 'Aktif' | 'Non-Aktif' })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sisa Cuti (Hari)</label>
                  <input
                    type="number"
                    value={employeeForm.sisaCuti}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, sisaCuti: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">No. HP</label>
                  <input
                    type="tel"
                    value={employeeForm.noHp}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, noHp: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kontak Darurat</label>
                  <input
                    type="tel"
                    value={employeeForm.kontakDarurat || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, kontakDarurat: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rekening Bank</label>
                  <input
                    type="text"
                    value={employeeForm.rekeningBank || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, rekeningBank: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: BCA 1234567890 a/n Nama"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Gaji Pokok (Rp)</label>
                <input
                  type="number"
                  value={employeeForm.gajiPokok}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, gajiPokok: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-slate-900 dark:text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h2 className="text-xl font-bold">
                {editingAttendance ? 'Edit Absensi' : 'Tambah Absensi'}
              </h2>
              <button onClick={() => setShowAttendanceModal(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAttendanceSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Karyawan</label>
                <select
                  value={attendanceForm.employeeId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, employeeId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Karyawan</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.namaLengkap}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={attendanceForm.tanggal}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, tanggal: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>
              {attendanceForm.status === 'Hadir' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jam Masuk</label>
                      <input
                        type="time"
                        value={attendanceForm.jamMasuk}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, jamMasuk: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jam Keluar</label>
                      <input
                        type="time"
                        value={attendanceForm.jamKeluar}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, jamKeluar: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Lembur Mulai</label>
                      <input
                        type="time"
                        value={attendanceForm.lemburMulai || ''}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, lemburMulai: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Lembur Selesai</label>
                      <input
                        type="time"
                        value={attendanceForm.lemburSelesai || ''}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, lemburSelesai: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Keterlambatan (Menit)</label>
                    <input
                      type="number"
                      value={attendanceForm.keterlambatanMenit}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, keterlambatanMenit: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Keterangan</label>
                <textarea
                  value={attendanceForm.keterangan || ''}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, keterangan: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-slate-900 dark:text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h2 className="text-xl font-bold">
                {editingLeave ? 'Edit Pengajuan Cuti' : 'Tambah Pengajuan Cuti'}
              </h2>
              <button onClick={() => setShowLeaveModal(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Karyawan</label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Karyawan</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.namaLengkap}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jenis Cuti</label>
                <select
                  value={leaveForm.jenisCuti}
                  onChange={(e) => setLeaveForm({ ...leaveForm, jenisCuti: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Tahunan">Tahunan</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Melahirkan">Melahirkan</option>
                  <option value="Penting">Penting</option>
                  <option value="Menikah">Menikah</option>
                  <option value="Berduka">Berduka</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={leaveForm.tanggalMulai}
                    onChange={(e) => setLeaveForm({ ...leaveForm, tanggalMulai: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={leaveForm.tanggalSelesai}
                    onChange={(e) => setLeaveForm({ ...leaveForm, tanggalSelesai: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jumlah Hari</label>
                <input
                  type="number"
                  value={leaveForm.jumlahHari}
                  onChange={(e) => setLeaveForm({ ...leaveForm, jumlahHari: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Alasan</label>
                <textarea
                  value={leaveForm.alasan}
                  onChange={(e) => setLeaveForm({ ...leaveForm, alasan: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Catatan HR</label>
                <textarea
                  value={leaveForm.catatanHR || ''}
                  onChange={(e) => setLeaveForm({ ...leaveForm, catatanHR: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Catatan internal HR (opsional)"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={leaveForm.status}
                  onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-slate-900 dark:text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
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

function PengaturanHRTab() {
  const { settings, updateSettings } = useAppStore();
  const [newJabatan, setNewJabatan] = useState('');
  const [newDepartemen, setNewDepartemen] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleAddJabatan = () => {
    if (!newJabatan.trim()) return;
    const current = settings.hrJabatan || [];
    if (!current.includes(newJabatan.trim())) {
      updateSettings({ hrJabatan: [...current, newJabatan.trim()] });
    }
    setNewJabatan('');
  };

  const handleDeleteJabatan = (item: string) => {
    const current = settings.hrJabatan || [];
    updateSettings({ hrJabatan: current.filter(i => i !== item) });
  };

  const handleAddDepartemen = () => {
    if (!newDepartemen.trim()) return;
    const current = settings.hrDepartemen || [];
    if (!current.includes(newDepartemen.trim())) {
      updateSettings({ hrDepartemen: [...current, newDepartemen.trim()] });
    }
    setNewDepartemen('');
  };

  const handleDeleteDepartemen = (item: string) => {
    const current = settings.hrDepartemen || [];
    updateSettings({ hrDepartemen: current.filter(i => i !== item) });
  };

  const handleAddStatus = () => {
    if (!newStatus.trim()) return;
    const current = settings.hrStatusKaryawan || [];
    if (!current.includes(newStatus.trim())) {
      updateSettings({ hrStatusKaryawan: [...current, newStatus.trim()] });
    }
    setNewStatus('');
  };

  const handleDeleteStatus = (item: string) => {
    const current = settings.hrStatusKaryawan || [];
    updateSettings({ hrStatusKaryawan: current.filter(i => i !== item) });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Jabatan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daftar Jabatan</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newJabatan}
              onChange={e => setNewJabatan(e.target.value)}
              placeholder="Tambah jabatan..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAddJabatan()}
            />
            <button
              onClick={handleAddJabatan}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.hrJabatan || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDeleteJabatan(item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(!settings.hrJabatan || settings.hrJabatan.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data jabatan</p>
            )}
          </div>
        </div>

        {/* Departemen */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daftar Departemen</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newDepartemen}
              onChange={e => setNewDepartemen(e.target.value)}
              placeholder="Tambah departemen..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAddDepartemen()}
            />
            <button
              onClick={handleAddDepartemen}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.hrDepartemen || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDeleteDepartemen(item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(!settings.hrDepartemen || settings.hrDepartemen.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data departemen</p>
            )}
          </div>
        </div>

        {/* Status Karyawan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Status Karyawan</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              placeholder="Tambah status..."
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAddStatus()}
            />
            <button
              onClick={handleAddStatus}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(settings.hrStatusKaryawan || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                <button
                  onClick={() => handleDeleteStatus(item)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(!settings.hrStatusKaryawan || settings.hrStatusKaryawan.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data status</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
