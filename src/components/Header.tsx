import React, { useState } from 'react';
import { 
  Users, 
  Receipt, 
  PieChart, 
  Plus, 
  Download, 
  Database,
  Shirt,
  ShieldAlert,
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  FileText,
  Boxes,
  UserCog,
  Radio,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';
import { ActiveTab, AuthSession } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  driverCount: number;
  expenseCount: number;
  revokedCount: number;
  logCount: number;
  adminUser: AuthSession | null;
  onOpenLoginModal: () => void;
  onOpenProfileModal: () => void;
  onLockApp: () => void;
  onOpenDriverModal: () => void;
  onOpenExpenseModal: () => void;
  onExportCSV: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab: setActiveTabProp,
  driverCount,
  expenseCount,
  revokedCount,
  logCount,
  adminUser,
  onOpenLoginModal,
  onOpenProfileModal,
  onLockApp,
  onOpenDriverModal,
  onOpenExpenseModal,
  onExportCSV,
  onOpenBackupModal,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isSuperAdmin = adminUser?.role === 'super_admin';
  const isOperationsManager = adminUser?.role === 'manager';
  const canManageDriverOperations = isSuperAdmin || isOperationsManager;
  const isStaff = adminUser?.role === 'staff';

  const setActiveTab = (tab: ActiveTab) => {
    if (isStaff && tab !== 'attendance') return;
    setActiveTabProp(tab);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop header: a compact, single-row navigation designed for wide screens. */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 text-white shadow-lg backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-[68px] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 flex items-center justify-center shadow-inner">
                <Shirt className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h1 className="max-w-[132px] truncate text-sm font-extrabold tracking-tight text-slate-100 md:max-w-none"><span className="md:hidden">VietGo</span><span className="hidden md:inline">VietGo Driver Ops</span></h1>
                  {isSuperAdmin ? (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">Admin</span>
                  ) : isOperationsManager ? (
                    <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-sky-300">Vận hành</span>
                  ) : (
                    <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-300">Ca trực</span>
                  )}
                </div>
                <p className="hidden xl:block text-[10px] text-slate-500">Điều hành tài xế, đồng phục và điểm danh</p>
              </div>
            </div>

            <nav className="hidden md:flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar" aria-label="Điều hướng chính">
              {canManageDriverOperations && (
                <button id="tab-drivers" onClick={() => setActiveTab('drivers')} className={`desktop-nav-item ${activeTab === 'drivers' ? 'desktop-nav-item-active-amber' : ''}`}>
                  <Users className="h-4 w-4" /><span>Hồ sơ TX</span><span className="desktop-nav-count">{driverCount}</span>
                </button>
              )}
              <button id="tab-attendance" onClick={() => setActiveTab('attendance')} className={`desktop-nav-item ${activeTab === 'attendance' ? 'desktop-nav-item-active-emerald' : ''}`}>
                <Radio className="h-4 w-4" /><span>Điểm danh</span>
              </button>
              {canManageDriverOperations && (
                <button id="tab-inventory" onClick={() => setActiveTab('inventory')} className={`desktop-nav-item ${activeTab === 'inventory' ? 'desktop-nav-item-active-amber' : ''}`}>
                  <Boxes className="h-4 w-4" /><span>Đồng phục</span>
                </button>
              )}
              {isSuperAdmin && (
                <button id="tab-expenses" onClick={() => setActiveTab('expenses')} className={`desktop-nav-item ${activeTab === 'expenses' ? 'desktop-nav-item-active-emerald' : ''}`}>
                  <Receipt className="h-4 w-4" /><span>Thu chi</span><span className="desktop-nav-count">{expenseCount}</span>
                </button>
              )}
              {isSuperAdmin && (
                <button id="tab-summary" onClick={() => setActiveTab('summary')} className={`desktop-nav-item ${activeTab === 'summary' ? 'desktop-nav-item-active-cyan' : ''}`}>
                  <PieChart className="h-4 w-4" /><span>Báo cáo</span>
                </button>
              )}
              {isSuperAdmin && (
                <button id="tab-logs" onClick={() => setActiveTab('logs')} className={`desktop-nav-item ${activeTab === 'logs' ? 'desktop-nav-item-active-violet' : ''}`}>
                  <FileText className="h-4 w-4" /><span>Nhật ký</span><span className="desktop-nav-count">{logCount}</span>
                </button>
              )}
              {isStaff && <span className="ml-2 whitespace-nowrap text-xs text-indigo-200/80">Chỉ xem tài xế đang trực</span>}
            </nav>

            <div className="hidden md:flex shrink-0 items-center gap-1.5">
              {isSuperAdmin && (
                <button
                  id="tab-users"
                  onClick={() => setActiveTab('users')}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
                    activeTab === 'users'
                      ? 'border-indigo-400/60 bg-indigo-400 text-slate-950'
                      : 'border-indigo-400/30 bg-indigo-400/10 text-indigo-200 hover:bg-indigo-400/20'
                  }`}
                  title="Tạo tài khoản và phân quyền"
                >
                  <UserCog className="h-4 w-4" />
                  <span className="hidden xl:inline">Tài khoản & quyền</span>
                  <span className="xl:hidden">Phân quyền</span>
                </button>
              )}
              {isSuperAdmin && (
                <button id="tab-settings" onClick={() => setActiveTab('settings')} className={`rounded-xl border p-2 transition ${activeTab === 'settings' ? 'border-amber-400/60 bg-amber-400/15 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'}`} title="Cấu hình danh mục & chi phí">
                  <Settings className="h-4 w-4" />
                </button>
              )}
              {isSuperAdmin && (
                <button id="btn-export-csv" onClick={onExportCSV} className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:text-white" title="Xuất Excel">
                  <Download className="h-4 w-4" />
                </button>
              )}
              {isSuperAdmin && (
                <button id="btn-backup-data" onClick={onOpenBackupModal} className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:text-white" title="Sao lưu / khôi phục">
                  <Database className="h-4 w-4" />
                </button>
              )}
              {canManageDriverOperations && (
                <button id="btn-add-driver" onClick={onOpenDriverModal} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-amber-300" title="Tạo tài xế">
                  <Plus className="h-4 w-4 stroke-[3]" /><span className="hidden lg:inline">Tài xế mới</span>
                </button>
              )}
              {adminUser ? (
                <div className="ml-1 inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 p-0.5">
                  <button id="btn-admin-profile" onClick={onOpenProfileModal} className={`inline-flex max-w-[116px] items-center gap-1.5 truncate rounded-lg px-2 py-1.5 text-xs font-semibold transition ${isSuperAdmin ? 'text-amber-300 hover:bg-slate-800' : 'text-indigo-300 hover:bg-slate-800'}`} title="Hồ sơ và đổi mật khẩu">
                    {isSuperAdmin ? <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> : <UserCheck className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{adminUser.displayName || adminUser.username}</span>
                  </button>
                  <button id="btn-lock-app" onClick={onLockApp} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300" title="Đăng xuất">
                    <Lock className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button id="btn-header-login-admin" onClick={onOpenLoginModal} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950"><Key className="h-3.5 w-3.5" />Đăng nhập</button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE FULL-SCREEN SLIDE-OVER DRAWER (MENU TASK CHO MOBILE) */}
      {/* ======================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in slide-in-from-bottom duration-250">
            
            {/* Drawer Drag Indicator & Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between sticky top-0">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Menu Quản Lý & Tác Vụ
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {adminUser 
                      ? `${adminUser.displayName || adminUser.username} (${isSuperAdmin ? 'Admin Tổng' : 'Cấp Dưới'})`
                      : 'Chưa đăng nhập'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="mobile-safe-bottom p-4 space-y-4 overflow-y-auto max-h-[calc(88vh-80px)] pb-10">
              
              {/* SECTION 1: PHÂN HỆ TÁC VỤ (TASKS / MODULES) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                  <span>Danh Mục Tác Vụ</span>
                  <span className="text-[10px] text-slate-500 font-normal">Chạm để mở</span>
                </div>

                {/* 1. Tài xế & Cấp phát */}
                {canManageDriverOperations && <button
                  onClick={() => handleSelectTab('drivers')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                    activeTab === 'drivers'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeTab === 'drivers' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Hồ Sơ Tài Xế & Cấp Phát</div>
                      <div className="text-[11px] text-slate-400">Danh sách tài xế, cấp phát mũ/áo, tiền cọc</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {driverCount}
                    </span>
                    {revokedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {revokedCount} thu hồi
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>}

                <button
                  onClick={() => handleSelectTab('attendance')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                    activeTab === 'attendance'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeTab === 'attendance' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Điểm Danh & Điều Phối</div>
                      <div className="text-[11px] text-slate-400">Theo dõi ca trực, checkout và nghỉ đột xuất</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 2. Kho & Phân Bổ Size */}
                {canManageDriverOperations && <button
                  onClick={() => handleSelectTab('inventory')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                    activeTab === 'inventory'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeTab === 'inventory' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Kho & Cấp Phát Đồng Phục</div>
                      <div className="text-[11px] text-slate-400">Phân loại size S/M/L/XL/XXL/3XL & tồn kho</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Kho size
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>}

                {/* Super Admin Tabs */}
                {isSuperAdmin && (
                  <>
                    {/* 3. Chi tiêu & Bill */}
                    <button
                      onClick={() => handleSelectTab('expenses')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                        activeTab === 'expenses'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${activeTab === 'expenses' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Sổ Chi Tiêu & Bill Hóa Đơn</div>
                          <div className="text-[11px] text-slate-400">Ghi chép mua mũ áo, phụ kiện & ảnh bill</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {expenseCount}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>

                    {/* 4. Báo cáo & Quỹ */}
                    <button
                      onClick={() => handleSelectTab('summary')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                        activeTab === 'summary'
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${activeTab === 'summary' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                          <PieChart className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Báo Cáo Tổng Quan & Dòng Tiền</div>
                          <div className="text-[11px] text-slate-400">Tổng thu cọc, tồn quỹ, biểu đồ tài chính</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* 5. Nhật ký thao tác */}
                    <button
                      onClick={() => handleSelectTab('logs')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                        activeTab === 'logs'
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${activeTab === 'logs' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Nhật Ký Thao Tác (Audit Logs)</div>
                          <div className="text-[11px] text-slate-400">Ai thêm, sửa, xóa, thu hồi trang bị</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {logCount}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>

                    {/* 6. Phân quyền cấp dưới */}
                    <button
                      onClick={() => handleSelectTab('users')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                        activeTab === 'users'
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${activeTab === 'users' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                          <UserCog className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Phân Quyền Tài Khoản Cấp Dưới</div>
                          <div className="text-[11px] text-slate-400">Cấp tài khoản & giới hạn quyền nhân viên</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* 7. Cấu hình danh mục & chi phí */}
                    <button
                      onClick={() => handleSelectTab('settings')}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                        activeTab === 'settings'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${activeTab === 'settings' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Settings className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Cấu Hình Danh Mục & Chi Phí</div>
                          <div className="text-[11px] text-slate-400">Tùy chỉnh Áo, Mũ, Thùng, Phụ kiện & Đơn giá cọc</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </>
                )}
              </div>

              {/* SECTION 2: HÀNH ĐỘNG TỨC THÌ (QUICK ACTIONS) */}
              {isSuperAdmin && <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Tác Vụ Nhanh
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Action 1: Thêm tài xế */}
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenDriverModal();
                    }}
                    className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Cấp TX Mới</span>
                  </button>

                  {/* Action 2: Ghi khoản chi */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onOpenExpenseModal();
                      }}
                      className="p-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Ghi Khoản Chi</span>
                    </button>
                  )}

                  {/* Action 3: Xuất Excel */}
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onExportCSV();
                    }}
                    className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Xuất File Excel</span>
                  </button>

                  {/* Action 4: Sao lưu (Super admin) */}
                  {isSuperAdmin ? (
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onOpenBackupModal();
                      }}
                      className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <Database className="w-4 h-4 text-slate-400" />
                      <span>Sao Lưu Dữ Liệu</span>
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>}

              {/* SECTION 3: TÀI KHOẢN & BẢO MẬT */}
              <div className="pt-2 border-t border-slate-800">
                {adminUser ? (
                  <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${isSuperAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                        {isSuperAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{adminUser.displayName || adminUser.username}</div>
                        <div className="text-[10px] text-slate-400">{isSuperAdmin ? 'Quản trị viên tối cao' : 'Nhân viên quản lý'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onOpenProfileModal();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                      >
                        Đổi MK
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onLockApp();
                        }}
                        className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                        title="Đăng xuất"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Key className="w-4 h-4" />
                    <span>Đăng Nhập Quản Trị Hệ Thống</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ERGONOMIC MOBILE STICKY BOTTOM NAVIGATION BAR (SM:HIDDEN) */}
      {/* ======================================================== */}
      <nav 
        className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl"
        aria-label="Thanh điều hướng nhanh trên điện thoại"
      >
        {/* 1. Tab Tài xế */}
        {canManageDriverOperations && <button
          onClick={() => setActiveTab('drivers')}
          className={`mobile-bottom-nav-item order-2 flex-1 rounded-2xl flex flex-col items-center justify-center transition ${
            activeTab === 'drivers'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2.5 px-1 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {driverCount}
            </span>
          </div>
          <span className="text-[10px] mt-1">Tài xế</span>
        </button>}

        {/* 2. Tab Kho & Size */}
        {canManageDriverOperations && <button
          onClick={() => setActiveTab('inventory')}
          className={`mobile-bottom-nav-item order-3 flex-1 rounded-2xl flex flex-col items-center justify-center transition ${
            activeTab === 'inventory'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Boxes className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1">Kho Size</span>
        </button>}

        <button
          onClick={() => setActiveTab('attendance')}
          className={`mobile-bottom-nav-item order-1 flex-1 rounded-2xl flex flex-col items-center justify-center transition ${
            activeTab === 'attendance'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] mt-1">Điểm danh</span>
        </button>

        {/* 3. Tab Chi tiêu */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('expenses')}
            className={`mobile-bottom-nav-item order-4 flex-1 rounded-2xl flex flex-col items-center justify-center transition ${
              activeTab === 'expenses'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2.5 px-1 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {expenseCount}
              </span>
            </div>
            <span className="text-[10px] mt-1">Chi tiêu</span>
          </button>
        )}

        {/* 4. Menu & All Tasks Trigger */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="mobile-bottom-nav-item order-5 flex-1 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-amber-400 transition"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-semibold">Tác vụ</span>
        </button>
      </nav>
    </>
  );
};
