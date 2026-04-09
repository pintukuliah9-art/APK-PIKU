import React from 'react';
import { AdminReportData, MailRecap, InventoryItem, NewDataRecap, AttachmentLink } from '../types';
import { Plus, Trash2, FileText, Package, Users, Link as LinkIcon } from 'lucide-react';

interface AdminReportFormProps {
  data: AdminReportData;
  onChange: (data: AdminReportData) => void;
}

export function AdminReportForm({ data, onChange }: AdminReportFormProps) {
  const handleChange = (field: keyof AdminReportData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (parentField: keyof AdminReportData, childField: string, value: any) => {
    onChange({
      ...data,
      [parentField]: {
        ...(data[parentField] as any),
        [childField]: value,
      },
    });
  };

  const handleImageUpload = (field: 'signatureImage' | 'stampImage', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleNestedChange('signature', field, reader.result as string);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateForeword = () => {
    const template = `Laporan administrasi ini disusun sebagai bentuk dokumentasi dan evaluasi pelaksanaan administrasi selama periode ${data.periodeLaporan || '[Periode]'}. Laporan mencakup rekap surat masuk dan keluar, inventaris kantor, serta data baru masuk per program. Dokumen ini diharapkan memudahkan monitoring progres kerja, identifikasi kendala, dan tindak lanjut perbaikan pada periode berikutnya.`;
    handleChange('foreword', template);
  };

  const handleGenerateConclusion = () => {
    const template = `Secara umum, laporan ini memberikan gambaran ringkas mengenai aktivitas administrasi, kondisi inventaris, dan perkembangan data baru masuk pada setiap program selama periode ${data.periodeLaporan || '[Periode]'}. Proses administrasi berjalan dengan baik, namun perlu peningkatan dalam hal [tuliskan evaluasi/hambatan di sini]. Rekomendasi tindak lanjut agar proses administrasi periode berikutnya lebih tertata, cepat, dan akurat.`;
    handleChange('conclusion', template);
  };

  const addAttachment = () => {
    handleChange('attachments', [
      ...(data.attachments || []),
      { unit: 'Pintu Kuliah', jenisLampiran: '', link: '' }
    ]);
  };

  const updateAttachment = (index: number, field: keyof AttachmentLink, value: string) => {
    const newAttachments = [...(data.attachments || [])];
    newAttachments[index] = { ...newAttachments[index], [field]: value };
    handleChange('attachments', newAttachments);
  };

  const removeAttachment = (index: number) => {
    handleChange('attachments', (data.attachments || []).filter((_, i) => i !== index));
  };

  // Mail Recap Handlers
  const addMailRecap = () => {
    handleChange('mailRecaps', [
      ...data.mailRecaps,
      { tanggal: '', jenisSurat: 'Masuk', nomorSurat: '', asalTujuan: '', perihal: '', status: '' }
    ]);
  };

  const updateMailRecap = (index: number, field: keyof MailRecap, value: any) => {
    const newItems = [...data.mailRecaps];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange('mailRecaps', newItems);
  };

  const removeMailRecap = (index: number) => {
    handleChange('mailRecaps', data.mailRecaps.filter((_, i) => i !== index));
  };

  // Inventory Item Handlers
  const addInventoryItem = () => {
    handleChange('inventoryItems', [
      ...data.inventoryItems,
      { namaBarang: '', jumlah: 0, kondisi: '', lokasi: '', keterangan: '' }
    ]);
  };

  const updateInventoryItem = (index: number, field: keyof InventoryItem, value: any) => {
    const newItems = [...data.inventoryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange('inventoryItems', newItems);
  };

  const removeInventoryItem = (index: number) => {
    handleChange('inventoryItems', data.inventoryItems.filter((_, i) => i !== index));
  };

  // New Data Recap Handlers
  const addDataRecap = (type: 'regulerData' | 'rplData' | 'akselerasiData') => {
    handleChange(type, [
      ...(data[type] as NewDataRecap[]),
      { kampus: '', berkasOn: 0, belumOn: 0, revisi: 0, cancel: 0, selesai: 0, jumlahData: 0 }
    ]);
  };

  const updateDataRecap = (type: 'regulerData' | 'rplData' | 'akselerasiData', index: number, field: keyof NewDataRecap, value: any) => {
    const newItems = [...(data[type] as NewDataRecap[])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate jumlahData
    if (['berkasOn', 'belumOn', 'revisi', 'cancel', 'selesai'].includes(field)) {
      newItems[index].jumlahData = 
        (Number(newItems[index].berkasOn) || 0) + 
        (Number(newItems[index].belumOn) || 0) + 
        (Number(newItems[index].revisi) || 0) + 
        (Number(newItems[index].cancel) || 0) +
        (Number(newItems[index].selesai) || 0);
    }
    
    handleChange(type, newItems);
  };

  const removeDataRecap = (type: 'regulerData' | 'rplData' | 'akselerasiData', index: number) => {
    handleChange(type, (data[type] as NewDataRecap[]).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informasi Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Laporan</label>
            <input
              type="text"
              value={data.periodeLaporan}
              onChange={(e) => handleChange('periodeLaporan', e.target.value)}
              placeholder="Contoh: Februari 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIC Administrasi</label>
            <input
              type="text"
              value={data.picAdministrasi}
              onChange={(e) => handleChange('picAdministrasi', e.target.value)}
              placeholder="Nama PIC"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Kata Pengantar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Kata Pengantar</h3>
          <button
            onClick={handleGenerateForeword}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
          >
            Buat Template
          </button>
        </div>
        <textarea
          value={data.foreword}
          onChange={(e) => handleChange('foreword', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Tulis kata pengantar laporan..."
        />
      </div>

      {/* A. Rekap Surat Masuk dan Keluar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            A. Rekap Surat Masuk dan Keluar
          </h3>
          <button
            onClick={addMailRecap}
            className="flex items-center gap-1 text-sm px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <Plus size={16} /> Tambah Surat
          </button>
        </div>
        
        <div className="space-y-4">
          {data.mailRecaps.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
              <button
                onClick={() => removeMailRecap(index)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={item.tanggal}
                    onChange={(e) => updateMailRecap(index, 'tanggal', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Surat</label>
                  <select
                    value={item.jenisSurat}
                    onChange={(e) => updateMailRecap(index, 'jenisSurat', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Masuk">Masuk</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Surat</label>
                  <input
                    type="text"
                    value={item.nomorSurat}
                    onChange={(e) => updateMailRecap(index, 'nomorSurat', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Asal/Tujuan</label>
                  <input
                    type="text"
                    value={item.asalTujuan}
                    onChange={(e) => updateMailRecap(index, 'asalTujuan', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Perihal</label>
                  <input
                    type="text"
                    value={item.perihal}
                    onChange={(e) => updateMailRecap(index, 'perihal', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <input
                    type="text"
                    value={item.status}
                    onChange={(e) => updateMailRecap(index, 'status', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {data.mailRecaps.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              Belum ada data surat. Klik "Tambah Surat" untuk memulai.
            </div>
          )}
        </div>
      </div>

      {/* B. Inventaris Kantor */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            B. Inventaris Kantor
          </h3>
          <button
            onClick={addInventoryItem}
            className="flex items-center gap-1 text-sm px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <Plus size={16} /> Tambah Barang
          </button>
        </div>
        
        <div className="space-y-4">
          {data.inventoryItems.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
              <button
                onClick={() => removeInventoryItem(index)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Barang</label>
                  <input
                    type="text"
                    value={item.namaBarang}
                    onChange={(e) => updateInventoryItem(index, 'namaBarang', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah</label>
                  <input
                    type="number"
                    value={item.jumlah}
                    onChange={(e) => updateInventoryItem(index, 'jumlah', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kondisi</label>
                  <input
                    type="text"
                    value={item.kondisi}
                    onChange={(e) => updateInventoryItem(index, 'kondisi', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={item.lokasi}
                    onChange={(e) => updateInventoryItem(index, 'lokasi', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={item.keterangan}
                    onChange={(e) => updateInventoryItem(index, 'keterangan', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {data.inventoryItems.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              Belum ada data inventaris. Klik "Tambah Barang" untuk memulai.
            </div>
          )}
        </div>
      </div>

      {/* C, D, E. Rekap Data Baru Masuk */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Rekap Data Baru Masuk per Bulan
          </h3>
        </div>

        {/* C. Program Reguler */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700">C. Program Reguler</h4>
            <button
              onClick={() => addDataRecap('regulerData')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            >
              <Plus size={14} /> Tambah Kampus
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 border">Kampus</th>
                  <th className="px-3 py-2 border text-center">Berkas On</th>
                  <th className="px-3 py-2 border text-center">Belum On</th>
                  <th className="px-3 py-2 border text-center">Revisi</th>
                  <th className="px-3 py-2 border text-center">Cancel</th>
                  <th className="px-3 py-2 border text-center">Selesai</th>
                  <th className="px-3 py-2 border text-center bg-blue-50">Jumlah</th>
                  <th className="px-3 py-2 border w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.regulerData.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-1">
                      <input type="text" value={item.kampus} onChange={(e) => updateDataRecap('regulerData', index, 'kampus', e.target.value)} className="w-full px-2 py-1 outline-none" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.berkasOn} onChange={(e) => updateDataRecap('regulerData', index, 'berkasOn', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.belumOn} onChange={(e) => updateDataRecap('regulerData', index, 'belumOn', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.revisi} onChange={(e) => updateDataRecap('regulerData', index, 'revisi', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.cancel} onChange={(e) => updateDataRecap('regulerData', index, 'cancel', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.selesai || 0} onChange={(e) => updateDataRecap('regulerData', index, 'selesai', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1 text-center font-medium bg-blue-50">{item.jumlahData}</td>
                    <td className="border p-1 text-center">
                      <button onClick={() => removeDataRecap('regulerData', index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* D. Program RPL */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700">D. Program RPL</h4>
            <button
              onClick={() => addDataRecap('rplData')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            >
              <Plus size={14} /> Tambah Kampus
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 border">Kampus</th>
                  <th className="px-3 py-2 border text-center">Berkas On</th>
                  <th className="px-3 py-2 border text-center">Belum On</th>
                  <th className="px-3 py-2 border text-center">Revisi</th>
                  <th className="px-3 py-2 border text-center">Cancel</th>
                  <th className="px-3 py-2 border text-center">Selesai</th>
                  <th className="px-3 py-2 border text-center bg-blue-50">Jumlah</th>
                  <th className="px-3 py-2 border w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.rplData.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-1">
                      <input type="text" value={item.kampus} onChange={(e) => updateDataRecap('rplData', index, 'kampus', e.target.value)} className="w-full px-2 py-1 outline-none" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.berkasOn} onChange={(e) => updateDataRecap('rplData', index, 'berkasOn', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.belumOn} onChange={(e) => updateDataRecap('rplData', index, 'belumOn', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.revisi} onChange={(e) => updateDataRecap('rplData', index, 'revisi', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.cancel} onChange={(e) => updateDataRecap('rplData', index, 'cancel', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.selesai || 0} onChange={(e) => updateDataRecap('rplData', index, 'selesai', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1 text-center font-medium bg-blue-50">{item.jumlahData}</td>
                    <td className="border p-1 text-center">
                      <button onClick={() => removeDataRecap('rplData', index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* E. Program Akselerasi */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700">E. Program Akselerasi</h4>
            <button
              onClick={() => addDataRecap('akselerasiData')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            >
              <Plus size={14} /> Tambah Kampus
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 border">Kampus</th>
                  <th className="px-3 py-2 border text-center">Berkas On</th>
                  <th className="px-3 py-2 border text-center">Belum On</th>
                  <th className="px-3 py-2 border text-center">Revisi</th>
                  <th className="px-3 py-2 border text-center">Cancel</th>
                  <th className="px-3 py-2 border text-center">Selesai</th>
                  <th className="px-3 py-2 border text-center bg-blue-50">Jumlah</th>
                  <th className="px-3 py-2 border w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.akselerasiData.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-1">
                      <input type="text" value={item.kampus} onChange={(e) => updateDataRecap('akselerasiData', index, 'kampus', e.target.value)} className="w-full px-2 py-1 outline-none" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.berkasOn} onChange={(e) => updateDataRecap('akselerasiData', index, 'berkasOn', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.belumOn} onChange={(e) => updateDataRecap('akselerasiData', index, 'belumOn', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.revisi} onChange={(e) => updateDataRecap('akselerasiData', index, 'revisi', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.cancel} onChange={(e) => updateDataRecap('akselerasiData', index, 'cancel', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1">
                      <input type="number" value={item.selesai || 0} onChange={(e) => updateDataRecap('akselerasiData', index, 'selesai', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 outline-none text-center" />
                    </td>
                    <td className="border p-1 text-center font-medium bg-blue-50">{item.jumlahData}</td>
                    <td className="border p-1 text-center">
                      <button onClick={() => removeDataRecap('akselerasiData', index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lampiran Link */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
            Lampiran Link
          </h2>
          <button
            onClick={addAttachment}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah Lampiran
          </button>
        </div>

        <div className="space-y-4">
          {(data.attachments || []).map((item, index) => (
            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                  <select
                    value={item.unit}
                    onChange={(e) => updateAttachment(index, 'unit', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="Pintu Kuliah">Pintu Kuliah</option>
                    <option value="Kunci Sarjana">Kunci Sarjana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Lampiran</label>
                  <input
                    type="text"
                    value={item.jenisLampiran}
                    onChange={(e) => updateAttachment(index, 'jenisLampiran', e.target.value)}
                    placeholder="Contoh: Rekap In/Out Kas Reguler"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => updateAttachment(index, 'link', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md mt-5"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {(!data.attachments || data.attachments.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada lampiran. Klik "Tambah Lampiran" untuk memulai.</p>
          )}
        </div>
      </section>

      {/* Kesimpulan */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Kesimpulan</h3>
          <button
            onClick={handleGenerateConclusion}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
          >
            Buat Kesimpulan Otomatis
          </button>
        </div>
        <textarea
          value={data.conclusion}
          onChange={(e) => handleChange('conclusion', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Tulis kesimpulan laporan..."
        />
      </div>

      {/* Tanda Tangan */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Tanda Tangan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
            <input
              type="text"
              value={data.signature.city}
              onChange={(e) => handleNestedChange('signature', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="text"
              value={data.signature.date}
              onChange={(e) => handleNestedChange('signature', 'date', e.target.value)}
              placeholder="Contoh: 31 Maret 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <input
              type="text"
              value={data.signature.role}
              onChange={(e) => handleNestedChange('signature', 'role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={data.signature.name}
              onChange={(e) => handleNestedChange('signature', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Tanda Tangan (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload('signatureImage', e.target.files[0]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            {data.signature.signatureImage && (
              <div className="mt-2 relative inline-block">
                <img src={data.signature.signatureImage} alt="Signature" className="h-16 object-contain border border-gray-200 rounded p-1" />
                <button 
                  onClick={() => handleNestedChange('signature', 'signatureImage', undefined)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Stempel (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload('stampImage', e.target.files[0]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            {data.signature.stampImage && (
              <div className="mt-2 relative inline-block">
                <img src={data.signature.stampImage} alt="Stamp" className="h-16 object-contain border border-gray-200 rounded p-1" />
                <button 
                  onClick={() => handleNestedChange('signature', 'stampImage', undefined)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
