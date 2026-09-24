import React, { useState, useMemo } from 'react';
import { 
  Shirt, 
  HardHat, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Layers, 
  DollarSign, 
  FileText, 
  Printer, 
  Plus, 
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Boxes,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Driver, ExpenseItem, ShirtSize } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface UniformInventoryViewProps {
  drivers: Driver[];
  expenses: ExpenseItem[];
  onSelectDriver: (driver: Driver) => void;
  onOpenNewExpense?: () => void;
  onOpenNewDriver?: () => void;
}

export const UniformInventoryView: React.FC<UniformInventoryViewProps> = ({
  drivers,
  expenses,
  onSelectDriver,
  onOpenNewExpense,
  onOpenNewDriver,
}) => {
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<ShirtSize | 'all'>('all');
  const [inventorySearch, setInventorySearch] = useState('');

  // 1. Phân tích số liệu mũ bảo hiểm & thùng hàng
  const activeDrivers = drivers.filter((d) => !d.isRevoked && d.approvalStatus !== 'pending');
  const revokedDrivers = drivers.filter((d) => d.isRevoked);

  const totalHelmetsIssued = drivers.reduce((acc, d) => {
    if (d.hasHelmet && !d.revokedHelmet) {
      return acc + (d.helmetQuantity || 1);
    }
    return acc;
  }, 0);

  const totalHelmetsReturned = revokedDrivers.reduce((acc, d) => {
    if (d.revokedHelmet) return acc + (d.helmetQuantity || 1);
    return acc;
  }, 0);

  const driversNeedingHelmet = activeDrivers.filter((d) => !d.hasHelmet);

  // Phân tích số liệu thùng đựng hàng
  const totalBoxesIssued = drivers.reduce((acc, d) => {
    if (d.hasDeliveryBox !== false && !d.revokedBox) {
      return acc + (d.boxQuantity || 1);
    }
    return acc;
  }, 0);

  const totalBoxesReturned = revokedDrivers.reduce((acc, d) => {
    if (d.revokedBox) return acc + (d.boxQuantity || 1);
    return acc;
  }, 0);

  const driversNeedingBox = activeDrivers.filter((d) => d.hasDeliveryBox === false);

  // 2. Phân tích chi tiết áo đồng phục theo từng size
  const SIZES: ShirtSize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const sizeStats = useMemo(() => {
    const map: Record<ShirtSize, { issued: number; returned: number; activeDrivers: Driver[] }> = {
      S: { issued: 0, returned: 0, activeDrivers: [] },
      M: { issued: 0, returned: 0, activeDrivers: [] },
      L: { issued: 0, returned: 0, activeDrivers: [] },
      XL: { issued: 0, returned: 0, activeDrivers: [] },
      XXL: { issued: 0, returned: 0, activeDrivers: [] },
      '3XL': { issued: 0, returned: 0, activeDrivers: [] },
      'Chưa chọn': { issued: 0, returned: 0, activeDrivers: [] },
    };

    drivers.forEach((driver) => {
      const size = driver.shirtSize || 'Chưa chọn';
      const qty = driver.shirtQuantity || 1;

      if (driver.hasShirt && !driver.revokedShirt) {
        if (map[size]) {
          map[size].issued += qty;
          if (!driver.isRevoked) {
            map[size].activeDrivers.push(driver);
          }
        }
      }

      if (driver.isRevoked && driver.revokedShirt) {
        if (map[size]) {
          map[size].returned += qty;
        }
      }
    });

    return map;
  }, [drivers]);

  const totalShirtsIssued = drivers.reduce((acc, d) => {
    if (d.hasShirt && !d.revokedShirt) {
      return acc + (d.shirtQuantity || 1);
    }
    return acc;
  }, 0);

  const totalShirtsReturned = revokedDrivers.reduce((acc, d) => {
    if (d.revokedShirt) return acc + (d.shirtQuantity || 1);
    return acc;
  }, 0);

  const driversNeedingShirt = activeDrivers.filter((d) => !d.hasShirt);

  // 3. Chi phí nhập đồng phục & mũ bảo hiểm, thùng hàng từ sổ chi tiêu
  const uniformPurchases = expenses.filter(
    (e) => e.category === 'buy_uniform' || e.category === 'buy_helmet' || e.category === 'buy_delivery_box' || e.category === 'print_logo'
  );
  const totalUniformExpense = uniformPurchases.reduce((acc, e) => acc + (e.amount || 0), 0);

  // 4. Lọc tài xế theo size hoặc tìm kiếm
  const filteredDriverList = useMemo(() => {
    return drivers.filter((driver) => {
      if (selectedSizeFilter !== 'all') {
        if (driver.shirtSize !== selectedSizeFilter) return false;
      }
      if (inventorySearch.trim()) {
        const query = inventorySearch.toLowerCase();
        const match =
          driver.name.toLowerCase().includes(query) ||
          driver.code.toLowerCase().includes(query) ||
          driver.phone.toLowerCase().includes(query) ||
          (driver.shirtSize && driver.shirtSize.toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });
  }, [drivers, selectedSizeFilter, inventorySearch]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner: Thống kê tổng kho */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-4 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base leading-snug sm:text-xl font-black tracking-tight text-white">
                <span>Quản Lý Kho & Cấp Phát Trang Bị</span>
              </h2>
                <span className="mt-1 inline-flex max-w-full rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                  Áo • Mũ • Thùng hàng
                </span>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Kiểm soát số lượng Áo, Mũ bảo hiểm, Thùng đựng hàng đã phát và đã thu hồi về kho
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            {onOpenNewExpense && (
              <button
                onClick={onOpenNewExpense}
                className="min-h-11 justify-center px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Ghi Mua Trang Bị Mới</span>
              </button>
            )}
            {onOpenNewDriver && (
              <button
                onClick={onOpenNewDriver}
                className="min-h-11 justify-center px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Cấp Mới Cho Tài Xế</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Chỉ số cốt lõi */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800">
          
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-indigo-400" />
                Áo Đang Cấp:
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-indigo-400">
                {totalShirtsIssued}
              </span>
              <span className="text-xs text-slate-400 font-medium">cái đã phát</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Thu hồi về:</span>
              <span className="font-bold text-emerald-400">{totalShirtsReturned} cái</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-blue-400" />
                Mũ Đang Cấp:
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-blue-400">
                {totalHelmetsIssued}
              </span>
              <span className="text-xs text-slate-400 font-medium">cái đã phát</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Thu hồi về:</span>
              <span className="font-bold text-emerald-400">{totalHelmetsReturned} cái</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                Thùng Hàng Đang Cấp:
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-amber-400">
                {totalBoxesIssued}
              </span>
              <span className="text-xs text-slate-400 font-medium">thùng đã phát</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Thu hồi về:</span>
              <span className="font-bold text-emerald-400">{totalBoxesReturned} cái</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Chi Mua Trang Bị:
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 truncate">
                {formatCurrency(totalUniformExpense)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Số đợt mua:</span>
              <span className="font-bold text-slate-200">{uniformPurchases.length} hóa đơn</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Cần Cấp Bổ Sung:
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-black font-mono ${driversNeedingShirt.length > 0 || driversNeedingHelmet.length > 0 || driversNeedingBox.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {driversNeedingShirt.length + driversNeedingHelmet.length + driversNeedingBox.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">mục còn thiếu</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              <span className="font-bold text-amber-300">{driversNeedingShirt.length} áo / {driversNeedingHelmet.length} mũ / {driversNeedingBox.length} thùng</span>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Chi Tiết Phân Bổ Size Áo Đồng Phục */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Phân Bổ Kích Cỡ Áo Đồng Phục (Size Breakdown)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chạm vào từng Size để lọc nhanh danh sách các tài xế đang sử dụng kích cỡ đó
            </p>
          </div>

          {/* Quick Clear Filter */}
          {selectedSizeFilter !== 'all' && (
            <button
              onClick={() => setSelectedSizeFilter('all')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 self-start sm:self-auto hover:bg-amber-100 transition"
            >
              ✕ Xóa bộ lọc size ({selectedSizeFilter})
            </button>
          )}
        </div>

        {/* Size Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {SIZES.map((sz) => {
            const stat = sizeStats[sz];
            const isSelected = selectedSizeFilter === sz;
            const percentage = totalShirtsIssued > 0 ? Math.round((stat.issued / totalShirtsIssued) * 100) : 0;

            return (
              <button
                key={sz}
                onClick={() => setSelectedSizeFilter(isSelected ? 'all' : sz)}
                className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-amber-400/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Size</span>
                    <span className={`text-base font-black px-2 py-0.5 rounded-lg ${
                      isSelected 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      {sz}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {stat.issued}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      áo đang phát ({percentage}%)
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] space-y-0.5">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Thu hồi về:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{stat.returned}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tài xế đang mặc:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{stat.activeDrivers.length} TX</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bảng Danh Sách Tài Xế Theo Kích Cỡ & Tình Trạng Bàn Giao */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <span>
                Danh Sách Tài Xế & Trang Bị Đang Giữ
                {selectedSizeFilter !== 'all' && (
                  <span className="text-amber-500 ml-1.5 font-bold">(Đang lọc Size {selectedSizeFilter})</span>
                )}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hiển thị {filteredDriverList.length} hồ sơ tài xế
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên TX, mã số, size..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Mobile cards: each driver can be scanned and opened without horizontal table scrolling. */}
        <div className="space-y-2 md:hidden">
          {filteredDriverList.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center text-xs text-slate-400">Không tìm thấy tài xế phù hợp với bộ lọc hiện tại.</p>
          ) : filteredDriverList.map((driver) => {
            const isRevoked = driver.isRevoked;
            const hasHelmet = driver.hasHelmet && !driver.revokedHelmet;
            const hasShirt = driver.hasShirt && !driver.revokedShirt;
            const hasBox = driver.hasDeliveryBox !== false && !driver.revokedBox;
            return (
              <button
                type="button"
                key={driver.id}
                onClick={() => onSelectDriver(driver)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900 dark:text-white"><span className="mr-1.5 font-mono text-amber-600 dark:text-amber-400">{driver.code}</span>{driver.name}</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{driver.phone}{driver.licensePlate ? ` · ${driver.licensePlate}` : ''}</p></div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${isRevoked ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : driver.approvalStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>{isRevoked ? 'Đã thu hồi' : driver.approvalStatus === 'pending' ? 'Chờ duyệt' : 'Đang hoạt động'}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className={`rounded-xl p-2 text-center ${hasHelmet ? 'bg-blue-100/70 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' : 'bg-slate-200/70 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400'}`}><HardHat className="mx-auto h-4 w-4" /><p className="mt-1 text-[10px] font-bold">{hasHelmet ? `${driver.helmetQuantity || 1} mũ` : 'Chưa cấp'}</p></div>
                  <div className={`rounded-xl p-2 text-center ${hasShirt ? 'bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300' : 'bg-slate-200/70 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400'}`}><Shirt className="mx-auto h-4 w-4" /><p className="mt-1 text-[10px] font-bold">{hasShirt ? `${driver.shirtQuantity || 1} áo` : 'Chưa cấp'}</p></div>
                  <div className={`rounded-xl p-2 text-center ${hasBox ? 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' : 'bg-slate-200/70 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400'}`}><Package className="mx-auto h-4 w-4" /><p className="mt-1 text-[10px] font-bold">{hasBox ? `${driver.boxQuantity || 1} thùng` : 'Chưa cấp'}</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 text-[11px] dark:border-slate-700"><span className="text-slate-500 dark:text-slate-400">Size áo: <strong className="text-slate-800 dark:text-slate-200">{driver.shirtSize || 'Chưa chọn'}</strong> · Cọc: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(driver.uniformFeePaid || 0)}</strong></span><span className="inline-flex shrink-0 items-center gap-1 font-bold text-amber-600 dark:text-amber-400">Chi tiết<ArrowRight className="h-3.5 w-3.5" /></span></div>
              </button>
            );
          })}
        </div>

        {/* Desktop table view */}
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 md:block">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                <th className="py-2.5 px-3">Mã TX</th>
                <th className="py-2.5 px-3">Họ và Tên</th>
                <th className="py-2.5 px-3">Số Điện Thoại</th>
                <th className="py-2.5 px-3 text-center">Mũ Bảo Hiểm</th>
                <th className="py-2.5 px-3 text-center">Áo Đồng Phục</th>
                <th className="py-2.5 px-3 text-center">Thùng Hàng</th>
                <th className="py-2.5 px-3 text-center">Size Áo</th>
                <th className="py-2.5 px-3 text-right">Tiền Cọc Đã Thu</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDriverList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy tài xế nào phù hợp với bộ lọc size hoặc từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredDriverList.map((driver) => {
                  const isRevoked = driver.isRevoked;
                  const hasHelmet = driver.hasHelmet && !driver.revokedHelmet;
                  const hasShirt = driver.hasShirt && !driver.revokedShirt;
                  const hasBox = driver.hasDeliveryBox !== false && !driver.revokedBox;

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => onSelectDriver(driver)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {driver.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {driver.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {driver.phone}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {hasHelmet ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            ✓ {driver.helmetQuantity || 1} Mũ
                          </span>
                        ) : driver.isRevoked && driver.revokedHelmet ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Đã thu hồi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Chưa cấp
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {hasShirt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                            ✓ {driver.shirtQuantity || 1} Áo
                          </span>
                        ) : driver.isRevoked && driver.revokedShirt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Đã thu hồi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Chưa cấp
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {hasBox ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            ✓ {driver.boxQuantity || 1} Thùng
                          </span>
                        ) : driver.isRevoked && driver.revokedBox ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Đã thu hồi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Chưa cấp
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {driver.shirtSize || 'Chưa chọn'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(driver.uniformFeePaid || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isRevoked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            Nghỉ việc/Thu hồi
                          </span>
                        ) : driver.approvalStatus === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Đang chạy
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDriver(driver);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition inline-flex items-center gap-1"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
