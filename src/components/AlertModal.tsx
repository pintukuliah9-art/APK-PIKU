import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${
            type === 'success' ? 'bg-green-100 text-green-600' :
            type === 'error' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
          <p className="text-center text-gray-500">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
