import React from 'react';
import { InternalReportData } from '../types';
import { formatCurrency } from '../lib/utils';

interface Props {
  data: InternalReportData;
}

export function InternalReportPreview({ data }: Props) {
  return (
    <div className="report-page bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-lg mx-auto text-black relative">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">LAPORAN INTERNAL BULANAN</h1>
        <h2 className="text-xl font-semibold mt-1">PERIODE {data.month} {data.year}</h2>
      </div>

      {/* Summary */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-300 pb-1">1. Ringkasan Eksekutif</h3>
        <p className="text-justify leading-relaxed whitespace-pre-wrap">{data.summary}</p>
      </div>

      {/* Marketing */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-300 pb-1">2. Performa Marketing</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-semibold w-1/2">Total Pengeluaran Iklan</td>
              <td className="border border-black p-2 text-right">{formatCurrency(data.marketing.spend)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Total Leads</td>
              <td className="border border-black p-2 text-right">{data.marketing.leads} Leads</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Total Clicks</td>
              <td className="border border-black p-2 text-right">{data.marketing.clicks} Clicks</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Total Closing</td>
              <td className="border border-black p-2 text-right">{data.marketing.closing} Mahasiswa</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Finance */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-300 pb-1">3. Laporan Keuangan</h3>
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-semibold w-1/2">Total Pemasukan</td>
              <td className="border border-black p-2 text-right">{formatCurrency(data.finance.income)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Total Pengeluaran</td>
              <td className="border border-black p-2 text-right">{formatCurrency(data.finance.expense)}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-2 font-bold">Saldo Akhir</td>
              <td className="border border-black p-2 text-right font-bold">{formatCurrency(data.finance.saldo)}</td>
            </tr>
          </tbody>
        </table>

        {data.finance.detailedIncome && data.finance.detailedIncome.length > 0 && (
          <div className="mt-4 break-inside-avoid">
            <h4 className="text-md font-bold mb-2">Rincian Pemasukan</h4>
            <table className="w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1 text-left">Tanggal</th>
                  <th className="border border-black p-1 text-left">Sumber</th>
                  <th className="border border-black p-1 text-left">Keterangan</th>
                  <th className="border border-black p-1 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {data.finance.detailedIncome.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-1">{item.date}</td>
                    <td className="border border-black p-1">{item.source}</td>
                    <td className="border border-black p-1">{item.detail}</td>
                    <td className="border border-black p-1 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="border border-black p-1 text-right">Total</td>
                  <td className="border border-black p-1 text-right">
                    {formatCurrency(data.finance.detailedIncome.reduce((sum, item) => sum + (item.amount || 0), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {data.finance.detailedExpense && data.finance.detailedExpense.length > 0 && (
          <div className="mt-4 break-inside-avoid">
            <h4 className="text-md font-bold mb-2">Rincian Pengeluaran</h4>
            <table className="w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1 text-left">Tanggal</th>
                  <th className="border border-black p-1 text-left">Tujuan</th>
                  <th className="border border-black p-1 text-left">Keterangan</th>
                  <th className="border border-black p-1 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {data.finance.detailedExpense.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-1">{item.date}</td>
                    <td className="border border-black p-1">{item.source}</td>
                    <td className="border border-black p-1">{item.detail}</td>
                    <td className="border border-black p-1 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="border border-black p-1 text-right">Total</td>
                  <td className="border border-black p-1 text-right">
                    {formatCurrency(data.finance.detailedExpense.reduce((sum, item) => sum + (item.amount || 0), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-300 pb-1">4. Administrasi Akademik</h3>
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-semibold w-1/2">Mahasiswa Aktif</td>
              <td className="border border-black p-2 text-right">{data.admin.activeStudents} Mahasiswa</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Drop Out (DO)</td>
              <td className="border border-black p-2 text-right">{data.admin.dropout} Mahasiswa</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Lulus</td>
              <td className="border border-black p-2 text-right">{data.admin.graduated} Mahasiswa</td>
            </tr>
          </tbody>
        </table>

        {data.admin.programs && data.admin.programs.length > 0 && (
          <div className="mt-4 break-inside-avoid">
            <h4 className="text-md font-bold mb-2">Rincian Jalur Input</h4>
            <table className="w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1 text-left w-2/3">Program / Jalur Input</th>
                  <th className="border border-black p-1 text-right w-1/3">Jumlah Mahasiswa</th>
                </tr>
              </thead>
              <tbody>
                {data.admin.programs.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-1">{item.label}</td>
                    <td className="border border-black p-1 text-right">{item.count}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="border border-black p-1 text-right">Total</td>
                  <td className="border border-black p-1 text-right">
                    {data.admin.programs.reduce((sum, item) => sum + (item.count || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {data.admin.studyPrograms && data.admin.studyPrograms.length > 0 && (
          <div className="mt-4 break-inside-avoid">
            <h4 className="text-md font-bold mb-2">Rincian Program Studi</h4>
            <table className="w-full border-collapse border border-black text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1 text-left w-2/3">Program Studi</th>
                  <th className="border border-black p-1 text-right w-1/3">Jumlah Mahasiswa</th>
                </tr>
              </thead>
              <tbody>
                {data.admin.studyPrograms.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-1">{item.label}</td>
                    <td className="border border-black p-1 text-right">{item.count}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="border border-black p-1 text-right">Total</td>
                  <td className="border border-black p-1 text-right">
                    {data.admin.studyPrograms.reduce((sum, item) => sum + (item.count || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HR */}
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-300 pb-1">5. Sumber Daya Manusia (HR)</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-semibold w-1/2">Karyawan Aktif</td>
              <td className="border border-black p-2 text-right">{data.hr.activeEmployees} Karyawan</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Resign</td>
              <td className="border border-black p-2 text-right">{data.hr.resigned} Karyawan</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">Rekrutmen Baru</td>
              <td className="border border-black p-2 text-right">{data.hr.recruited} Karyawan</td>
            </tr>
          </tbody>
        </table>
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

      {/* Signature */}
      <div className="mt-16 flex justify-end break-inside-avoid">
        <div className="text-center w-64">
          <p className="mb-1">{data.signature.city}, {data.signature.date}</p>
          <p className="mb-20">{data.signature.role}</p>
          <p className="font-bold underline">{data.signature.name}</p>
        </div>
      </div>
    </div>
  );
}
