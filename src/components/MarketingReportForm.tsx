import React from 'react';
import { MarketingReportData, AdsSummary, CampaignRecap, DailyAdsExpense, CSRecap, CRMProspect, AttachmentLink } from '../types';
import { Plus, Trash2, Wand2, Link as LinkIcon } from 'lucide-react';
import { formatNumberInput, parseNumberInput } from '../lib/utils';
import { useAppStore } from '../hooks/useAppStore';

interface Props {
  data: MarketingReportData;
  onChange: (data: MarketingReportData) => void;
}

export function MarketingReportForm({ data, onChange }: Props) {
  const { settings } = useAppStore();

  const handleChange = (field: keyof MarketingReportData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (section: keyof MarketingReportData, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...(data[section] as any),
        [field]: value,
      },
    });
  };

  const handleArrayChange = <T extends keyof MarketingReportData>(
    section: T,
    index: number,
    field: string,
    value: any
  ) => {
    const newArray = [...(data[section] as any[])];
    newArray[index] = { ...newArray[index], [field]: value };
    onChange({ ...data, [section]: newArray });
  };

  const handleAddArrayItem = <T extends keyof MarketingReportData>(section: T, defaultItem: any) => {
    onChange({
      ...data,
      [section]: [...(data[section] as any[]), defaultItem],
    });
  };

  const handleRemoveArrayItem = <T extends keyof MarketingReportData>(section: T, index: number) => {
    const newArray = [...(data[section] as any[])];
    newArray.splice(index, 1);
    onChange({ ...data, [section]: newArray });
  };

  const generateForeword = () => {
    const template = `Laporan ini menyajikan ringkasan kinerja tim marketing selama bulan ${data.month} ${data.year}. Laporan ini mencakup hasil dari berbagai program periklanan (Ads), kinerja Customer Service/Admin, serta prospek yang diperoleh melalui CRM. Tujuan dari laporan ini adalah untuk memberikan gambaran komprehensif mengenai efektivitas strategi pemasaran yang telah dijalankan, serta menjadi bahan evaluasi untuk perbaikan di periode berikutnya.`;
    handleChange('foreword', template);
  };

  const generateConclusion = () => {
    const totalTarget = data.adsSummary.reduce((sum, item) => sum + (Number(item.targetClosing) || 0), 0);
    const totalCapaian = data.adsSummary.reduce((sum, item) => sum + (Number(item.capaianClosing) || 0), 0);
    
    let status = '';
    if (totalCapaian >= totalTarget && totalTarget > 0) {
      status = 'telah memenuhi bahkan melampaui target yang ditetapkan';
    } else if (totalCapaian > 0) {
      status = 'belum memenuhi target yang ditetapkan';
    } else {
      status = 'belum ada pencapaian closing';
    }

    const template = `Berdasarkan data laporan bulan ${data.month} ${data.year}, total capaian closing adalah sebanyak ${totalCapaian} dari target ${totalTarget} closing. Pencapaian ini ${status}. Evaluasi lebih lanjut diperlukan untuk mengoptimalkan strategi marketing di bulan berikutnya agar target dapat tercapai secara maksimal.`;
    handleChange('conclusion', template);
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

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Periode Laporan</label>
          <input
            type="text"
            value={data.periodeLaporan}
            onChange={(e) => handleChange('periodeLaporan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Contoh: 1 - 31 Maret 2026"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIC Marketing</label>
          <input
            type="text"
            value={data.picMarketing}
            onChange={(e) => handleChange('picMarketing', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Nama PIC"
          />
        </div>
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
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Kata Pengantar</label>
            <button
              onClick={generateForeword}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Wand2 size={14} /> Buat Template
            </button>
          </div>
          <textarea
            value={data.foreword}
            onChange={(e) => handleChange('foreword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px]"
            placeholder="Masukkan kata pengantar laporan..."
          />
        </div>
      </div>

      {/* A. Ringkasan Ads */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">A. Ringkasan Ads</h3>
          <button
            onClick={() => handleAddArrayItem('adsSummary', { program: '', targetClosing: 0, capaianClosing: 0, keterangan: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
        <div className="space-y-4">
          {data.adsSummary.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-4 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Program</label>
                  <input
                    type="text"
                    value={item.program}
                    onChange={(e) => handleArrayChange('adsSummary', index, 'program', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Target Closing</label>
                  <input
                    type="number"
                    value={item.targetClosing}
                    onChange={(e) => handleArrayChange('adsSummary', index, 'targetClosing', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Capaian Closing</label>
                  <input
                    type="number"
                    value={item.capaianClosing}
                    onChange={(e) => handleArrayChange('adsSummary', index, 'capaianClosing', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={item.keterangan}
                    onChange={(e) => handleArrayChange('adsSummary', index, 'keterangan', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={() => handleRemoveArrayItem('adsSummary', index)} className="p-2 text-gray-400 hover:text-red-500 mt-5">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* B. Rekap Ads per Kampanye */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">B. Rekap Ads per Kampanye</h3>
          <button
            onClick={() => handleAddArrayItem('campaignRecaps', { namaKampanye: '', platform: '', leads: 0, cpl: 0, spendHari: 0, spendBulan: 0, impresi: 0, evaluasi: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
        <div className="space-y-4">
          {data.campaignRecaps.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-4 gap-4 flex-1">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Kampanye</label>
                  <input
                    type="text"
                    value={item.namaKampanye}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'namaKampanye', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
                  <input
                    type="text"
                    value={item.platform}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'platform', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Leads</label>
                  <input
                    type="number"
                    value={item.leads}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'leads', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CPL/CPR (Rp)</label>
                  <input
                    type="text"
                    value={formatNumberInput(item.cpl)}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'cpl', parseNumberInput(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Spend/Hari (Rp)</label>
                  <input
                    type="text"
                    value={formatNumberInput(item.spendHari)}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'spendHari', parseNumberInput(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Spend/Bulan (Rp)</label>
                  <input
                    type="text"
                    value={formatNumberInput(item.spendBulan)}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'spendBulan', parseNumberInput(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Impresi/Jangkauan</label>
                  <input
                    type="number"
                    value={item.impresi}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'impresi', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Evaluasi</label>
                  <input
                    type="text"
                    value={item.evaluasi}
                    onChange={(e) => handleArrayChange('campaignRecaps', index, 'evaluasi', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={() => handleRemoveArrayItem('campaignRecaps', index)} className="p-2 text-gray-400 hover:text-red-500 mt-5">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* C. Rekap Pengeluaran Ads Harian */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">C. Rekap Pengeluaran Ads Harian</h3>
          <button
            onClick={() => handleAddArrayItem('dailyAdsExpenses', { tanggal: '', kampanye: '', platform: '', nominal: 0, catatan: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
        <div className="space-y-4">
          {data.dailyAdsExpenses.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-5 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={item.tanggal}
                    onChange={(e) => handleArrayChange('dailyAdsExpenses', index, 'tanggal', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kampanye</label>
                  <input
                    type="text"
                    value={item.kampanye}
                    onChange={(e) => handleArrayChange('dailyAdsExpenses', index, 'kampanye', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
                  <input
                    type="text"
                    value={item.platform}
                    onChange={(e) => handleArrayChange('dailyAdsExpenses', index, 'platform', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nominal (Rp)</label>
                  <input
                    type="text"
                    value={formatNumberInput(item.nominal)}
                    onChange={(e) => handleArrayChange('dailyAdsExpenses', index, 'nominal', parseNumberInput(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={item.catatan}
                    onChange={(e) => handleArrayChange('dailyAdsExpenses', index, 'catatan', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={() => handleRemoveArrayItem('dailyAdsExpenses', index)} className="p-2 text-gray-400 hover:text-red-500 mt-5">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* D. Laporan Customer Service / Admin */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">D. Laporan Customer Service / Admin</h3>
          <button
            onClick={() => handleAddArrayItem('csRecaps', { namaPetugas: '', jumlahChat: 0, jumlahFollowUp: 0, jumlahClosing: 0, responRataRata: '', kendala: '', catatan: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
        <div className="space-y-4">
          {data.csRecaps.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-4 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Petugas</label>
                  <input
                    type="text"
                    value={item.namaPetugas}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'namaPetugas', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Chat Masuk</label>
                  <input
                    type="number"
                    value={item.jumlahChat}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'jumlahChat', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Follow Up</label>
                  <input
                    type="number"
                    value={item.jumlahFollowUp}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'jumlahFollowUp', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Closing</label>
                  <input
                    type="number"
                    value={item.jumlahClosing}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'jumlahClosing', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Respon Rata-rata</label>
                  <input
                    type="text"
                    value={item.responRataRata}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'responRataRata', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kendala</label>
                  <input
                    type="text"
                    value={item.kendala}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'kendala', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={item.catatan}
                    onChange={(e) => handleArrayChange('csRecaps', index, 'catatan', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={() => handleRemoveArrayItem('csRecaps', index)} className="p-2 text-gray-400 hover:text-red-500 mt-5">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* E. Prospek CRM */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">E. Prospek CRM</h3>
          <button
            onClick={() => handleAddArrayItem('crmProspects', { sumberProspek: '', jumlahProspek: 0, keterangan: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
        <div className="space-y-4">
          {data.crmProspects.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sumber Prospek</label>
                  <input
                    type="text"
                    value={item.sumberProspek}
                    onChange={(e) => handleArrayChange('crmProspects', index, 'sumberProspek', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah Prospek</label>
                  <input
                    type="number"
                    value={item.jumlahProspek}
                    onChange={(e) => handleArrayChange('crmProspects', index, 'jumlahProspek', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={item.keterangan}
                    onChange={(e) => handleArrayChange('crmProspects', index, 'keterangan', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={() => handleRemoveArrayItem('crmProspects', index)} className="p-2 text-gray-400 hover:text-red-500 mt-5">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
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
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block">Kesimpulan</h3>
          <button
            onClick={generateConclusion}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Wand2 size={16} /> Buat Kesimpulan Otomatis
          </button>
        </div>
        <div>
          <textarea
            value={data.conclusion}
            onChange={(e) => handleChange('conclusion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px]"
            placeholder="Masukkan kesimpulan laporan..."
          />
        </div>
      </div>

      {/* Signature */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 inline-block mb-4">Tanda Tangan</h3>
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
              placeholder="DD MMMM YYYY"
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
