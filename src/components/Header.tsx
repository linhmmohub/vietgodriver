import React from 'react';
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
  UserCog
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
  setActiveTab,
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
  const isSuperAdmin = adminUser?.role === 'super_admin';
  const isStaff = adminUser?.role === 'staff';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Brand bar & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
          
          {/* Logo & Tiêu đề */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Shirt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                  Quản Lý Đồng Phục Tài Xế
                </h1>
                {isSuperAdmin && (
                  <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Admin Tổng
                  </span>
                )}
                {isStaff && (
                  <span className="text-[10px] sm:text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                    Cấp Dưới (Quản Lý Tài Xế)
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Theo dõi Mũ & Áo, thu cọc, hoàn tiền vi phạm, phân quyền & nhật ký thao tác
              </p>
            </div>
          </div>

          {/* Action buttons & Admin status */}
          <div className="flex items-center flex-wrap gap-2">
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
                  <span className="max-w-[130px] truncate font-medium">
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
                Thêm tài xế mới
              </button>
            )}

            {activeTab === 'expenses' && isSuperAdmin && (
              <button
                id="btn-add-expense"
                onClick={onOpenExpenseModal}
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4 mr-1 text-slate-950 stroke-[2.5]" />
                Ghi khoản chi mới
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation (Scrollable on small mobile screens) */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-1 overflow-x-auto no-scrollbar">
          
          {/* Tab 1: Tài xế - Accessible by both Super Admin and Staff */}
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

          {/* Super Admin Only Tabs: Expenses, Summary, Audit Logs, User Management */}
          {isSuperAdmin && (
            <>
              {/* Tab 2: Sổ chi tiêu & Ảnh Bill */}
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

              {/* Tab 3: Báo cáo & Dòng tiền */}
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

              {/* Tab 4: Nhật ký thao tác (Audit Logs) */}
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

              {/* Tab 5: Quản lý phân quyền cấp dưới */}
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

          {/* Subordinate notice when staff is logged in */}
          {isStaff && (
            <div className="flex items-center py-2.5 px-3 text-xs text-slate-400 bg-slate-800/40 rounded-lg shrink-0 border border-slate-800">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
              <span>Tài khoản cấp dưới: Giới hạn thao tác hồ sơ Tài xế</span>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
