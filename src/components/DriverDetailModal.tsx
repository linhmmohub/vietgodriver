import React from 'react';
import { 
  X, 
  User, 
  HardHat, 
  Shirt, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Phone, 
  Calendar,
  CreditCard,
  Edit2
} from 'lucide-react';
import { Driver } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DriverDetailModalProps {
  driver: Driver | null;
  onClose: () => void;
  onEdit: (driver: Driver) => void;
}

export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({
  driver,
  onClose,
  onEdit,
}) => {
  if (!driver) return null;

  const debt = Math.max(0, driver.uniformFeeRequired - driver.uniformFeePaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:max-w-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hồ Sơ Cấp Phát & Tiền Cọc
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono text-xs font-bold">
              {driver.code}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrint}
              title="In phiếu này"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">In phiếu</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Driver Title Card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {driver.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-500 dark:text-slate-400 mt-1.5 text-xs">
                {/* Direct Call Link */}
                <a 
                  href={`tel:${driver.phone}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800"
                >
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  {driver.phone} (Gọi ngay)
                </a>

                {driver.licensePlate && (
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                    {driver.licensePlate}
                  </span>
                )}
                {driver.joinDate && (
                  <span className="flex items-center text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Vào làm: {formatDate(driver.joinDate)}
                  </span>
                )}
              </div>
            </div>

            <div>
              {driver.isRevoked ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  BỊ THU HỒI ĐỒNG PHỤC
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Đang hoạt động
                </span>
              )}
            </div>
          </div>

          {/* Grid thông tin cấp phát & tiền thu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Cấp phát Mũ & Áo */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center">
                <Shirt className="w-4 h-4 mr-1.5 text-indigo-500" />
                Trang Bị Đồng Phục Đã Cấp
              </h3>

              <div className="space-y-2.5">
                {/* Mũ bảo hiểm */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <HardHat className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Mũ bảo hiểm:</span>
                  </div>
                  <div>
                    {driver.hasHelmet ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Đã cấp ({driver.helmetQuantity || 1} cái)
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Chưa cấp mũ
                      </span>
                    )}
                  </div>
                </div>

                {/* Áo đồng phục */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Shirt className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Áo đồng phục:</span>
                  </div>
                  <div>
                    {driver.hasShirt ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Size {driver.shirtSize} ({driver.shirtQuantity || 1} áo)
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Chưa cấp áo
                      </span>
                    )}
                  </div>
                </div>

                {driver.otherItems && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Phụ kiện khác:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{driver.otherItems}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Tiền cọc */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" />
                Tài Chính / Tiền Thu Cọc
              </h3>

              <div className="space-y-2.5 font-mono">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Tiền cọc quy định:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(driver.uniformFeeRequired)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Số tiền thực tế ĐÃ THU:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(driver.uniformFeePaid)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Còn nợ:</span>
                  {debt > 0 ? (
                    <span className="font-bold text-rose-500">
                      {formatCurrency(debt)}
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans text-xs">
                      Đã nộp đủ 100%
                    </span>
                  )}
                </div>

                {driver.paymentNote && (
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-sans text-slate-500 italic">
                    Ghi chú thu tiền: {driver.paymentNote}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Box 3: THU HỒI VI PHẠM & HOÀN TIỀN (NẾU CÓ) */}
          {driver.isRevoked && (
            <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <h3 className="font-bold text-rose-800 dark:text-rose-300 text-xs uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-600" />
                Hồ Sơ Thu Hồi & Hoàn Tiền Vi Phạm
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Lý do thu hồi:</span>
                  <strong className="text-rose-600 dark:text-rose-400">{driver.revocationReason}</strong>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Ngày thu hồi:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {driver.revocationDate ? formatDate(driver.revocationDate) : 'Chưa ghi ngày'}
                  </span>
                </div>
              </div>

              {driver.revocationReasonDetail && (
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 block mb-0.5">Chi tiết vi phạm:</span>
                  <p className="text-slate-700 dark:text-slate-300">{driver.revocationReasonDetail}</p>
                </div>
              )}

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-slate-600 dark:text-slate-400">Tình trạng thu hồi hiện vật:</span>
                  <span className="font-semibold">
                    Mũ: {driver.revokedHelmet ? '✅ Đã trả' : '❌ Chưa trả'} | Áo: {driver.revokedShirt ? '✅ Đã trả' : '❌ Chưa trả'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-slate-100 dark:border-slate-700 gap-1">
                  <span className="text-slate-600 dark:text-slate-400">Tình trạng hoàn tiền:</span>
                  {driver.refundStatus === 'refunded' ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Đã hoàn: {formatCurrency(driver.refundAmount)} {driver.refundDate ? `(${formatDate(driver.refundDate)})` : ''}
                    </span>
                  ) : driver.refundStatus === 'pending' ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      Chờ hoàn: {formatCurrency(driver.refundAmount)} (Chờ bàn giao đủ đồ)
                    </span>
                  ) : (
                    <span className="font-medium text-slate-500">
                      Không hoàn tiền (Khấu trừ vi phạm)
                    </span>
                  )}
                </div>

                {driver.refundNote && (
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    Ghi chú hoàn/khấu trừ: {driver.refundNote}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ghi chú chung */}
          {driver.generalNote && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Ghi chú chung:</span>
              <p className="text-slate-800 dark:text-slate-200">{driver.generalNote}</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 print:hidden gap-2">
          <span className="text-[11px] text-slate-400 truncate">
            Cập nhật: {formatDate(driver.updatedAt)}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(driver);
              }}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Sửa thông tin
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
