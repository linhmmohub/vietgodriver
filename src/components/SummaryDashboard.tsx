import React from 'react';
import { 
  DollarSign, 
  HardHat, 
  Shirt, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import { Driver, ExpenseItem, ShirtSize } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SummaryDashboardProps {
  drivers: Driver[];
  expenses: ExpenseItem[];
  onSelectDriver: (driver: Driver) => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  drivers,
  expenses,
  onSelectDriver,
}) => {
  // Financial calculations
  const totalCollected = drivers.reduce((acc, d) => acc + (d.uniformFeePaid || 0), 0);
  const totalRefunded = drivers
    .filter(d => d.isRevoked && d.refundStatus === 'refunded')
    .reduce((acc, d) => acc + (d.refundAmount || 0), 0);
  const totalExpenseSpending = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netFund = totalCollected - totalRefunded - totalExpenseSpending;

  // Pending debts & refunds
  const totalDebt = drivers.reduce((acc, d) => acc + Math.max(0, d.uniformFeeRequired - d.uniformFeePaid), 0);
  const pendingRefundTotal = drivers
    .filter(d => d.isRevoked && d.refundStatus === 'pending')
    .reduce((acc, d) => acc + (d.refundAmount || 0), 0);

  // Uniform Stats
  const activeDrivers = drivers.filter(d => !d.isRevoked);
  const totalHelmetsIssued = drivers.filter(d => d.hasHelmet && !d.revokedHelmet).reduce((acc, d) => acc + (d.helmetQuantity || 1), 0);
  const totalShirtsIssued = drivers.filter(d => d.hasShirt && !d.revokedShirt).reduce((acc, d) => acc + (d.shirtQuantity || 1), 0);

  // Shirt size distribution
  const sizeCounts: Record<ShirtSize, number> = {
    'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, '3XL': 0, 'Chưa chọn': 0
  };
  drivers.forEach(d => {
    if (d.hasShirt && !d.revokedShirt && d.shirtSize) {
      sizeCounts[d.shirtSize] = (sizeCounts[d.shirtSize] || 0) + (d.shirtQuantity || 1);
    }
  });

  // Action Items:
  // 1. Revoked drivers who haven't returned items
  const driversNeedingReturn = drivers.filter(d => d.isRevoked && (!d.revokedHelmet || !d.revokedShirt));
  
  // 2. Drivers pending refund
  const driversPendingRefund = drivers.filter(d => d.isRevoked && d.refundStatus === 'pending');

  // 3. Drivers with debt
  const driversWithDebt = drivers.filter(d => d.paymentStatus !== 'paid' && !d.isRevoked);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Báo cáo dòng tiền tổng hợp */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5 flex items-center">
          <Wallet className="w-4 h-4 mr-2 text-emerald-500" />
          Báo Cáo Cân Đối Thu - Chi Quỹ Đồng Phục
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Tổng thu cọc */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
              <span>(1) Tổng thu cọc</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              +{formatCurrency(totalCollected)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-600/80 mt-1">
              Từ {drivers.filter(d => d.uniformFeePaid > 0).length} tài xế đã nộp
            </p>
          </div>

          {/* Tổng tiền hoàn lại */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
              <span>(2) Tiền hoàn cọc</span>
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              -{formatCurrency(totalRefunded)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-amber-600/80 mt-1">
              Đã chi trả cho tài xế nghỉ việc/vi phạm
            </p>
          </div>

          {/* Tổng chi nội bộ mua sắm */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold mb-1">
              <span>(3) Chi phí nội bộ</span>
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              -{formatCurrency(totalExpenseSpending)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-rose-600/80 mt-1">
              May áo, mua mũ, in ấn logo & ship
            </p>
          </div>

          {/* Quỹ ròng còn lại */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 shadow-xs">
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>(4) Tồn Quỹ Ròng</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-xl sm:text-2xl font-extrabold font-mono ${netFund >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatCurrency(netFund)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              (1) Thu - (2) Hoàn - (3) Chi
            </p>
          </div>

        </div>

        {/* Chú thích nợ & chờ hoàn */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="text-slate-600 dark:text-slate-400">
            Tiền tài xế đang còn nợ: <strong className="text-rose-500 font-bold font-mono">{formatCurrency(totalDebt)}</strong>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Tiền chờ hoàn khi bàn giao đủ đồ: <strong className="text-amber-500 font-bold font-mono">{formatCurrency(pendingRefundTotal)}</strong>
          </div>
        </div>
      </div>

      {/* Kho đồ & Phân bổ Size Áo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Box thống kê hiện vật */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center">
            <HardHat className="w-4 h-4 mr-2 text-amber-500" />
            Tình Hình Cấp Phát Mũ & Áo Thực Tế
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Tổng Mũ đang giữ
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono">
                {totalHelmetsIssued}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">mũ bảo hiểm</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Tổng Áo đang giữ
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-500 font-mono">
                {totalShirtsIssued}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">áo đồng phục</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Tài xế đang hoạt động:</span>
              <span className="font-semibold text-emerald-600 font-mono">{activeDrivers.length} người</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Tài xế bị thu hồi đồng phục:</span>
              <span className="font-semibold text-rose-500 font-mono">{drivers.filter(d => d.isRevoked).length} người</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tỷ lệ trang bị đủ cả mũ & áo:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {activeDrivers.length > 0 
                  ? `${Math.round((activeDrivers.filter(d => d.hasHelmet && d.hasShirt).length / activeDrivers.length) * 100)}%` 
                  : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Phân bổ Size Áo */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center">
            <Shirt className="w-4 h-4 mr-2 text-indigo-500" />
            Phân Bổ Size Áo Đồng Phục Của Tài Xế
          </h2>

          <div className="space-y-2.5">
            {(['S', 'M', 'L', 'XL', 'XXL', '3XL'] as ShirtSize[]).map((size) => {
              const count = sizeCounts[size] || 0;
              const percent = totalShirtsIssued > 0 ? Math.round((count / totalShirtsIssued) * 100) : 0;

              return (
                <div key={size} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Size {size}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {count} áo ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-4 italic">
            * Dữ liệu giúp lên kế hoạch đặt may số lượng size phù hợp cho các đợt bổ sung tiếp theo.
          </p>
        </div>

      </div>

      {/* DANH SÁCH VIỆC CẦN XỬ LÝ GẤP */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-4 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Hồ Sơ Cần Đôn Đốc / Xử Lý Ngay ({driversNeedingReturn.length + driversPendingRefund.length + driversWithDebt.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Cột 1: Cần thu hồi đồ */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
            <h3 className="font-bold text-xs text-rose-700 dark:text-rose-400 mb-2 flex items-center justify-between">
              <span>Chưa trả đủ Mũ/Áo vi phạm</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-mono">
                {driversNeedingReturn.length}
              </span>
            </h3>
            {driversNeedingReturn.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có tài xế nào còn nợ đồ</p>
            ) : (
              <div className="space-y-2">
                {driversNeedingReturn.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => onSelectDriver(d)}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-400 cursor-pointer text-xs transition shadow-2xs"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{d.name} ({d.code})</div>
                    <div className="text-[10px] text-rose-600 mt-0.5">
                      Thiếu: {!d.revokedHelmet ? 'Mũ bảo hiểm ' : ''} {!d.revokedShirt ? 'Áo đồng phục' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột 2: Chờ hoàn tiền */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
            <h3 className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-2 flex items-center justify-between">
              <span>Đang chờ hoàn cọc</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-mono">
                {driversPendingRefund.length}
              </span>
            </h3>
            {driversPendingRefund.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có khoản cọc nào chờ hoàn</p>
            ) : (
              <div className="space-y-2">
                {driversPendingRefund.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => onSelectDriver(d)}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer text-xs transition shadow-2xs"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{d.name} ({d.code})</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5 font-mono">
                      Chờ hoàn: {formatCurrency(d.refundAmount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột 3: Chưa thu đủ tiền cọc */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20">
            <h3 className="font-bold text-xs text-orange-700 dark:text-orange-400 mb-2 flex items-center justify-between">
              <span>Còn nợ tiền đồng phục</span>
              <span className="px-1.5 py-0.5 rounded-full bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-[10px] font-mono">
                {driversWithDebt.length}
              </span>
            </h3>
            {driversWithDebt.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tất cả tài xế đã nộp đủ tiền</p>
            ) : (
              <div className="space-y-2">
                {driversWithDebt.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => onSelectDriver(d)}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 cursor-pointer text-xs transition shadow-2xs"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{d.name} ({d.code})</div>
                    <div className="text-[10px] text-rose-500 font-semibold mt-0.5 font-mono">
                      Còn nợ: {formatCurrency(d.uniformFeeRequired - d.uniformFeePaid)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
