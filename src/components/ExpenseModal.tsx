import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Receipt, 
  Upload, 
  Trash2, 
  Save, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { ExpenseItem } from '../types';
import { getTodayDateString, compressImage } from '../utils/formatters';
import { CurrencyInput } from './CurrencyInput';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseItem) => void;
  expenseToEdit: ExpenseItem | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
}) => {
  const [date, setDate] = useState(getTodayDateString());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('buy_uniform');
  const [amount, setAmount] = useState(500000);
  const [recipient, setRecipient] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date || getTodayDateString());
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount || 0);
      setRecipient(expenseToEdit.recipient || '');
      setInternalNote(expenseToEdit.internalNote || '');
      setReceiptImageUrl(expenseToEdit.receiptImageUrl || '');
      setErrorMsg('');
    } else {
      setDate(getTodayDateString());
      setTitle('');
      setCategory('buy_uniform');
      setAmount(0);
      setRecipient('');
      setInternalNote('');
      setReceiptImageUrl('');
      setErrorMsg('');
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }
    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressedDataUrl = await compressImage(file, 1280, 0.75);
      setReceiptImageUrl(compressedDataUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể xử lý ảnh này. Vui lòng thử lại.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên/nội dung khoản chi.');
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền chi lớn hơn 0.');
      return;
    }

    const item: ExpenseItem = {
      id: expenseToEdit ? expenseToEdit.id : `exp-${Date.now()}`,
      date,
      title: title.trim(),
      category,
      amount: Number(amount),
      recipient: recipient.trim(),
      internalNote: internalNote.trim(),
      receiptImageUrl,
      createdAt: expenseToEdit ? expenseToEdit.createdAt : new Date().toISOString(),
    };

    onSave(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {expenseToEdit ? 'Chỉnh sửa khoản chi' : 'Ghi nhận khoản chi tiêu nội bộ mới'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Note chi phí mua đồng phục, hoàn tiền, đính kèm ảnh bill chuyển khoản
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center text-xs">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Ngày chi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Danh mục chi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="buy_uniform">👕 Mua / May Áo đồng phục</option>
                <option value="buy_helmet">🪖 Mua Mũ bảo hiểm</option>
                <option value="print_logo">🏷️ In ấn logo / Thẻ tài xế</option>
                <option value="refund_driver">💸 Hoàn tiền cọc cho tài xế</option>
                <option value="warehouse_shipping">📦 Chi phí kho bãi / Vận chuyển</option>
                <option value="other">📌 Chi phí khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Tên khoản chi / Mục đích chi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Mua 50 áo thun đồng phục size L, XL"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Số tiền chi (VND) <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                id="expense-amount"
                value={amount}
                onChange={setAmount}
                presets={[200000, 500000, 1000000, 2000000, 5000000]}
                className="text-sm font-bold text-rose-600 dark:text-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Người nhận / Đơn vị cung cấp
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="VD: Xưởng may Tân Tiến, Tài xế Lê Văn A..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Ghi chú nội bộ */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Ghi chú nội bộ (Lý do chi, số hóa đơn, thỏa thuận...)
            </label>
            <textarea
              rows={2}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="VD: Đơn giá 95k/cái, chuyển khoản cọc trước 50%, số còn lại thanh toán khi nhận đủ hàng..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* UPLOAD ẢNH CHUYỂN KHOẢN / BIÊN LAI */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-1 text-emerald-500" />
                Ảnh chụp màn hình chuyển khoản / Hóa đơn chứng từ
              </span>
              {receiptImageUrl && (
                <button
                  type="button"
                  onClick={() => setReceiptImageUrl('')}
                  className="text-[11px] text-rose-500 hover:text-rose-600 inline-flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Xóa ảnh
                </button>
              )}
            </label>

            {receiptImageUrl ? (
              <div className="relative group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950/5 dark:bg-slate-800/40 p-2 flex items-center justify-center">
                <img
                  src={receiptImageUrl}
                  alt="Ảnh hóa đơn"
                  className="max-h-56 rounded-lg object-contain shadow-xs"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-medium hover:bg-slate-100 shadow-md"
                  >
                    Đổi ảnh khác
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptImageUrl('')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 shadow-md"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl p-5 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isCompressing ? 'Đang nén và xử lý ảnh...' : 'Nhấn để chọn ảnh hoặc kéo thả ảnh biên lai vào đây'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hỗ trợ ảnh chụp màn hình ngân hàng, bill VietQR, phiếu thu (JPG, PNG)
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              id="btn-save-expense-submit"
              type="submit"
              disabled={isCompressing}
              className="inline-flex items-center px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              {expenseToEdit ? 'Cập nhật khoản chi' : 'Lưu khoản chi'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
