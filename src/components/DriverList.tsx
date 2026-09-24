import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HardHat, 
  Shirt, 
  Package,
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Edit2, 
  Trash2, 
  Eye, 
  Phone, 
  Calendar,
  X,
  Plus,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  Check,
  Briefcase,
  Clock,
  Hourglass,
  UserCheck,
  Key
} from 'lucide-react';
import { Driver, DriverWorkflowSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DriverListProps {
  drivers: Driver[];
  onEditDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
  onViewDriver: (driver: Driver) => void;
  onAddNewDriver: () => void;
  onApproveDriver?: (driver: Driver) => void;
  canDelete?: boolean;
  driverWorkflowSettings?: DriverWorkflowSettings;
}

type FilterCategory = 
  | 'all' 
  | 'pending_approval'
  | 'fulltime'
  | 'parttime'
  | 'active' 
  | 'revoked' 
  | 'need_helmet' 
  | 'need_shirt' 
  | 'need_box'
  | 'debt' 
  | 'pending_refund';
type ViewMode = 'cards' | 'table';

export const DriverList: React.FC<DriverListProps> = ({
  drivers,
  onEditDriver,
  onDeleteDriver,
  onViewDriver,
  onAddNewDriver,
  onApproveDriver,
  canDelete = false,
  driverWorkflowSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState('all');

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      // Search term matching
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        driver.name.toLowerCase().includes(term) ||
        driver.code.toLowerCase().includes(term) ||
        driver.phone.toLowerCase().includes(term) ||
        (driver.licensePlate && driver.licensePlate.toLowerCase().includes(term)) ||
        (driver.generalNote && driver.generalNote.toLowerCase().includes(term)) ||
        (driver.rejectionReason && driver.rejectionReason.toLowerCase().includes(term));

      if (!matchSearch) return false;
      if (workflowStatusFilter !== 'all' && driver.approvalStatus !== workflowStatusFilter) return false;

      // Filter matching
      switch (filter) {
        case 'pending_approval':
          return driver.approvalStatus === 'pending';
        case 'fulltime':
          return (driver.workingType || 'fulltime') === 'fulltime' && driver.approvalStatus !== 'pending';
        case 'parttime':
          return driver.workingType === 'parttime' && driver.approvalStatus !== 'pending';
        case 'active':
          return !driver.isRevoked && driver.approvalStatus !== 'pending';
        case 'revoked':
          return driver.isRevoked;
        case 'need_helmet':
          return !driver.hasHelmet && !driver.isRevoked && driver.approvalStatus !== 'pending';
        case 'need_shirt':
          return !driver.hasShirt && !driver.isRevoked && driver.approvalStatus !== 'pending';
        case 'need_box':
          return !driver.hasDeliveryBox && !driver.isRevoked && driver.approvalStatus !== 'pending';
        case 'debt':
          return driver.paymentStatus !== 'paid';
        case 'pending_refund':
          return driver.isRevoked && driver.refundStatus === 'pending';
        default:
          return true;
      }
    });
  }, [drivers, searchTerm, filter, workflowStatusFilter]);

  return (
    <div className="space-y-4">
      
      {/* Thanh tìm kiếm & bộ lọc */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          
          {/* Input search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-driver-input"
              type="text"
              placeholder="Tìm theo tên tài xế, SĐT, mã TX, biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select value={workflowStatusFilter} onChange={(e) => setWorkflowStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">Tất cả trạng thái hồ sơ</option>
            {(driverWorkflowSettings?.approvalStatuses || []).filter(item => item.isActive).sort((a, b) => a.order - b.order).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>

          {/* Controls: Count & View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Tìm thấy: <strong className="text-slate-900 dark:text-slate-100 font-mono">{filteredDrivers.length}</strong>/{drivers.length}
            </span>

            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs flex items-center transition ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Xem dạng thẻ (phù hợp điện thoại & máy tính bảng)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-xs">Thẻ</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`hidden sm:flex p-1.5 rounded-lg text-xs items-center transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Xem dạng bảng (phù hợp máy tính)"
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-xs">Bảng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({drivers.length})
          </button>

          <button
            onClick={() => setFilter('pending_approval')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 flex items-center gap-1.5 ${
              filter === 'pending_approval'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            Chờ duyệt / Dự bị ({drivers.filter(d => d.approvalStatus === 'pending').length})
          </button>

          <button
            onClick={() => setFilter('fulltime')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 flex items-center gap-1.5 ${
              filter === 'fulltime'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Full-time ({drivers.filter(d => (d.workingType || 'fulltime') === 'fulltime' && d.approvalStatus !== 'pending').length})
          </button>

          <button
            onClick={() => setFilter('parttime')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 flex items-center gap-1.5 ${
              filter === 'parttime'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Part-time ({drivers.filter(d => d.workingType === 'parttime' && d.approvalStatus !== 'pending').length})
          </button>

          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Đang hoạt động ({drivers.filter(d => !d.isRevoked && d.approvalStatus !== 'pending').length})
          </button>

          <button
            onClick={() => setFilter('revoked')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'revoked'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            Bị thu hồi ({drivers.filter(d => d.isRevoked).length})
          </button>

          <button
            onClick={() => setFilter('need_helmet')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'need_helmet'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Thiếu Mũ ({drivers.filter(d => !d.hasHelmet && !d.isRevoked).length})
          </button>

          <button
            onClick={() => setFilter('need_shirt')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'need_shirt'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Thiếu Áo ({drivers.filter(d => !d.hasShirt && !d.isRevoked).length})
          </button>

          <button
            onClick={() => setFilter('need_box')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'need_box'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Thiếu Thùng ({drivers.filter(d => (d.hasDeliveryBox === false || !d.hasDeliveryBox) && !d.isRevoked).length})
          </button>

          <button
            onClick={() => setFilter('debt')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'debt'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            }`}
          >
            Còn nợ tiền ({drivers.filter(d => d.paymentStatus !== 'paid').length})
          </button>

          <button
            onClick={() => setFilter('pending_refund')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              filter === 'pending_refund'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            Chờ hoàn cọc ({drivers.filter(d => d.isRevoked && d.refundStatus === 'pending').length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Không tìm thấy tài xế nào
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Không có hồ sơ nào trùng khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
          </p>
          <button
            onClick={onAddNewDriver}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm tài xế ngay
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* DẠNG THẺ (CARDS VIEW) - Cực chuẩn cho mobile & máy tính bảng */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredDrivers.map((driver) => {
            const debt = Math.max(0, driver.uniformFeeRequired - driver.uniformFeePaid);

            return (
              <div
                key={driver.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  driver.isRevoked
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header Card */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-inner ${
                        driver.isRevoked
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}>
                        {driver.code.replace('TX-', '')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 
                            onClick={() => onViewDriver(driver)}
                            className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-amber-500 cursor-pointer"
                          >
                            {driver.name}
                          </h3>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                            {driver.code}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                          {/* Số điện thoại tap-to-call */}
                          <a 
                            href={`tel:${driver.phone}`}
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {driver.phone}
                          </a>

                          {driver.licensePlate && (
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                              {driver.licensePlate}
                            </span>
                          )}

                          <span 
                            title="Mã bí mật điểm danh của tài xế"
                            className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-mono font-bold text-[10px] flex items-center gap-1"
                          >
                            <Key className="w-2.5 h-2.5 text-amber-500" />
                            PIN: {driver.secretCode || (driver.phone ? driver.phone.replace(/\D/g, '').slice(-4) : '1234') || '1234'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Working Type */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {driver.approvalStatus === 'pending' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Hourglass className="w-2.5 h-2.5" />
                          Chờ Duyệt
                        </span>
                      ) : driver.isRevoked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Bị Thu Hồi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Đang Chạy
                        </span>
                      )}

                      <span className={`px-2 py-0.2 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                        driver.workingType === 'parttime'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {driver.workingType === 'parttime' ? (
                          <>
                            <Clock className="w-2.5 h-2.5" />
                            Part-time
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-2.5 h-2.5" />
                            Full-time
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Banner nếu đang ở danh sách chờ */}
                {driver.approvalStatus === 'pending' && (
                  <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-200 text-[11px]">
                      <Hourglass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-medium truncate max-w-[160px] sm:max-w-[200px]">
                        {driver.rejectionReason || 'Hồ sơ chờ phê duyệt / dự bị'}
                      </span>
                    </div>
                    {onApproveDriver && (
                      <button
                        onClick={() => onApproveDriver(driver)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-2xs shrink-0"
                        title="Duyệt tài xế này chính thức"
                      >
                        <UserCheck className="w-3 h-3" />
                        Duyệt ngay
                      </button>
                    )}
                  </div>
                )}

                {/* Body: Đồng Phục & Tiền Cọc */}
                <div className="p-4 space-y-3 text-xs flex-1">
                  
                  {/* Grid 3 cột Mũ, Áo & Thùng */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {/* Cột Mũ */}
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center mb-1 truncate">
                        <HardHat className="w-3 h-3 mr-1 text-amber-500 shrink-0" />
                        Mũ
                      </span>
                      {driver.isRevoked && driver.revokedHelmet ? (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <Check className="w-3 h-3 mr-1 text-emerald-500 shrink-0" />
                          Đã trả
                        </span>
                      ) : driver.hasHelmet ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {driver.helmetQuantity || 1} cái
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          Thiếu
                        </span>
                      )}
                    </div>

                    {/* Cột Áo */}
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center mb-1 truncate">
                        <Shirt className="w-3 h-3 mr-1 text-indigo-500 shrink-0" />
                        Áo ({driver.shirtSize || 'L'})
                      </span>
                      {driver.isRevoked && driver.revokedShirt ? (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <Check className="w-3 h-3 mr-1 text-emerald-500 shrink-0" />
                          Đã trả
                        </span>
                      ) : driver.hasShirt ? (
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {driver.shirtQuantity || 1} cái
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          Thiếu
                        </span>
                      )}
                    </div>

                    {/* Cột Thùng Hàng */}
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center mb-1 truncate">
                        <Package className="w-3 h-3 mr-1 text-amber-500 shrink-0" />
                        Thùng
                      </span>
                      {driver.isRevoked && driver.revokedBox ? (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <Check className="w-3 h-3 mr-1 text-emerald-500 shrink-0" />
                          Đã trả
                        </span>
                      ) : driver.hasDeliveryBox !== false ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {driver.boxQuantity || 1} cái
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          Thiếu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mục Tài Chính: Thu / Nợ */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tiền cọc đã thu:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm">
                        {formatCurrency(driver.uniformFeePaid)}
                      </strong>
                      <span className="text-[10px] text-slate-400 ml-1">/ {formatCurrency(driver.uniformFeeRequired)}</span>
                    </div>

                    <div className="text-right">
                      {debt > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-[11px] font-mono">
                          Nợ {formatCurrency(debt)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-[10px]">
                          Thu Đủ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cảnh báo vi phạm & Hoàn tiền (nếu có) */}
                  {driver.isRevoked && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-[11px] space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center text-rose-700 dark:text-rose-300">
                          <ShieldAlert className="w-3 h-3 mr-1 text-rose-500 shrink-0" />
                          {driver.revocationReason || 'Thu hồi vi phạm'}
                        </span>
                        <span>
                          {driver.refundStatus === 'refunded' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              Đã hoàn: {formatCurrency(driver.refundAmount)}
                            </span>
                          ) : driver.refundStatus === 'pending' ? (
                            <span className="text-amber-600 dark:text-amber-400 font-mono">
                              Chờ hoàn: {formatCurrency(driver.refundAmount)}
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">Không hoàn cọc</span>
                          )}
                        </span>
                      </div>

                      {/* Trạng thái trả đồ */}
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span>Trả mũ: {driver.revokedHelmet ? '✅ Đã trả' : '❌ Chưa'}</span>
                        <span>•</span>
                        <span>Trả áo: {driver.revokedShirt ? '✅ Đã trả' : '❌ Chưa'}</span>
                      </div>
                    </div>
                  )}

                  {/* Ghi chú chung */}
                  {driver.generalNote && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                      "{driver.generalNote}"
                    </p>
                  )}
                </div>

                {/* Footer Action Buttons (Touch target >= 44px) */}
                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewDriver(driver)}
                    className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Xem Chi Tiết
                  </button>

                  <button
                    onClick={() => onEditDriver(driver)}
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-semibold text-xs flex items-center justify-center transition shadow-2xs"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {canDelete && <button
                    onClick={() => {
                      if (window.confirm(`Xóa tài xế ${driver.name} (${driver.code}) khỏi hệ thống?`)) {
                        onDeleteDriver(driver.id);
                      }
                    }}
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs flex items-center justify-center transition shadow-2xs"
                    title="Xóa tài xế"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* DẠNG BẢNG (TABLE VIEW) - Rộng rãi cho máy tính */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Tài Xế</th>
                  <th className="py-3 px-4">Mũ Bảo Hiểm</th>
                  <th className="py-3 px-4">Áo Đồng Phục</th>
                  <th className="py-3 px-4">Thùng Hàng</th>
                  <th className="py-3 px-4">Tiền Thu Đồng Phục</th>
                  <th className="py-3 px-4">Tình Trạng & Hoàn Tiền</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredDrivers.map((driver) => {
                  const debt = Math.max(0, driver.uniformFeeRequired - driver.uniformFeePaid);
                  
                  return (
                    <tr 
                      key={driver.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        driver.isRevoked ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Cột 1: Thông tin tài xế */}
                      <td className="py-3 px-4">
                        <div className="flex items-start space-x-2.5">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-inner ${
                            driver.isRevoked
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {driver.code.replace('TX-', '')}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span 
                                onClick={() => onViewDriver(driver)}
                                className="font-semibold text-slate-900 dark:text-slate-100 text-sm hover:text-amber-500 cursor-pointer"
                              >
                                {driver.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                                {driver.code}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                driver.workingType === 'parttime'
                                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              }`}>
                                {driver.workingType === 'parttime' ? 'Part-time' : 'Full-time'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center text-slate-500 dark:text-slate-400 gap-2 mt-0.5 text-[11px]">
                              <a href={`tel:${driver.phone}`} className="flex items-center hover:text-blue-500">
                                <Phone className="w-3 h-3 mr-1 text-slate-400" />
                                {driver.phone}
                              </a>
                              {driver.licensePlate && (
                                <span className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                                  {driver.licensePlate}
                                </span>
                              )}
                              <span 
                                title="Mã bí mật điểm danh"
                                className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1 rounded border border-amber-200 dark:border-amber-800 font-mono font-bold text-[10px] flex items-center gap-0.5"
                              >
                                <Key className="w-2.5 h-2.5 text-amber-500" />
                                PIN: {driver.secretCode || (driver.phone ? driver.phone.replace(/\D/g, '').slice(-4) : '1234') || '1234'}
                              </span>
                            </div>
                            {driver.joinDate && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center">
                                <Calendar className="w-2.5 h-2.5 mr-1" />
                                Vào làm: {formatDate(driver.joinDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Mũ bảo hiểm */}
                      <td className="py-3 px-4">
                        {driver.isRevoked && driver.revokedHelmet ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-slate-500" />
                            Đã thu hồi mũ
                          </span>
                        ) : driver.hasHelmet ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <HardHat className="w-3 h-3 mr-1 text-emerald-600" />
                              Đã cấp ({driver.helmetQuantity || 1} cái)
                            </span>
                            {driver.helmetDate && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Ngày nhận: {formatDate(driver.helmetDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Chưa có mũ
                          </span>
                        )}
                      </td>

                      {/* Cột 3: Áo đồng phục */}
                      <td className="py-3 px-4">
                        {driver.isRevoked && driver.revokedShirt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-slate-500" />
                            Đã thu hồi áo
                          </span>
                        ) : driver.hasShirt ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              <Shirt className="w-3 h-3 mr-1 text-indigo-600" />
                              Size {driver.shirtSize || 'L'} ({driver.shirtQuantity || 1} cái)
                            </span>
                            {driver.shirtDate && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Ngày nhận: {formatDate(driver.shirtDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Chưa có áo
                          </span>
                        )}
                      </td>

                      {/* Cột 4: Thùng đựng hàng */}
                      <td className="py-3 px-4">
                        {driver.isRevoked && driver.revokedBox ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-slate-500" />
                            Đã thu hồi thùng
                          </span>
                        ) : driver.hasDeliveryBox !== false ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Package className="w-3 h-3 mr-1 text-amber-600" />
                              Đã cấp ({driver.boxQuantity || 1} thùng)
                            </span>
                            {driver.boxDate && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Ngày nhận: {formatDate(driver.boxDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Chưa có thùng
                          </span>
                        )}
                      </td>

                      {/* Cột 4: Tiền cọc */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <span>{formatCurrency(driver.uniformFeePaid)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Quy định: {formatCurrency(driver.uniformFeeRequired)}
                        </div>
                        {debt > 0 ? (
                          <div className="text-[11px] font-bold text-rose-500">
                            Còn nợ: {formatCurrency(debt)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            Đã nộp đủ 100%
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Tình trạng vi phạm & hoàn tiền / Chờ duyệt */}
                      <td className="py-3 px-4">
                        {driver.approvalStatus === 'pending' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              <Hourglass className="w-3 h-3 mr-1 text-amber-600" />
                              Chờ duyệt (Dự bị)
                            </span>
                            {driver.rejectionReason && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-300 italic line-clamp-1 max-w-[180px]">
                                {driver.rejectionReason}
                              </div>
                            )}
                          </div>
                        ) : driver.isRevoked ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" />
                              {driver.revocationReason || 'Thu hồi vi phạm'}
                            </span>
                            <div className="text-[11px]">
                              {driver.refundStatus === 'refunded' ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                                  Đã hoàn: {formatCurrency(driver.refundAmount)}
                                </span>
                              ) : driver.refundStatus === 'pending' ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold font-mono">
                                  Chờ hoàn: {formatCurrency(driver.refundAmount)}
                                </span>
                              ) : (
                                <span className="text-slate-400">Không hoàn cọc</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Đã duyệt
                          </span>
                        )}
                      </td>

                      {/* Cột 6: Nút thao tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {driver.approvalStatus === 'pending' && onApproveDriver && (
                            <button
                              onClick={() => onApproveDriver(driver)}
                              title="Duyệt tài xế chính thức"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-2xs mr-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Duyệt</span>
                            </button>
                          )}
                          <button
                            onClick={() => onViewDriver(driver)}
                            title="Xem chi tiết hồ sơ"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditDriver(driver)}
                            title="Chỉnh sửa hồ sơ"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa tài xế ${driver.name} (${driver.code})?`)) {
                                onDeleteDriver(driver.id);
                              }
                            }}
                            title="Xóa tài xế"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
