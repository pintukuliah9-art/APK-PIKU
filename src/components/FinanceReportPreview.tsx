import React from 'react';
import { FinanceReportData, BalanceItem } from '../types';

interface Props {
  data: FinanceReportData;
}

export function FinanceReportPreview({ data }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = (items: BalanceItem[]) => {
    return items.reduce((sum, item) => sum + item.nominal, 0);
  };

  const renderBalanceTable = (title: string, items: BalanceItem[], totalLabel: string) => {
    const total = calculateTotal(items);
    return (
      <div className="mb-4 break-inside-avoid">
        <h4 className="text-sm font-bold mb-2">{title}</h4>
        <table className="w-full border-collapse border-none text-sm mb-2">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1 w-12">No</th>
              <th className="text-left py-1">Uraian</th>
              <th className="text-right py-1 w-48">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-1">{index + 1}</td>
                <td className="py-1">{item.uraian}</td>
                <td className="text-right py-1">{formatCurrency(item.nominal)}</td>
              </tr>
            ))}
            <tr className="font-bold border-t border-black">
              <td colSpan={2} className="py-2">{totalLabel}</td>
              <td className="text-right py-2">{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderSection = (title: string, sectionData: FinanceReportData['pintuKuliah']) => {
    const totalAsetLancar = calculateTotal(sectionData.asetLancar);
    const totalAsetTetap = calculateTotal(sectionData.asetTetap);
    const totalAset = totalAsetLancar + totalAsetTetap;

    const totalKewajiban = calculateTotal(sectionData.kewajiban);
    const totalEkuitas = calculateTotal(sectionData.ekuitas);
    const totalPassiva = totalKewajiban + totalEkuitas;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 uppercase">{title}</h3>
        
        <div className="mb-6">
          <h4 className="text-md font-bold mb-2">1. ASET</h4>
          {renderBalanceTable('Aset Lancar', sectionData.asetLancar, 'Total Aset Lancar')}
          {renderBalanceTable('Aset Tetap', sectionData.asetTetap, 'Total Aset Tetap')}
          
          <table className="w-full border-collapse border-none text-sm font-bold mt-4 break-inside-avoid">
            <tbody>
              <tr className="border-y-2 border-black">
                <td className="py-2">TOTAL ASET {title.split(' - ')[1]}</td>
                <td className="text-right py-2 w-48">{formatCurrency(totalAset)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6 break-inside-avoid">
          <h4 className="text-md font-bold mb-2">2. KEWAJIBAN</h4>
          {renderBalanceTable('', sectionData.kewajiban, 'Total Kewajiban')}
        </div>

        <div className="mb-6 break-inside-avoid">
          <h4 className="text-md font-bold mb-2">3. EKUITAS</h4>
          {renderBalanceTable('', sectionData.ekuitas, 'Total Ekuitas')}
        </div>

        <div className="mb-6 break-inside-avoid">
          <h4 className="text-md font-bold mb-2">4. TOTAL PASSIVA</h4>
          <table className="w-full border-collapse border-none text-sm mb-2">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-1">Uraian</th>
                <th className="text-right py-1 w-48">Nominal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-1">Total Kewajiban</td>
                <td className="text-right py-1">{formatCurrency(totalKewajiban)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1">Total Ekuitas</td>
                <td className="text-right py-1">{formatCurrency(totalEkuitas)}</td>
              </tr>
              <tr className="font-bold border-y-2 border-black">
                <td className="py-2">TOTAL PASSIVA {title.split(' - ')[1]}</td>
                <td className="text-right py-2">{formatCurrency(totalPassiva)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRekapGabungan = () => {
    const pkAsetLancar = calculateTotal(data.pintuKuliah.asetLancar);
    const pkAsetTetap = calculateTotal(data.pintuKuliah.asetTetap);
    const pkTotalAset = pkAsetLancar + pkAsetTetap;
    const pkKewajiban = calculateTotal(data.pintuKuliah.kewajiban);
    const pkEkuitas = calculateTotal(data.pintuKuliah.ekuitas);
    const pkTotalPassiva = pkKewajiban + pkEkuitas;

    const ksAsetLancar = calculateTotal(data.kunciSarjana.asetLancar);
    const ksAsetTetap = calculateTotal(data.kunciSarjana.asetTetap);
    const ksTotalAset = ksAsetLancar + ksAsetTetap;
    const ksKewajiban = calculateTotal(data.kunciSarjana.kewajiban);
    const ksEkuitas = calculateTotal(data.kunciSarjana.ekuitas);
    const ksTotalPassiva = ksKewajiban + ksEkuitas;

    return (
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold mb-4 uppercase">C. REKAP NERACA GABUNGAN</h3>
        <table className="w-full border-collapse border-none text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-2">Uraian</th>
              <th className="text-right py-2 w-32">Pintu Kuliah</th>
              <th className="text-right py-2 w-32">Kunci Sarjana</th>
              <th className="text-right py-2 w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">Total Aset Lancar</td>
              <td className="text-right py-2">{formatCurrency(pkAsetLancar)}</td>
              <td className="text-right py-2">{formatCurrency(ksAsetLancar)}</td>
              <td className="text-right py-2">{formatCurrency(pkAsetLancar + ksAsetLancar)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Total Aset Tetap</td>
              <td className="text-right py-2">{formatCurrency(pkAsetTetap)}</td>
              <td className="text-right py-2">{formatCurrency(ksAsetTetap)}</td>
              <td className="text-right py-2">{formatCurrency(pkAsetTetap + ksAsetTetap)}</td>
            </tr>
            <tr className="font-bold border-b border-black">
              <td className="py-2">TOTAL ASET</td>
              <td className="text-right py-2">{formatCurrency(pkTotalAset)}</td>
              <td className="text-right py-2">{formatCurrency(ksTotalAset)}</td>
              <td className="text-right py-2">{formatCurrency(pkTotalAset + ksTotalAset)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Total Kewajiban</td>
              <td className="text-right py-2">{formatCurrency(pkKewajiban)}</td>
              <td className="text-right py-2">{formatCurrency(ksKewajiban)}</td>
              <td className="text-right py-2">{formatCurrency(pkKewajiban + ksKewajiban)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Total Ekuitas</td>
              <td className="text-right py-2">{formatCurrency(pkEkuitas)}</td>
              <td className="text-right py-2">{formatCurrency(ksEkuitas)}</td>
              <td className="text-right py-2">{formatCurrency(pkEkuitas + ksEkuitas)}</td>
            </tr>
            <tr className="font-bold border-y-2 border-black">
              <td className="py-2">TOTAL PASSIVA</td>
              <td className="text-right py-2">{formatCurrency(pkTotalPassiva)}</td>
              <td className="text-right py-2">{formatCurrency(ksTotalPassiva)}</td>
              <td className="text-right py-2">{formatCurrency(pkTotalPassiva + ksTotalPassiva)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="report-page bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-lg mx-auto text-black relative font-serif">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wider">LAPORAN NERACA KEUANGAN</h1>
        <h2 className="text-xl font-bold uppercase tracking-wider mt-1">PINTU KULIAH & KUNCI SARJANA</h2>
        
        <div className="mt-8 border-t-4 border-b border-black py-1"></div>
      </div>

      <div className="mb-6">
        <p className="font-bold">Periode: {data.periodeLaporan}</p>
      </div>

      {renderSection('A. NERACA KEUANGAN - PINTU KULIAH', data.pintuKuliah)}
      {renderSection('B. NERACA KEUANGAN - KUNCI SARJANA', data.kunciSarjana)}
      
      {renderRekapGabungan()}

      {/* Lampiran Link */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold mb-4 uppercase">D. CONTOH LAMPIRAN LINK</h3>
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
          
          <div className="relative flex justify-center items-center h-20 mb-2">
            {data.signature.signatureImage && (
              <img 
                src={data.signature.signatureImage} 
                alt="Signature" 
                className="absolute max-h-24 z-10"
                style={{ top: '-40px' }}
              />
            )}
            {data.signature.stampImage && (
              <img 
                src={data.signature.stampImage} 
                alt="Stamp" 
                className="absolute max-h-24 opacity-80 z-0"
                style={{ top: '-30px', left: '20px' }}
              />
            )}
          </div>
          
          <p className="font-bold underline">{data.signature.name}</p>
        </div>
      </div>
    </div>
  );
}
