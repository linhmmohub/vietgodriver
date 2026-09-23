import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Copy,
  AlertTriangle 
} from 'lucide-react';
import { Driver, ExpenseItem } from '../types';
import { INITIAL_DRIVERS, INITIAL_EXPENSES } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  expenses: ExpenseItem[];
  onRestoreData: (drivers: Driver[], expenses: ExpenseItem[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  drivers,
  expenses,
  onRestoreData,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentData = {
    version: '1.2',
    exportedAt: new Date().toISOString(),
    drivers,
    expenses,
  };

  const jsonString = JSON.stringify(currentData, null, 2);

  const handleDownloadBackup = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sao-luu-dong-phuc-tai-xe-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Đã tải tệp sao lưu JSON về máy!' });
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setStatusMsg({ type: 'success', text: 'Đã sao chép chuỗi JSON vào bộ nhớ đệm!' });
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.drivers) && Array.isArray(parsed.expenses)) {
          onRestoreData(parsed.drivers, parsed.expenses);
          setStatusMsg({ type: 'success', text: `Khôi phục thành công ${parsed.drivers.length} tài xế và ${parsed.expenses.length} khoản chi!` });
        } else {
          setStatusMsg({ type: 'error', text: 'Cấu trúc file JSON không hợp lệ.' });
        }
      } catch (err) {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Lỗi đọc file JSON. Vui lòng kiểm tra lại.' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (window.confirm('Khôi phục về dữ liệu mẫu ban đầu? Tất cả thay đổi hiện tại sẽ được thay thế.')) {
      onRestoreData(INITIAL_DRIVERS, INITIAL_EXPENSES);
      setStatusMsg({ type: 'success', text: 'Đã khôi phục dữ liệu mẫu thành công!' });
    }
  };

  return (
    <div 
      className="mobile-modal-frame fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="mobile-sheet bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sao Lưu & Khôi Phục Dữ Liệu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dữ liệu lưu an toàn trên trình duyệt, có thể xuất tệp khi đẩy lên Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {statusMsg && (
            <div className={`p-3 rounded-lg border flex items-center text-xs ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}>
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Số tài xế hiện có:</span>
              <strong className="text-slate-800 dark:text-slate-200">{drivers.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số khoản chi ghi chép:</span>
              <strong className="text-slate-800 dark:text-slate-200">{expenses.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-slate-800 dark:text-slate-200 transition shadow-xs"
            >
              <Download className="w-4 h-4 mr-2 text-emerald-500" />
              Tải file JSON backup
            </button>

            <button
              onClick={handleCopyClipboard}
              className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-slate-800 dark:text-slate-200 transition shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-500" />
                  Đã copy!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2 text-blue-500" />
                  Copy chuỗi JSON
                </>
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
              Khôi phục từ tệp sao lưu:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 font-medium text-slate-700 dark:text-slate-300 transition"
            >
              <Upload className="w-4 h-4 mr-2 text-blue-500" />
              Chọn file JSON từ máy để khôi phục
            </button>
          </div>

          <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400">
            <button
              onClick={handleResetSample}
              className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Nạp lại dữ liệu mẫu gốc
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-300 transition"
            >
              Đóng
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
