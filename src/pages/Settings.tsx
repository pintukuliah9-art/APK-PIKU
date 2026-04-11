import React, { useState } from 'react';
import { useAppStore } from '../contexts/AppStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Moon, Sun, Database, Plus, Trash2, CloudUpload, AlertTriangle, Users, User } from 'lucide-react';
import UserManagement from '../components/UserManagement';
import UserProfile from '../components/UserProfile';

export default function Settings() {
  const { settings, updateSettings, migrateDataToFirebase, isSyncing } = useAppStore();
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'tampilan' | 'database' | 'migrasi' | 'pengguna' | 'profil'>('tampilan');
  const [newOption, setNewOption] = useState('');
  const [activeConfig, setActiveConfig] = useState<string>('studyPrograms');
  const [migrationStatus, setMigrationStatus] = useState<{success?: boolean, message?: string} | null>(null);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ ...settings, theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleMigrate = async () => {
    if (window.confirm('Apakah Anda yakin ingin memigrasikan semua data lokal ke Firebase? Ini mungkin memakan waktu beberapa saat.')) {
      setMigrationStatus(null);
      const result = await migrateDataToFirebase();
      setMigrationStatus(result);
    }
  };

  const dbConfigs = [
    { id: 'studyPrograms', label: 'Program Studi' },
    { id: 'JALUR_INPUT', label: 'Jalur Input' },
    { id: 'PERGURUAN_TINGGI', label: 'Perguruan Tinggi' },
    { id: 'KET_DOKUMEN', label: 'Keterangan Dokumen' },
    { id: 'STATUS_BERKAS', label: 'Status Berkas' },
    { id: 'JENIS_KELAMIN', label: 'Jenis Kelamin' },
    { id: 'AGAMA', label: 'Agama' },
    { id: 'STATUS_DATA', label: 'Status Data' },
    { id: 'GELAR_AKADEMIK', label: 'Gelar Akademik' },
    { id: 'STATUS_TAGIHAN', label: 'Status Tagihan' },
    { id: 'KET_BERKAS', label: 'Keterangan Berkas' },
    { id: 'PROGRAM', label: 'Program' },
    { id: 'coordinators', label: 'Koordinator' },
  ];

  const getCurrentOptions = () => {
    if (activeConfig === 'studyPrograms') {
      return settings.studyPrograms || [];
    }
    if (activeConfig === 'coordinators') {
      return settings.coordinators || [];
    }
    return settings.adminOptions?.[activeConfig as keyof typeof settings.adminOptions] || [];
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.trim()) return;

    const currentOptions = getCurrentOptions();
    const newItems = newOption.split('\n').map(item => item.trim()).filter(item => item && !currentOptions.includes(item));

    if (newItems.length === 0) {
      alert('Semua opsi sudah ada atau kosong!');
      return;
    }

    if (activeConfig === 'studyPrograms') {
      updateSettings({
        ...settings,
        studyPrograms: [...currentOptions, ...newItems]
      });
    } else if (activeConfig === 'coordinators') {
      updateSettings({
        ...settings,
        coordinators: [...currentOptions, ...newItems]
      });
    } else {
      updateSettings({
        ...settings,
        adminOptions: {
          ...settings.adminOptions,
          [activeConfig]: [...currentOptions, ...newItems]
        }
      });
    }
    setNewOption('');
  };

  const handleRemoveOption = (optionToRemove: string) => {
    const currentOptions = getCurrentOptions();
    const newOptions = currentOptions.filter(opt => opt !== optionToRemove);

    if (activeConfig === 'studyPrograms') {
      updateSettings({
        ...settings,
        studyPrograms: newOptions
      });
    } else if (activeConfig === 'coordinators') {
      updateSettings({
        ...settings,
        coordinators: newOptions
      });
    } else {
      updateSettings({
        ...settings,
        adminOptions: {
          ...settings.adminOptions,
          [activeConfig]: newOptions
        }
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto dark:text-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pengaturan</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola tampilan dan konfigurasi database aplikasi</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700 flex">
          <button
            onClick={() => setActiveTab('tampilan')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'tampilan' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Tampilan
          </button>
          {userRole === 'super_admin' && (
            <button
              onClick={() => setActiveTab('pengguna')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'pengguna' 
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Users size={16} />
              Pengguna
            </button>
          )}
          {userRole !== 'super_admin' && (
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'profil' 
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <User size={16} />
              Profil
            </button>
          )}
          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'database' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <Database size={16} />
            Database Mahasiswa
          </button>
          {userRole === 'super_admin' && (
            <button
              onClick={() => setActiveTab('migrasi')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'migrasi' 
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <CloudUpload size={16} />
              Migrasi Data
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab === 'tampilan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Tema Aplikasi</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.theme !== 'dark' 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Sun size={24} />
                    <span className="font-medium">Terang (Light)</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.theme === 'dark' 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Moon size={24} />
                    <span className="font-medium">Gelap (Dark)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pilih Kolom</h3>
                {dbConfigs.map(config => (
                  <button
                    key={config.id}
                    onClick={() => setActiveConfig(config.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeConfig === config.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Opsi Dropdown: {dbConfigs.find(c => c.id === activeConfig)?.label}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Tambah atau hapus opsi yang akan muncul pada dropdown form administrasi mahasiswa.
                  </p>
                </div>

                <form onSubmit={handleAddOption} className="flex flex-col gap-3 mb-6">
                  <textarea
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Ketik opsi baru... (Bisa paste banyak baris sekaligus untuk input massal)"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newOption.trim()}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                    >
                      <Plus size={18} />
                      Tambah Opsi
                    </button>
                  </div>
                </form>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {getCurrentOptions().length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 italic">
                      Belum ada opsi untuk kolom ini.
                    </div>
                  ) : (
                    getCurrentOptions().map((option, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-white dark:bg-slate-900 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300 dark:text-slate-200">{option}</span>
                        <button
                          onClick={() => handleRemoveOption(option)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus Opsi"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pengguna' && userRole === 'super_admin' && (
            <UserManagement />
          )}

          {activeTab === 'profil' && userRole !== 'super_admin' && (
            <UserProfile />
          )}

          {activeTab === 'migrasi' && userRole === 'super_admin' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4">
                <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Peringatan Migrasi Data</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Fitur ini akan mengunggah semua data yang tersimpan di browser Anda (termasuk yang disinkronkan dari Google Sheets) ke database Firebase. Lakukan ini hanya sekali saat pertama kali beralih ke Firebase untuk menghindari duplikasi data.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Mulai Migrasi</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Pastikan Anda memiliki koneksi internet yang stabil sebelum memulai proses migrasi.
                </p>

                <button
                  onClick={handleMigrate}
                  disabled={isSyncing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors w-full justify-center"
                >
                  <CloudUpload size={20} />
                  {isSyncing ? 'Sedang Memigrasikan Data...' : 'Migrasikan Semua Data ke Firebase'}
                </button>

                {migrationStatus && (
                  <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${
                    migrationStatus.success 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {migrationStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
