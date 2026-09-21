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
  Shield,
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
  attendanceOnDutyCount: number;
  expenseCount: number;
  revokedCount: number;
  logCount: number;
  adminUser: AuthSession | null;
  onOpenLoginModal: () => void;
  onOpenProfileModal: () => void;
  onLockApp: () => void;
  onOpenDriverModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenDriverPortal: () => void;
  onExportCSV: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  driverCount,
  attendanceOnDutyCount,
  expenseCount,
  revokedCount,
  logCount,
  adminUser,
  onOpenLoginModal,
  onOpenProfileModal,
  onLockApp,
  onOpenDriverModal,
  onOpenExpenseModal,
  onOpenDriverPortal,
  onExportCSV,
  onOpenBackupModal,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isSuperAdmin = adminUser?.role === 'super_admin';
  const isStaff = adminUser?.role === 'staff';

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main Bar */}
          <div className="flex items-center justify-between py-3 gap-2 sm:gap-4">
            
            {/* Logo & Tiêu đề */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                <Shirt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-100 tracking-tight">
                    Quản Lý Đồng Phục Tài Xế
                  </h1>
                  {isSuperAdmin && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                      Admin Tổng
                    </span>
                  )}
                  {isStaff && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 shrink-0">
                      Cấp Dưới
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                  Theo dõi Mũ & Áo, thu cọc, hoàn tiền vi phạm, phân quyền & nhật ký thao tác
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center flex-wrap gap-2">
              {/* User status / Login button */}
              {adminUser ? (
                <div className="inline-flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
                  <button
                    id="btn-admin-profile"
                    onClick={onOpenProfileModal}
                    title="Xem tài khoản & Đổi mật khẩu"
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-slate-700 transition ${
                      isSuperAdmin ? 'text-amber-400 hover:text-amber-300' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    {isSuperAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                    )}
                    <span className="max-w-[120px] truncate font-medium">
                      {adminUser.displayName || adminUser.username}
                    </span>
                  </button>
                  <button
                    id="btn-lock-app"
                    onClick={onLockApp}
                    title="Đăng xuất / Khóa màn hình"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-header-login-admin"
                  onClick={onOpenLoginModal}
                  title="Đăng nhập tài khoản"
                  className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 shadow-xs transition active:scale-95"
                >
                  <Key className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  <span>Đăng Nhập</span>
                </button>
              )}

              {/* Backup button only for super admin */}
              {isSuperAdmin && (
                <button
                  id="btn-backup-data"
                  onClick={onOpenBackupModal}
                  title="Sao lưu hoặc phục hồi dữ liệu JSON"
                  className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
                >
                  <Database className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Sao lưu
                </button>
              )}

              <button
                id="btn-open-driver-portal"
                onClick={onOpenDriverPortal}
                title="Mở cổng cho tài xế đăng nhập điểm danh vào/ra ca realtime"
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 shadow-xs transition active:scale-95"
              >
                <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-400 animate-pulse" />
                <span>Cổng Tài Xế Điểm Danh</span>
              </button>

              <button
                id="btn-export-csv"
                onClick={onExportCSV}
                title="Xuất danh sách ra file Excel / CSV"
                className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Xuất Excel
              </button>

              {activeTab === 'drivers' && (
                <button
                  id="btn-add-driver"
                  onClick={onOpenDriverModal}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1 text-slate-950 stroke-[2.5]" />
                  Thêm tài xế
                </button>
              )}

              {activeTab === 'expenses' && isSuperAdmin && (
                <button
                  id="btn-add-expense"
                  onClick={onOpenExpenseModal}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1 text-slate-950 stroke-[2.5]" />
                  Ghi khoản chi
                </button>
              )}
            </div>

            {/* Mobile Header Quick Bar (Driver Portal + Menu Trigger) */}
            <div className="flex md:hidden items-center space-x-1.5">
              <button
                onClick={onOpenDriverPortal}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
                title="Cổng điểm danh tài xế"
              >
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Điểm danh</span>
              </button>

              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition flex items-center justify-center"
                aria-label="Mở menu quản lý task trên điện thoại"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden md:flex space-x-1 border-t border-slate-800/80 pt-1 overflow-x-auto no-scrollbar">
            
            {/* Tab 1: Tài xế */}
            <button
              id="tab-drivers"
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center py-2.5 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition shrink-0 ${
                activeTab === 'drivers'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              <span>Tài xế & Đồng phục</span>
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {driverCount}
              </span>
              {revokedCount > 0 && (
                <span 
                  className="ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center font-mono"
                  title={`${revokedCount} tài xế bị thu hồi đồng phục vi phạm`}
                >
                  <ShieldAlert className="w-3 h-3 mr-0.5" />
                  {revokedCount}
                </span>
              )}
            </button>

            {/* Tab 2: Điều phối & Điểm danh */}
            <button
              id="tab-dispatch"
              onClick={() => setActiveTab('dispatch')}
              className={`flex items-center py-2.5 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition shrink-0 ${
                activeTab === 'dispatch'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Radio className="w-4 h-4 mr-2 text-emerald-400" />
              <span>Điều phối & Điểm danh</span>
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                {attendanceOnDutyCount} đang chạy
              </span>
            </button>

            {/* Super Admin Only Tabs */}
            {isSuperAdmin && (
              <>
                <button
                  id="tab-expenses"
                  onClick={() => setActiveTab('expenses')}
                  className={`flex items-center py-2.5 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeTab === 'expenses'
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  <span>Chi tiêu & Bill</span>
                  <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {expenseCount}
                  </span>
                </button>

                <button
                  id="tab-summary"
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center py-2.5 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeTab === 'summary'
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  <span>Báo cáo & Quỹ</span>
                </button>

                <button
                  id="tab-logs"
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center py-2.5 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeTab === 'logs'
                      ? 'border-purple-400 text-purple-400 bg-purple-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Nhật ký thao tác</span>
                  <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {logCount}
                  </span>
                </button>

                <button
                  id="tab-users"
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center py-2.5 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeTab === 'users'
                      ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  <span>Phân quyền cấp dưới</span>
                </button>
              </>
            )}

            {isStaff && (
              <div className="flex items-center py-2 px-3 text-xs text-slate-400 bg-slate-800/40 rounded-lg shrink-0 border border-slate-800">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                <span>Tài khoản cấp dưới: Quản lý Tài xế & Điều phối</span>
              </div>
            )}

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
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(88vh-80px)] pb-10">
              
              {/* SECTION 1: PHÂN HỆ TÁC VỤ (TASKS / MODULES) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                  <span>Danh Mục Tác Vụ</span>
                  <span className="text-[10px] text-slate-500 font-normal">Chạm để mở</span>
                </div>

                {/* 1. Tài xế & Đồng phục */}
                <button
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
                      <div className="text-sm font-bold">Tài Xế & Đồng Phục</div>
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
                </button>

                {/* 2. Điều phối & Điểm danh */}
                <button
                  onClick={() => handleSelectTab('dispatch')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-98 ${
                    activeTab === 'dispatch'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-850 border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeTab === 'dispatch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Điều Phối & Điểm Danh</div>
                      <div className="text-[11px] text-slate-400">Theo dõi ca sáng/chiều/tối & khu vực trực</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {attendanceOnDutyCount} online
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>

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
                  </>
                )}
              </div>

              {/* SECTION 2: HÀNH ĐỘNG TỨC THÌ (QUICK ACTIONS) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
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
                    <span>+ Thêm Tài Xế</span>
                  </button>

                  {/* Action 2: Mở cổng điểm danh */}
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenDriverPortal();
                    }}
                    className="p-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <Radio className="w-4 h-4 stroke-[3]" />
                    <span>Cổng Điểm Danh</span>
                  </button>

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
              </div>

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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
        aria-label="Thanh điều hướng nhanh trên điện thoại"
      >
        {/* 1. Tab Tài xế */}
        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
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
        </button>

        {/* 2. Tab Điều phối */}
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
            activeTab === 'dispatch'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1.5 -right-2.5 px-1 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {attendanceOnDutyCount}
            </span>
          </div>
          <span className="text-[10px] mt-1">Điều phối</span>
        </button>

        {/* 3. Tab Chi tiêu or Báo cáo */}
        {isSuperAdmin ? (
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
              activeTab === 'expenses'
                ? 'text-cyan-400 font-bold'
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
        ) : null}

        {/* 4. Menu & All Tasks Trigger */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-amber-400 transition"
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
