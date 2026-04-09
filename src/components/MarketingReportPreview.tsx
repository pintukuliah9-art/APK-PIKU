import React from 'react';
import { MarketingReportData } from '../types';
import { formatCurrency } from '../lib/utils';

interface Props {
  data: MarketingReportData;
}

export function MarketingReportPreview({ data }: Props) {
  return (
    <div className="report-page bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-lg mx-auto text-black relative">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">TEMPLATE LAPORAN MARKETING</h1>
        <h2 className="text-sm italic mt-1">Laporan bulanan tim marketing: Ads, Customer Service/Admin, dan Prospek CRM</h2>
      </div>

      <table className="w-full border-collapse border border-black text-sm mb-8 break-inside-avoid">
        <tbody>
          <tr>
            <td className="border border-black p-2 font-semibold w-1/3">Periode Laporan</td>
            <td className="border border-black p-2">{data.periodeLaporan}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">PIC Marketing</td>
            <td className="border border-black p-2">{data.picMarketing}</td>
          </tr>
        </tbody>
      </table>

      {data.foreword && (
        <div className="mb-8 text-sm whitespace-pre-wrap break-inside-avoid">
          {data.foreword}
        </div>
      )}

      {/* A. Ringkasan Ads */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2">A. Ringkasan Ads</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-black p-2 text-center">Program</th>
              <th className="border border-black p-2 text-center">Target Closing</th>
              <th className="border border-black p-2 text-center">Capaian Closing</th>
              <th className="border border-black p-2 text-center">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data.adsSummary.length > 0 ? data.adsSummary.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-2 text-center">{item.program}</td>
                <td className="border border-black p-2 text-center">{item.targetClosing}</td>
                <td className="border border-black p-2 text-center">{item.capaianClosing}</td>
                <td className="border border-black p-2">{item.keterangan}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black p-2 text-center">&nbsp;</td>
                <td className="border border-black p-2 text-center">&nbsp;</td>
                <td className="border border-black p-2 text-center">&nbsp;</td>
                <td className="border border-black p-2 text-center">&nbsp;</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* B. Rekap Ads per Kampanye */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2">B. Rekap Ads per Kampanye</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-black p-1 text-center">No</th>
              <th className="border border-black p-1 text-center">Nama Kampanye</th>
              <th className="border border-black p-1 text-center">Platform</th>
              <th className="border border-black p-1 text-center">Leads</th>
              <th className="border border-black p-1 text-center">CPL/CPR (Rp)</th>
              <th className="border border-black p-1 text-center">Spend/Hari (Rp)</th>
              <th className="border border-black p-1 text-center">Spend/Bulan (Rp)</th>
              <th className="border border-black p-1 text-center">Impresi/Jangkauan</th>
              <th className="border border-black p-1 text-center">Evaluasi</th>
            </tr>
          </thead>
          <tbody>
            {data.campaignRecaps.length > 0 ? data.campaignRecaps.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{item.namaKampanye}</td>
                <td className="border border-black p-1 text-center">{item.platform}</td>
                <td className="border border-black p-1 text-center">{item.leads}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(item.cpl)}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(item.spendHari)}</td>
                <td className="border border-black p-1 text-right">{formatCurrency(item.spendBulan)}</td>
                <td className="border border-black p-1 text-center">{item.impresi}</td>
                <td className="border border-black p-1">{item.evaluasi}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black p-1 text-center">1</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* C. Rekap Pengeluaran Ads Harian */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2">C. Rekap Pengeluaran Ads Harian</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-black p-2 text-center">No</th>
              <th className="border border-black p-2 text-center">Tanggal</th>
              <th className="border border-black p-2 text-center">Kampanye</th>
              <th className="border border-black p-2 text-center">Platform</th>
              <th className="border border-black p-2 text-center">Nominal (Rp)</th>
              <th className="border border-black p-2 text-center">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {data.dailyAdsExpenses.length > 0 ? data.dailyAdsExpenses.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2 text-center">{item.tanggal}</td>
                <td className="border border-black p-2">{item.kampanye}</td>
                <td className="border border-black p-2 text-center">{item.platform}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(item.nominal)}</td>
                <td className="border border-black p-2">{item.catatan}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black p-2 text-center">1</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* D. Laporan Customer Service / Admin */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2">D. Laporan Customer Service / Admin</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-black p-1 text-center">No</th>
              <th className="border border-black p-1 text-center">Nama Petugas</th>
              <th className="border border-black p-1 text-center">Jumlah Chat Masuk</th>
              <th className="border border-black p-1 text-center">Jumlah Follow Up</th>
              <th className="border border-black p-1 text-center">Jumlah Closing</th>
              <th className="border border-black p-1 text-center">Respon Rata-rata</th>
              <th className="border border-black p-1 text-center">Kendala</th>
              <th className="border border-black p-1 text-center">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {data.csRecaps.length > 0 ? data.csRecaps.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{item.namaPetugas}</td>
                <td className="border border-black p-1 text-center">{item.jumlahChat}</td>
                <td className="border border-black p-1 text-center">{item.jumlahFollowUp}</td>
                <td className="border border-black p-1 text-center">{item.jumlahClosing}</td>
                <td className="border border-black p-1 text-center">{item.responRataRata}</td>
                <td className="border border-black p-1">{item.kendala}</td>
                <td className="border border-black p-1">{item.catatan}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black p-1 text-center">1</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
                <td className="border border-black p-1">&nbsp;</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* E. Prospek CRM */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2">E. Prospek CRM</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-black p-2 text-center">No</th>
              <th className="border border-black p-2 text-center">Sumber Prospek</th>
              <th className="border border-black p-2 text-center">Jumlah Prospek</th>
              <th className="border border-black p-2 text-center">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data.crmProspects.length > 0 ? data.crmProspects.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.sumberProspek}</td>
                <td className="border border-black p-2 text-center">{item.jumlahProspek}</td>
                <td className="border border-black p-2">{item.keterangan}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-black p-2 text-center">1</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
                <td className="border border-black p-2">&nbsp;</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="text-xs italic mt-2">Catatan: isi nominal pengeluaran ads per hari dan akumulasi per bulan. Prospek CRM cukup diisi jumlah prospek per sumber/channel.</p>
      </div>

      {/* Lampiran Link */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold mb-2 uppercase">Lampiran Link</h3>
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
      {data.conclusion && (
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold mb-2">Kesimpulan</h3>
          <div className="text-sm whitespace-pre-wrap border border-black p-4 bg-gray-50">
            {data.conclusion}
          </div>
        </div>
      )}

      {/* Signature */}
      <div className="mt-16 flex justify-end break-inside-avoid">
        <div className="text-center w-64 relative">
          <p className="mb-1">{data.signature.city}, {data.signature.date}</p>
          <p className="mb-20">{data.signature.role}</p>
          
          {data.signature.signatureImage && (
            <img 
              src={data.signature.signatureImage} 
              alt="Signature" 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 object-contain z-10"
            />
          )}
          
          {data.signature.stampImage && (
            <img 
              src={data.signature.stampImage} 
              alt="Stamp" 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-32 object-contain opacity-50 z-0"
            />
          )}

          <p className="font-bold underline relative z-20">{data.signature.name}</p>
        </div>
      </div>
    </div>
  );
}
