import React, { useState } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import { useMarketingStore } from '../../hooks/useMarketingStore';
import { StudentAdministration } from '../../types/app';
import { v4 as uuidv4 } from 'uuid';
import { Save, CheckCircle } from 'lucide-react';

export function InputMahasiswaForm() {
  const { addStudentAdministration, settings } = useAppStore();
  const { timMarketing } = useMarketingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<StudentAdministration>>({
    tanggalDaftar: new Date().toISOString().split('T')[0],
    jalurInput: 'Marketing/CS',
    kategoriClosing: 'Internal',
    koordinator: 'Internal BR Jaya',
    program: 'Reguler',
    perguruanTinggi: '',
    programStudi: '',
    kloterInput: '',
    periodePendaftaran: '',
    periodeKuliah: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    nik: '',
    namaIbu: '',
    kelurahan: '',
    kecamatan: '',
    kabupatenKota: '',
    provinsi: '',
    email: '',
    noHp: '',
    lulusSmaS1: '',
    lulusKuliah: '',
    linkDoc: '',
    ketDokumen: '',
    statusBerkas: 'Belum Lengkap',
    catatanMahasiswa: '',
    tanggalInput: new Date().toISOString().split('T')[0],
    statusData: 'Baru (Closing)',
    linkPddikti: '',
    linkPisn: '',
    nimNpm: '',
    nomorIjazah: '',
    tanggalMasuk: '',
    tanggalLulus: '',
    pasPhoto: '',
    judulSkripsi: '',
    banPt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newStudent: StudentAdministration = {
        ...(formData as StudentAdministration),
        id: uuidv4(),
      };
      await addStudentAdministration(newStudent);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        // Reset form
        setFormData(prev => ({
          ...prev,
          namaLengkap: '',
          tempatLahir: '',
          tanggalLahir: '',
          nik: '',
          namaIbu: '',
          kelurahan: '',
          kecamatan: '',
          kabupatenKota: '',
          provinsi: '',
          email: '',
          noHp: '',
          lulusSmaS1: '',
          lulusKuliah: '',
          linkDoc: '',
          ketDokumen: '',
          catatanMahasiswa: '',
          jenisKelamin: '',
          agama: '',
          perguruanTinggi: '',
          programStudi: '',
          kategoriClosing: 'Internal',
          koordinator: 'Internal BR Jaya',
        }));
      }, 3000);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Gagal menyimpan data mahasiswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Input Data Mahasiswa (Closing)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Silakan isi data diri mahasiswa yang baru saja closing. Data ini akan otomatis terintegrasi dengan database Admin Akademik.
        </p>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <p>Data mahasiswa berhasil disimpan dan diteruskan ke Admin Akademik!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Pendaftaran */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2">Data Pendaftaran</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Daftar</label>
              <input type="date" name="tanggalDaftar" value={formData.tanggalDaftar} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Closing</label>
              <select name="kategoriClosing" value={formData.kategoriClosing} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="Internal">Internal (CS/Admin)</option>
                <option value="Eksternal">Eksternal (Koordinator)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Koordinator / CS Admin</label>
              <select name="koordinator" value={formData.koordinator} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="Internal BR Jaya">Internal BR Jaya (Umum)</option>
                <optgroup label="CS Admin / Internal">
                  {timMarketing.map(t => <option key={t.id} value={t.namaLengkap}>{t.namaLengkap}</option>)}
                </optgroup>
                <optgroup label="Koordinator / Mitra">
                  {settings.coordinators?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program</label>
              <select name="program" value={formData.program} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="">Pilih Program...</option>
                {settings.adminOptions?.PROGRAM?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Perguruan Tinggi</label>
              <select name="perguruanTinggi" value={formData.perguruanTinggi} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="">Pilih Perguruan Tinggi...</option>
                {settings.adminOptions?.PERGURUAN_TINGGI?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Studi</label>
              <select name="programStudi" value={formData.programStudi} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                <option value="">Pilih Program Studi...</option>
                {settings.studyPrograms?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2">Data Pribadi</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
              <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tempat Lahir</label>
                <input type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin</label>
                <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                  <option value="">Pilih Jenis Kelamin...</option>
                  {settings.adminOptions?.JENIS_KELAMIN?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agama</label>
                <select name="agama" value={formData.agama} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                  <option value="">Pilih Agama...</option>
                  {settings.adminOptions?.AGAMA?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NIK</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Ibu</label>
                <input type="text" name="namaIbu" value={formData.namaIbu} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lulus SMA/S1</label>
                <input type="text" name="lulusSmaS1" value={formData.lulusSmaS1} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lulus Kuliah</label>
                <input type="text" name="lulusKuliah" value={formData.lulusKuliah} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kelurahan</label>
                <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kecamatan</label>
                <input type="text" name="kecamatan" value={formData.kecamatan} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kabupaten/Kota</label>
                <input type="text" name="kabupatenKota" value={formData.kabupatenKota} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
                <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No. HP / WA</label>
                <input type="text" name="noHp" value={formData.noHp} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan (Dokumen)</label>
                <select name="ketDokumen" value={formData.ketDokumen} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600">
                  <option value="">Pilih Keterangan...</option>
                  {settings.adminOptions?.KET_DOKUMEN?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea name="catatanMahasiswa" value={formData.catatanMahasiswa} onChange={handleChange} rows={1} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t dark:border-slate-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Teruskan ke Akademik'}
          </button>
        </div>
      </form>
    </div>
  );
}
