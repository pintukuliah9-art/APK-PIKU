import React from 'react';
import { InternalReportData, FinancialItem, AttachmentLink } from '../types';
import { formatCurrency, formatNumberInput, parseNumberInput } from '../lib/utils';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAppStore } from '../contexts/AppStoreContext';

interface Props {
  data: InternalReportData;
  onChange: (data: InternalReportData) => void;
}

export function InternalReportForm({ data, onChange }: Props) {
  const { settings } = useAppStore();

  const handleChange = (field: keyof InternalReportData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (section: keyof InternalReportData, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...(data[section] as any),
        [field]: value
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

  const handleAddFinancialItem = (type: 'detailedIncome' | 'detailedExpense') => {
    const newItem: FinancialItem = {
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      source: '',
      detail: '',
      amount: 0
    };
    
    onChange({
      ...data,
      finance: {
        ...data.finance,
        [type]: [...(data.finance[type] || []), newItem]
      }
    });
  };

  const handleUpdateFinancialItem = (type: 'detailedIncome' | 'detailedExpense', index: number, field: keyof FinancialItem, value: any) => {
    const updatedItems = [...(data.finance[type] || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    onChange({
      ...data,
      finance: {
        ...data.finance,
        [type]: updatedItems
      }
    });
  };

  const handleRemoveFinancialItem = (type: 'detailedIncome' | 'detailedExpense', index: number) => {
    const updatedItems = [...(data.finance[type] || [])];
    updatedItems.splice(index, 1);
    
    onChange({
      ...data,
      finance: {
        ...data.finance,
        [type]: updatedItems
      }
    });
  };

  const handleAddProgramItem = (type: 'programs' | 'studyPrograms') => {
    const newItem = { label: '', count: 0 };
    onChange({
      ...data,
      admin: {
        ...data.admin,
        [type]: [...(data.admin[type] || []), newItem]
      }
    });
  };

  const handleUpdateProgramItem = (type: 'programs' | 'studyPrograms', index: number, field: 'label' | 'count', value: any) => {
    const updatedItems = [...(data.admin[type] || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange({
      ...data,
      admin: {
        ...data.admin,
        [type]: updatedItems
      }
    });
  };

  const handleRemoveProgramItem = (type: 'programs' | 'studyPrograms', index: number) => {
    const updatedItems = [...(data.admin[type] || [])];
    updatedItems.splice(index, 1);
    onChange({
      ...data,
      admin: {
        ...data.admin,
        [type]: updatedItems
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
          <select
            value={data.month}
            onChange={(e) => handleChange('month', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan Laporan</label>
        <textarea
          value={data.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Tuliskan ringkasan laporan bulan ini..."
        />
      </div>

      {/* Marketing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Marketing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Pengeluaran Iklan</label>
            <input
              type="text"
              value={formatNumberInput(data.marketing.spend)}
              onChange={(e) => handleNestedChange('marketing', 'spend', parseNumberInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Leads</label>
            <input
              type="number"
              value={data.marketing.leads}
              onChange={(e) => handleNestedChange('marketing', 'leads', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Clicks</label>
            <input
              type="number"
              value={data.marketing.clicks}
              onChange={(e) => handleNestedChange('marketing', 'clicks', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Closing</label>
            <input
              type="number"
              value={data.marketing.closing}
              onChange={(e) => handleNestedChange('marketing', 'closing', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Finance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Keuangan (Finance)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Pemasukan</label>
            <input
              type="text"
              value={formatNumberInput(data.finance.income)}
              onChange={(e) => handleNestedChange('finance', 'income', parseNumberInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Pengeluaran</label>
            <input
              type="text"
              value={formatNumberInput(data.finance.expense)}
              onChange={(e) => handleNestedChange('finance', 'expense', parseNumberInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Akhir</label>
            <input
              type="text"
              value={formatNumberInput(data.finance.saldo)}
              onChange={(e) => handleNestedChange('finance', 'saldo', parseNumberInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Detailed Income */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">Rincian Pemasukan</h4>
            <button
              onClick={() => handleAddFinancialItem('detailedIncome')}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Data
            </button>
          </div>
          
          <div className="space-y-3">
            {(data.finance.detailedIncome || []).map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-4 gap-3 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                    <input
                      type="text"
                      value={item.date || ''}
                      onChange={(e) => handleUpdateFinancialItem('detailedIncome', index, 'date', e.target.value)}
                      placeholder="DD MMM YYYY"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sumber</label>
                    <select
                      value={item.source}
                      onChange={(e) => handleUpdateFinancialItem('detailedIncome', index, 'source', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="">Pilih Sumber</option>
                      {settings.incomeCategories?.map((cat, i) => (
                        <option key={`${cat}-${i}`} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
                    <input
                      type="text"
                      value={item.detail}
                      onChange={(e) => handleUpdateFinancialItem('detailedIncome', index, 'detail', e.target.value)}
                      placeholder="Keterangan"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nominal</label>
                    <input
                      type="text"
                      value={formatNumberInput(item.amount)}
                      onChange={(e) => handleUpdateFinancialItem('detailedIncome', index, 'amount', parseNumberInput(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFinancialItem('detailedIncome', index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {(!data.finance.detailedIncome || data.finance.detailedIncome.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada data rincian pemasukan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Expense */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">Rincian Pengeluaran</h4>
            <button
              onClick={() => handleAddFinancialItem('detailedExpense')}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Data
            </button>
          </div>
          
          <div className="space-y-3">
            {(data.finance.detailedExpense || []).map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-4 gap-3 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                    <input
                      type="text"
                      value={item.date || ''}
                      onChange={(e) => handleUpdateFinancialItem('detailedExpense', index, 'date', e.target.value)}
                      placeholder="DD MMM YYYY"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tujuan</label>
                    <select
                      value={item.source}
                      onChange={(e) => handleUpdateFinancialItem('detailedExpense', index, 'source', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="">Pilih Tujuan</option>
                      {settings.expenseCategories?.map((cat, i) => (
                        <option key={`${cat}-${i}`} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
                    <input
                      type="text"
                      value={item.detail}
                      onChange={(e) => handleUpdateFinancialItem('detailedExpense', index, 'detail', e.target.value)}
                      placeholder="Keterangan"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nominal</label>
                    <input
                      type="text"
                      value={formatNumberInput(item.amount)}
                      onChange={(e) => handleUpdateFinancialItem('detailedExpense', index, 'amount', parseNumberInput(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFinancialItem('detailedExpense', index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {(!data.finance.detailedExpense || data.finance.detailedExpense.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada data rincian pengeluaran.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Administrasi Mahasiswa</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mahasiswa Aktif</label>
            <input
              type="number"
              value={data.admin.activeStudents}
              onChange={(e) => handleNestedChange('admin', 'activeStudents', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drop Out (DO)</label>
            <input
              type="number"
              value={data.admin.dropout}
              onChange={(e) => handleNestedChange('admin', 'dropout', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lulus</label>
            <input
              type="number"
              value={data.admin.graduated}
              onChange={(e) => handleNestedChange('admin', 'graduated', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Programs */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">Data Mahasiswa per Jalur Input</h4>
            <button
              onClick={() => handleAddProgramItem('programs')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Data
            </button>
          </div>
          
          <div className="space-y-3">
            {(data.admin.programs || []).map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Jalur Input</label>
                    <select
                      value={item.label}
                      onChange={(e) => handleUpdateProgramItem('programs', index, 'label', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="">Pilih Jalur Input</option>
                      {settings.adminOptions?.JALUR_INPUT?.map((opt, i) => (
                        <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Mahasiswa</label>
                    <input
                      type="number"
                      value={item.count}
                      onChange={(e) => handleUpdateProgramItem('programs', index, 'count', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProgramItem('programs', index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {(!data.admin.programs || data.admin.programs.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada data mahasiswa per jalur input.</p>
              </div>
            )}
          </div>
        </div>

        {/* Study Programs */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">Data Mahasiswa per Program Studi</h4>
            <button
              onClick={() => handleAddProgramItem('studyPrograms')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Data
            </button>
          </div>
          
          <div className="space-y-3">
            {(data.admin.studyPrograms || []).map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Program Studi</label>
                    <select
                      value={item.label}
                      onChange={(e) => handleUpdateProgramItem('studyPrograms', index, 'label', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="">Pilih Program Studi</option>
                      {settings.studyPrograms?.map((opt, i) => (
                        <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Mahasiswa</label>
                    <input
                      type="number"
                      value={item.count}
                      onChange={(e) => handleUpdateProgramItem('studyPrograms', index, 'count', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProgramItem('studyPrograms', index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {(!data.admin.studyPrograms || data.admin.studyPrograms.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Belum ada data mahasiswa per program studi.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HR */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">SDM (HR)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan Aktif</label>
            <input
              type="number"
              value={data.hr.activeEmployees}
              onChange={(e) => handleNestedChange('hr', 'activeEmployees', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resign</label>
            <input
              type="number"
              value={data.hr.resigned}
              onChange={(e) => handleNestedChange('hr', 'resigned', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rekrutmen Baru</label>
            <input
              type="number"
              value={data.hr.recruited}
              onChange={(e) => handleNestedChange('hr', 'recruited', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
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

      {/* Signature */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tanda Tangan</h3>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
}
