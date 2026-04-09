import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
