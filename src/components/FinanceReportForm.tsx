import React from 'react';
import { FinanceReportData, BalanceItem, AttachmentLink } from '../types';
import { Plus, Trash2, Link as LinkIcon, DollarSign } from 'lucide-react';

interface FinanceReportFormProps {
  data: FinanceReportData;
  onChange: (data: FinanceReportData) => void;
}

export function FinanceReportForm({ data, onChange }: FinanceReportFormProps) {
  const handleChange = (field: keyof FinanceReportData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (parentField: keyof FinanceReportData, childField: string, value: any) => {
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

  const addBalanceItem = (section: 'pintuKuliah' | 'kunciSarjana', type: 'asetLancar' | 'asetTetap' | 'kewajiban' | 'ekuitas') => {
    const newItems = [...data[section][type], { uraian: '', nominal: 0 }];
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [type]: newItems
      }
    });
  };

  const updateBalanceItem = (section: 'pintuKuliah' | 'kunciSarjana', type: 'asetLancar' | 'asetTetap' | 'kewajiban' | 'ekuitas', index: number, field: keyof BalanceItem, value: any) => {
    const newItems = [...data[section][type]];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [type]: newItems
      }
    });
  };

  const removeBalanceItem = (section: 'pintuKuliah' | 'kunciSarjana', type: 'asetLancar' | 'asetTetap' | 'kewajiban' | 'ekuitas', index: number) => {
    const newItems = data[section][type].filter((_, i) => i !== index);
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [type]: newItems
      }
    });
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

  const renderBalanceSection = (title: string, section: 'pintuKuliah' | 'kunciSarjana', type: 'asetLancar' | 'asetTetap' | 'kewajiban' | 'ekuitas') => (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-700">{title}</h4>
        <button
          onClick={() => addBalanceItem(section, type)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Tambah Item
        </button>
      </div>
      
      {data[section][type].length > 0 ? (
        <div className="space-y-3">
          {data[section][type].map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.uraian}
                  onChange={(e) => updateBalanceItem(section, type, index, 'uraian', e.target.value)}
                  placeholder="Uraian"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    value={item.nominal || ''}
                    onChange={(e) => updateBalanceItem(section, type, index, 'nominal', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => removeBalanceItem(section, type, index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Belum ada data. Klik "Tambah Item" untuk memulai.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Informasi Umum */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Informasi Umum
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Laporan</label>
            <input
              type="text"
              value={data.periodeLaporan}
              onChange={(e) => handleChange('periodeLaporan', e.target.value)}
              placeholder="Contoh: Maret 2026"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select
                value={data.month}
                onChange={(e) => handleChange('month', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <input
                type="text"
                value={data.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Neraca Pintu Kuliah */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Neraca Keuangan - Pintu Kuliah
        </h2>
        
        <div className="space-y-6">
          <h3 className="text-md font-medium text-gray-800 border-b pb-2">1. ASET</h3>
          {renderBalanceSection('Aset Lancar', 'pintuKuliah', 'asetLancar')}
          {renderBalanceSection('Aset Tetap', 'pintuKuliah', 'asetTetap')}
          
          <h3 className="text-md font-medium text-gray-800 border-b pb-2 mt-8">2. KEWAJIBAN</h3>
          {renderBalanceSection('Kewajiban', 'pintuKuliah', 'kewajiban')}
          
          <h3 className="text-md font-medium text-gray-800 border-b pb-2 mt-8">3. EKUITAS</h3>
          {renderBalanceSection('Ekuitas', 'pintuKuliah', 'ekuitas')}
        </div>
      </section>

      {/* Neraca Kunci Sarjana */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Neraca Keuangan - Kunci Sarjana
        </h2>
        
        <div className="space-y-6">
          <h3 className="text-md font-medium text-gray-800 border-b pb-2">1. ASET</h3>
          {renderBalanceSection('Aset Lancar', 'kunciSarjana', 'asetLancar')}
          {renderBalanceSection('Aset Tetap', 'kunciSarjana', 'asetTetap')}
          
          <h3 className="text-md font-medium text-gray-800 border-b pb-2 mt-8">2. KEWAJIBAN</h3>
          {renderBalanceSection('Kewajiban', 'kunciSarjana', 'kewajiban')}
          
          <h3 className="text-md font-medium text-gray-800 border-b pb-2 mt-8">3. EKUITAS</h3>
          {renderBalanceSection('Ekuitas', 'kunciSarjana', 'ekuitas')}
        </div>
      </section>

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

      {/* Tanda Tangan */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tanda Tangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
              <input
                type="text"
                value={data.signature.city}
                onChange={(e) => handleNestedChange('signature', 'city', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="text"
                value={data.signature.date}
                onChange={(e) => handleNestedChange('signature', 'date', e.target.value)}
                placeholder="Contoh: 08 Maret 2026"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
              <input
                type="text"
                value={data.signature.role}
                onChange={(e) => handleNestedChange('signature', 'role', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Terang</label>
              <input
                type="text"
                value={data.signature.name}
                onChange={(e) => handleNestedChange('signature', 'name', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Tanda Tangan (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('signatureImage', e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {data.signature.signatureImage && (
                <div className="mt-2 relative inline-block">
                  <img src={data.signature.signatureImage} alt="Signature" className="h-20 object-contain border rounded p-1" />
                  <button
                    onClick={() => handleNestedChange('signature', 'signatureImage', undefined)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Stempel (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('stampImage', e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {data.signature.stampImage && (
                <div className="mt-2 relative inline-block">
                  <img src={data.signature.stampImage} alt="Stamp" className="h-20 object-contain border rounded p-1" />
                  <button
                    onClick={() => handleNestedChange('signature', 'stampImage', undefined)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
