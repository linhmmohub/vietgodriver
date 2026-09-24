import React from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Wallet,
  CheckCircle2,
  HardHat,
  Shirt,
  ArrowDownRight,
  ArrowUpRight,
  Hourglass,
  Briefcase,
  Clock,
  Boxes
} from 'lucide-react';
import { Driver, ExpenseItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface StatsCardsProps {
  drivers: Driver[];
  expenses: ExpenseItem[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ drivers, expenses }) => {
  const totalDrivers = drivers.length;
  const approvedDrivers = drivers.filter(d => d.approvalStatus !== 'pending');
  const pendingDrivers = drivers.filter(d => d.approvalStatus === 'pending');
  const fulltimeCount = drivers.filter(d => (d.workingType || 'fulltime') === 'fulltime' && d.approvalStatus !== 'pending').length;
  const parttimeCount = drivers.filter(d => d.workingType === 'parttime' && d.approvalStatus !== 'pending').length;

  const activeDrivers = approvedDrivers.filter(d => !d.isRevoked);
  const totalHelmetsIssued = drivers.reduce((acc, d) => (d.hasHelmet && !d.revokedHelmet ? acc + (d.helmetQuantity || 1) : acc), 0);
  const totalShirtsIssued = drivers.reduce((acc, d) => (d.hasShirt && !d.revokedShirt ? acc + (d.shirtQuantity || 1) : acc), 0);
  const fullyEquippedCount = activeDrivers.filter(d => d.hasHelmet && d.hasShirt).length;

  // Tiền thu cọc
  const totalFeeCollected = drivers.reduce((acc, d) => acc + (d.uniformFeePaid || 0), 0);
  const totalFeeRequired = drivers.reduce((acc, d) => acc + (d.uniformFeeRequired || 0), 0);
  const unpaidFee = Math.max(0, totalFeeRequired - totalFeeCollected);
  const collectionRate = totalFeeRequired > 0 ? Math.round((totalFeeCollected / totalFeeRequired) * 100) : 100;

  // Thu hồi vi phạm & hoàn tiền
  const revokedDrivers = drivers.filter(d => d.isRevoked);
  const refundedAmount = revokedDrivers
    .filter(d => d.refundStatus === 'refunded')
    .reduce((acc, d) => acc + (d.refundAmount || 0), 0);
  const pendingRefundAmount = revokedDrivers
    .filter(d => d.refundStatus === 'pending')
    .reduce((acc, d) => acc + (d.refundAmount || 0), 0);

  // Chi tiêu nội bộ
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Quỹ ròng (Thu tiền cọc - Tiền hoàn lại - Chi phí nội bộ đã chi)
  const netFund = totalFeeCollected - refundedAmount - totalExpenses;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Thẻ 1: Tình trạng cấp đồng phục */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight text-slate-500 dark:text-slate-400">
              Đồng Phục & Tài Xế
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {approvedDrivers.length}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">chính thức</span>
            </div>
            {pendingDrivers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                <Hourglass className="w-2.5 h-2.5" />
                {pendingDrivers.length} chờ duyệt
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center">
              <Shirt className="w-3 h-3 mr-1 text-amber-500" />
              Đã cấp áo: <strong className="ml-1 text-slate-800 dark:text-slate-200">{totalShirtsIssued}</strong>
            </span>
            <span className="flex items-center">
              <HardHat className="w-3 h-3 mr-1 text-blue-500" />
              Đã cấp mũ: <strong className="ml-1 text-slate-800 dark:text-slate-200">{totalHelmetsIssued}</strong>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
            <span className="flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Đủ cả mũ + áo:
            </span>
            <span className="font-bold font-mono">{fullyEquippedCount} TX</span>
          </div>
        </div>
      </div>

      {/* Thẻ 2: Tiền thu đồng phục */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight text-slate-500 dark:text-slate-400">
              Tiền Cọc Đã Thu
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-base sm:text-xl md:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight truncate">
              {formatCurrency(totalFeeCollected)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Cần thu:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 font-mono text-[10px] sm:text-[11px]">
              {formatCurrency(totalFeeRequired)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-slate-500">Tỷ lệ nộp:</span>
            {unpaidFee > 0 ? (
              <span className="text-[10px] sm:text-[11px] text-rose-500 dark:text-rose-400 font-bold font-mono">
                Nợ {formatCurrency(unpaidFee)}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                100% Thu Đủ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Thẻ 3: Thu hồi vi phạm & Hoàn cọc */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight text-slate-500 dark:text-slate-400">
              Thu Hồi Vi Phạm
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {revokedDrivers.length}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">hồ sơ</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Đã hoàn:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[10px] sm:text-[11px]">
              {formatCurrency(refundedAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-slate-500">Chờ hoàn:</span>
            <span className={`text-[10px] sm:text-[11px] font-bold font-mono ${pendingRefundAmount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
              {formatCurrency(pendingRefundAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Thẻ 4: Sổ chi tiêu & Quỹ ròng */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight text-slate-500 dark:text-slate-400">
              Quỹ Ròng Hiện Tại
            </span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className={`text-base sm:text-xl md:text-2xl font-extrabold font-mono tracking-tight truncate ${netFund >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-500'}`}>
              {formatCurrency(netFund)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center">
              <ArrowDownRight className="w-3 h-3 text-rose-500 mr-0.5" />
              Tổng chi:
            </span>
            <span className="font-semibold text-rose-500 font-mono text-[10px] sm:text-[11px]">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Số giao dịch:</span>
            <span className="font-medium text-slate-600 dark:text-slate-300 font-mono">{expenses.length} khoản</span>
          </div>
        </div>
      </div>

    </div>
  );
};
