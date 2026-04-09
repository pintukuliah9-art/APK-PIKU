import React, { useState } from 'react';
import { FileText, Archive, Mail, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { Surat, Inventaris } from '../../types/app';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function AdminDashboard() {
  const { suratList, inventarisList, addSurat, updateSurat, deleteSurat, addInventaris, updateInventaris, deleteInventaris } = useAppStore();
  const [activeTab, setActiveTab] = useState<'surat' | 'inventaris' | 'pengaturan'>('surat');
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

  // Surat State
  const [showSuratModal, setShowSuratModal] = useState(false);
  const [editingSurat, setEditingSurat] = useState<Surat | null>(null);
  const [suratForm, setSuratForm] = useState<Partial<Surat>>({
    jenis: 'Masuk',
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().split('T')[0],
    pengirimPenerima: '',
    perihal: '',
    keterangan: '',
  });

  // Inventaris State
  const [showInventarisModal, setShowInventarisModal] = useState(false);
  const [editingInventaris, setEditingInventaris] = useState<Inventaris | null>(null);
  const [inventarisForm, setInventarisForm] = useState<Partial<Inventaris>>({
    kodeBarang: '',
    namaBarang: '',
    kategori: '',
    jumlah: 1,
    kondisi: 'Baik',
    lokasi: '',
    keterangan: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
  });

  // Derived Data
  const currentMonth = new Date().toISOString().slice(0, 7);
  const suratMasukBulanIni = suratList.filter(s => s.jenis === 'Masuk' && s.tanggalSurat.startsWith(currentMonth)).length;
  const suratKeluarBulanIni = suratList.filter(s => s.jenis === 'Keluar' && s.tanggalSurat.startsWith(currentMonth)).length;

  const filteredSurat = suratList.filter(s => 
    s.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.pengirimPenerima.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventaris = inventarisList.filter(i => 
    i.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleSuratSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSurat) {
      updateSurat(editingSurat.id, suratForm);
    } else {
      addSurat(suratForm as Omit<Surat, 'id'>);
    }
    setShowSuratModal(false);
    setEditingSurat(null);
    setSuratForm({
      jenis: 'Masuk',
      nomorSurat: '',
      tanggalSurat: new Date().toISOString().split('T')[0],
      pengirimPenerima: '',
      perihal: '',
      keterangan: '',
    });
  };

  const handleInventarisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInventaris) {
      updateInventaris(editingInventaris.id, inventarisForm);
    } else {
      addInventaris(inventarisForm as Omit<Inventaris, 'id'>);
    }
    setShowInventarisModal(false);
    setEditingInventaris(null);
    setInventarisForm({
      kodeBarang: '',
      namaBarang: '',
      kategori: '',
      jumlah: 1,
      kondisi: 'Baik',
      lokasi: '',
      keterangan: '',
      tanggalMasuk: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Administrasi</h1>
        <p className="text-slate-600 dark:text-slate-400 dark:text-blue-200">Manajemen surat menyurat dan inventaris kantor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Mail size={20} className="text-blue-500" />
            Surat Masuk & Keluar
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">Surat Masuk (Bulan Ini)</span>
              <span className="font-bold">{suratMasukBulanIni}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">Surat Keluar (Bulan Ini)</span>
              <span className="font-bold">{suratKeluarBulanIni}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Archive size={20} className="text-orange-500" />
            Inventaris Kantor
          </h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">Total Item</span>
              <span className="font-bold">{inventarisList.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-slate-400">Kondisi Baik</span>
              <span className="font-bold text-green-600">{inventarisList.filter(i => i.kondisi === 'Baik').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('surat')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'surat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Surat Menyurat
            </button>
            <button
              onClick={() => setActiveTab('inventaris')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'inventaris'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              Inventaris
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

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
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
                onClick={() => activeTab === 'surat' ? setShowSuratModal(true) : setShowInventarisModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Tambah {activeTab === 'surat' ? 'Surat' : 'Inventaris'}
              </button>
            )}
          </div>

          {activeTab === 'surat' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 text-sm">
                    <th className="p-4 border-b">Tanggal</th>
                    <th className="p-4 border-b">Jenis</th>
                    <th className="p-4 border-b">No. Surat</th>
                    <th className="p-4 border-b">Pengirim/Penerima</th>
                    <th className="p-4 border-b">Perihal</th>
                    <th className="p-4 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurat.length > 0 ? (
                    filteredSurat.map((surat) => (
                      <tr key={surat.id} className="border-b hover:bg-gray-50 dark:bg-slate-800/50">
                        <td className="p-4">{surat.tanggalSurat}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            surat.jenis === 'Masuk' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {surat.jenis}
                          </span>
                        </td>
                        <td className="p-4">{surat.nomorSurat}</td>
                        <td className="p-4">{surat.pengirimPenerima}</td>
                        <td className="p-4">{surat.perihal}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setEditingSurat(surat);
                              setSuratForm(surat);
                              setShowSuratModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Surat',
                                message: 'Apakah Anda yakin ingin menghapus surat ini?',
                                onConfirm: () => deleteSurat(surat.id)
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
                        Belum ada data surat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'inventaris' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 text-sm">
                    <th className="p-4 border-b">Kode</th>
                    <th className="p-4 border-b">Nama Barang</th>
                    <th className="p-4 border-b">Kategori</th>
                    <th className="p-4 border-b">Jumlah</th>
                    <th className="p-4 border-b">Kondisi</th>
                    <th className="p-4 border-b text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventaris.length > 0 ? (
                    filteredInventaris.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-slate-800/50">
                        <td className="p-4 font-mono text-sm">{item.kodeBarang}</td>
                        <td className="p-4 font-medium">{item.namaBarang}</td>
                        <td className="p-4">{item.kategori}</td>
                        <td className="p-4">{item.jumlah}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.kondisi === 'Baik' ? 'bg-green-100 text-green-800' : 
                            item.kondisi === 'Rusak Ringan' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.kondisi}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setEditingInventaris(item);
                              setInventarisForm(item);
                              setShowInventarisModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Inventaris',
                                message: 'Apakah Anda yakin ingin menghapus inventaris ini?',
                                onConfirm: () => deleteInventaris(item.id)
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
                        Belum ada data inventaris.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'pengaturan' ? (
            <PengaturanAdminTab />
          ) : null}
        </div>
      </div>

      {/* Surat Modal */}
      {showSuratModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingSurat ? 'Edit Surat' : 'Tambah Surat'}
              </h2>
              <button onClick={() => setShowSuratModal(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSuratSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jenis Surat</label>
                <select
                  value={suratForm.jenis}
                  onChange={(e) => setSuratForm({ ...suratForm, jenis: e.target.value as 'Masuk' | 'Keluar' })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Masuk">Surat Masuk</option>
                  <option value="Keluar">Surat Keluar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nomor Surat</label>
                <input
                  type="text"
                  value={suratForm.nomorSurat}
                  onChange={(e) => setSuratForm({ ...suratForm, nomorSurat: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal Surat</label>
                <input
                  type="date"
                  value={suratForm.tanggalSurat}
                  onChange={(e) => setSuratForm({ ...suratForm, tanggalSurat: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Pengirim / Penerima</label>
                <input
                  type="text"
                  value={suratForm.pengirimPenerima}
                  onChange={(e) => setSuratForm({ ...suratForm, pengirimPenerima: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Perihal</label>
                <input
                  type="text"
                  value={suratForm.perihal}
                  onChange={(e) => setSuratForm({ ...suratForm, perihal: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Keterangan</label>
                <textarea
                  value={suratForm.keterangan}
                  onChange={(e) => setSuratForm({ ...suratForm, keterangan: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSuratModal(false)}
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

      {/* Inventaris Modal */}
      {showInventarisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingInventaris ? 'Edit Inventaris' : 'Tambah Inventaris'}
              </h2>
              <button onClick={() => setShowInventarisModal(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleInventarisSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kode Barang</label>
                <input
                  type="text"
                  value={inventarisForm.kodeBarang}
                  onChange={(e) => setInventarisForm({ ...inventarisForm, kodeBarang: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Barang</label>
                <input
                  type="text"
                  value={inventarisForm.namaBarang}
                  onChange={(e) => setInventarisForm({ ...inventarisForm, namaBarang: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={inventarisForm.kategori}
                    onChange={(e) => setInventarisForm({ ...inventarisForm, kategori: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={inventarisForm.jumlah}
                    onChange={(e) => setInventarisForm({ ...inventarisForm, jumlah: e.target.value === '' ? '' as any : Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kondisi</label>
                <select
                  value={inventarisForm.kondisi}
                  onChange={(e) => setInventarisForm({ ...inventarisForm, kondisi: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={inventarisForm.lokasi}
                  onChange={(e) => setInventarisForm({ ...inventarisForm, lokasi: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInventarisModal(false)}
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

function PengaturanAdminTab() {
  const { settings, updateSettings } = useAppStore();
  const [signer, setSigner] = useState(settings.defaultSigner);

  const handleSave = () => {
    updateSettings({ defaultSigner: signer });
    // We can't use alert directly in iframe easily, so we just save
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pengaturan Penandatangan Dokumen</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              value={signer.name}
              onChange={e => setSigner({...signer, name: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jabatan</label>
            <input 
              type="text" 
              value={signer.role}
              onChange={e => setSigner({...signer, role: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kota</label>
            <input 
              type="text" 
              value={signer.city}
              onChange={e => setSigner({...signer, city: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
