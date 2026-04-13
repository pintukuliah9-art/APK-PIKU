import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatNumberInput = (val: number | string) => {
  if (!val) return '';
  const num = typeof val === 'string' ? parseNumberInput(val) : val;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const parseNumberInput = (val: string) => {
  if (!val) return 0;
  return Number(val.replace(/\D/g, ''));
};

export const parseDateSafe = (dateStr: string | undefined | null) => {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  const months: Record<string, string> = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'agu': '08', 'aug': '08', 'sep': '09', 'oct': '10', 'okt': '10',
    'nov': '11', 'dec': '12', 'des': '12'
  };

  const parts = dateStr.toLowerCase().split(/[\s-]/);
  if (parts.length >= 3) {
    let day = parts[0];
    let monthStr = parts[1];
    let year = parts[2];
    
    if (parts[0].length === 4) {
      year = parts[0];
      monthStr = parts[1];
      day = parts[2];
    }

    const month = months[monthStr] || monthStr;
    const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const parsed = new Date(isoStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

export const formatDateSafe = (dateStr: string | undefined | null, formatStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = parseDateSafe(dateStr);
    if (formatStr) {
      return format(d, formatStr, { locale: id });
    }
    return d.toLocaleDateString('id-ID');
  } catch (e) {
    return dateStr;
  }
};
