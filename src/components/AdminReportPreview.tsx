import React from 'react';
import { AdminReportData } from '../types';

interface AdminReportPreviewProps {
  data: AdminReportData;
}

export function AdminReportPreview({ data }: AdminReportPreviewProps) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-[15mm] shadow-sm text-black font-serif report-page relative mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wide mb-1">LAPORAN TIM ADMINISTRASI PINTU KULIAH</h1>
        <p className="text-sm italic">Laporan bulanan administrasi: surat, inventaris, dan rekap data baru masuk per program dan kampus</p>
      </div>

      <div className="w-full h-1 bg-black mb-1"></div>
      <div className="w-full h-0.5 bg-black mb-6"></div>

      {/* Info Table */}
      <table className="w-full border-collapse border border-black mb-6 text-sm break-inside-avoid">
        <tbody>
          <tr>
            <td className="border border-black p-2 font-bold w-1/3 bg-blue-50">Periode Laporan</td>
            <td className="border border-black p-2">{data.periodeLaporan || '...............................................................'}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-bold bg-blue-50">PIC Administrasi</td>
            <td className="border border-black p-2">{data.picAdministrasi || '...............................................................'}</td>
          </tr>
        </tbody>
      </table>

      {/* Kata Pengantar */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">Kata Pengantar</h2>
        <p className="text-sm text-justify whitespace-pre-wrap leading-relaxed">
          {data.foreword || 'Laporan administrasi ini disusun sebagai bentuk dokumentasi dan evaluasi pelaksanaan administrasi selama satu periode laporan. Laporan mencakup rekap surat masuk dan keluar, inventaris kantor, serta data baru masuk per program. Dokumen ini diharapkan memudahkan monitoring progres kerja, identifikasi kendala, dan tindak lanjut perbaikan pada periode berikutnya.'}
        </p>
      </div>

      {/* A. Rekap Surat */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">A. Rekap Surat Masuk dan Keluar</h2>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 w-10">No</th>
              <th className="border border-black p-2">Tanggal</th>
              <th className="border border-black p-2">Jenis Surat</th>
              <th className="border border-black p-2">Nomor Surat</th>
              <th className="border border-black p-2">Asal/Tujuan</th>
              <th className="border border-black p-2">Perihal</th>
              <th className="border border-black p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.mailRecaps.length > 0 ? (
              data.mailRecaps.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{item.tanggal}</td>
                  <td className="border border-black p-2 text-center">{item.jenisSurat}</td>
                  <td className="border border-black p-2">{item.nomorSurat}</td>
                  <td className="border border-black p-2">{item.asalTujuan}</td>
                  <td className="border border-black p-2">{item.perihal}</td>
                  <td className="border border-black p-2">{item.status}</td>
                </tr>
              ))
            ) : (
              // Empty rows for template look
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* B. Inventaris */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">B. Inventaris Kantor</h2>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 w-10">No</th>
              <th className="border border-black p-2">Nama Barang</th>
              <th className="border border-black p-2">Jumlah</th>
              <th className="border border-black p-2">Kondisi</th>
              <th className="border border-black p-2">Lokasi</th>
              <th className="border border-black p-2">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data.inventoryItems.length > 0 ? (
              data.inventoryItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{item.namaBarang}</td>
                  <td className="border border-black p-2 text-center">{item.jumlah}</td>
                  <td className="border border-black p-2">{item.kondisi}</td>
                  <td className="border border-black p-2">{item.lokasi}</td>
                  <td className="border border-black p-2">{item.keterangan}</td>
                </tr>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Page Break for next section if needed, but let's just let it flow or we can force page break if it's too long. For simplicity, we'll keep it in one flow and rely on the container height. */}
      
      {/* C. Data Reguler */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">C. Rekap Data Baru Masuk per Bulan Program Reguler</h2>
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 w-10" rowSpan={2}>NO</th>
              <th className="border border-black p-2" rowSpan={2}>KAMPUS</th>
              <th className="border border-black p-2" colSpan={5}>STATUS BERKAS</th>
              <th className="border border-black p-2" rowSpan={2}>JUMLAH DATA</th>
            </tr>
            <tr className="bg-blue-50">
              <th className="border border-black p-2">Berkas On</th>
              <th className="border border-black p-2">Belum On</th>
              <th className="border border-black p-2">Revisi</th>
              <th className="border border-black p-2">Cancel</th>
              <th className="border border-black p-2">Selesai</th>
            </tr>
          </thead>
          <tbody>
            {data.regulerData.length > 0 ? (
              data.regulerData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{index + 1}</td>
                  <td className="border border-black p-2 text-left">{item.kampus}</td>
                  <td className="border border-black p-2">{item.berkasOn}</td>
                  <td className="border border-black p-2">{item.belumOn}</td>
                  <td className="border border-black p-2">{item.revisi}</td>
                  <td className="border border-black p-2">{item.cancel}</td>
                  <td className="border border-black p-2">{item.selesai || 0}</td>
                  <td className="border border-black p-2 font-bold">{item.jumlahData}</td>
                </tr>
              ))
            ) : (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2">{i + 1}</td>
                  <td className="border border-black p-2 text-left">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* D. Data RPL */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">D. Rekap Data Baru Masuk per Bulan Program RPL</h2>
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 w-10" rowSpan={2}>NO</th>
              <th className="border border-black p-2" rowSpan={2}>KAMPUS</th>
              <th className="border border-black p-2" colSpan={5}>STATUS BERKAS</th>
              <th className="border border-black p-2" rowSpan={2}>JUMLAH DATA</th>
            </tr>
            <tr className="bg-blue-50">
              <th className="border border-black p-2">Berkas On</th>
              <th className="border border-black p-2">Belum On</th>
              <th className="border border-black p-2">Revisi</th>
              <th className="border border-black p-2">Cancel</th>
              <th className="border border-black p-2">Selesai</th>
            </tr>
          </thead>
          <tbody>
            {data.rplData.length > 0 ? (
              data.rplData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{index + 1}</td>
                  <td className="border border-black p-2 text-left">{item.kampus}</td>
                  <td className="border border-black p-2">{item.berkasOn}</td>
                  <td className="border border-black p-2">{item.belumOn}</td>
                  <td className="border border-black p-2">{item.revisi}</td>
                  <td className="border border-black p-2">{item.cancel}</td>
                  <td className="border border-black p-2">{item.selesai || 0}</td>
                  <td className="border border-black p-2 font-bold">{item.jumlahData}</td>
                </tr>
              ))
            ) : (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2">{i + 1}</td>
                  <td className="border border-black p-2 text-left">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* E. Data Akselerasi */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">E. Rekap Data Baru Masuk per Bulan Program Akselerasi</h2>
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 w-10" rowSpan={2}>NO</th>
              <th className="border border-black p-2" rowSpan={2}>KAMPUS</th>
              <th className="border border-black p-2" colSpan={5}>STATUS BERKAS</th>
              <th className="border border-black p-2" rowSpan={2}>JUMLAH DATA</th>
            </tr>
            <tr className="bg-blue-50">
              <th className="border border-black p-2">Berkas On</th>
              <th className="border border-black p-2">Belum On</th>
              <th className="border border-black p-2">Revisi</th>
              <th className="border border-black p-2">Cancel</th>
              <th className="border border-black p-2">Selesai</th>
            </tr>
          </thead>
          <tbody>
            {data.akselerasiData.length > 0 ? (
              data.akselerasiData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{index + 1}</td>
                  <td className="border border-black p-2 text-left">{item.kampus}</td>
                  <td className="border border-black p-2">{item.berkasOn}</td>
                  <td className="border border-black p-2">{item.belumOn}</td>
                  <td className="border border-black p-2">{item.revisi}</td>
                  <td className="border border-black p-2">{item.cancel}</td>
                  <td className="border border-black p-2">{item.selesai || 0}</td>
                  <td className="border border-black p-2 font-bold">{item.jumlahData}</td>
                </tr>
              ))
            ) : (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-2">{i + 1}</td>
                  <td className="border border-black p-2 text-left">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lampiran Link */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold mb-2">Lampiran Link</h2>
          <table className="w-full border-collapse border-none text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-2 w-12">No</th>
                <th className="text-left py-2 w-32">Unit</th>
                <th className="text-left py-2">Jenis Lampiran</th>
                <th className="text-left py-2 w-48">Link</th>
              </tr>
            </thead>
            <tbody>
              {data.attachments.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{item.unit}</td>
                  <td className="py-2">{item.jenisLampiran}</td>
                  <td className="py-2 text-blue-600">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        [link lampiran]
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kesimpulan */}
      <div className="mb-12 break-inside-avoid">
        <h2 className="text-lg font-bold mb-2">Kesimpulan</h2>
        <p className="text-sm text-justify whitespace-pre-wrap leading-relaxed">
          {data.conclusion || 'Secara umum, laporan ini memberikan gambaran ringkas mengenai aktivitas administrasi, kondisi inventaris, dan perkembangan data baru masuk pada setiap program. Bagian kesimpulan ini dapat diisi dengan hasil evaluasi bulanan, hambatan utama, serta rekomendasi tindak lanjut agar proses administrasi periode berikutnya lebih tertata, cepat, dan akurat.'}
        </p>
      </div>

      {/* Signature */}
      <div className="flex justify-end mt-12 pb-12 break-inside-avoid">
        <div className="text-center w-64">
          <p className="text-sm mb-1">
            {data.signature.city || 'Kota'}, {data.signature.date || 'Tanggal Bulan Tahun'}
          </p>
          <p className="text-sm font-bold mb-4">{data.signature.role || 'Jabatan'}</p>
          
          <div className="h-24 flex items-center justify-center relative my-2">
            {data.signature.stampImage && (
              <img 
                src={data.signature.stampImage} 
                alt="Stamp" 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-24 w-24 object-contain opacity-80 mix-blend-multiply"
                style={{ zIndex: 1 }}
              />
            )}
            {data.signature.signatureImage && (
              <img 
                src={data.signature.signatureImage} 
                alt="Signature" 
                className="h-20 object-contain relative"
                style={{ zIndex: 2 }}
              />
            )}
            {!data.signature.signatureImage && !data.signature.stampImage && (
              <div className="w-full border-b border-dashed border-gray-400"></div>
            )}
          </div>

          <p className="text-sm font-bold underline">{data.signature.name || 'Nama Lengkap'}</p>
        </div>
      </div>
    </div>
  );
}
