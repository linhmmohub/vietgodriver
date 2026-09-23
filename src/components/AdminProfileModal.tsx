import React, { useState } from 'react';
import { 
  UserCheck, 
  Key, 
  Lock, 
  LogOut, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Car,
  ShieldCheck
} from 'lucide-react';
import { AuthSession, AuthSettings } from '../types';
import { 
  getSystemUsers,
  updateSubordinateUser,
  saveAuthSettings
} from '../utils/auth';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AuthSession;
  authSettings: AuthSettings;
  onUpdateAuthSettings: (settings: AuthSettings) => void;
  onLogout: () => void;
  onUpdateAdminUser: (updatedUser: AuthSession) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  authSettings,
  onUpdateAuthSettings,
  onLogout,
  onUpdateAdminUser,
}) => {
  const isSuperAdmin = adminUser.role === 'super_admin';
  const isOperationsManager = adminUser.role === 'manager';

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState(adminUser.displayName);
  const [showPasswords, setShowPasswords] = useState(false);
  const [driverSessionDays, setDriverSessionDays] = useState(String(authSettings.driverSessionDays || 7));
  
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    // Verify current password
    const users = getSystemUsers();
    const self = users.find(u => u.id === adminUser.id || u.username === adminUser.username);
    if (!self) {
      setPasswordMsg({ type: 'error', text: 'Không tìm thấy tài khoản!' });
      return;
    }

    if (btoa(currentPassword.trim()) !== self.passwordHash) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu hiện tại không chính xác!' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp!' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 4 ký tự!' });
      return;
    }

    const result = updateSubordinateUser(adminUser, self.id, {
      displayName: displayName.trim(),
      newPassword: newPassword.trim(),
    });

    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Cập nhật tài khoản & đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onUpdateAdminUser({
        ...adminUser,
        displayName: displayName.trim(),
      });
    } else {
      setPasswordMsg({ type: 'error', text: result.error || 'Đổi mật khẩu thất bại!' });
    }
  };

  return (
    <div className="mobile-modal-frame fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="mobile-sheet bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              isSuperAdmin 
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' 
                : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
            }`}>
              {isSuperAdmin ? <ShieldCheck className="w-6 h-6 stroke-[2.2]" /> : <UserCheck className="w-6 h-6 stroke-[2.2]" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Thông Tin Tài Khoản
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSuperAdmin 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {isSuperAdmin ? 'Cấp 1 · Admin Tổng' : isOperationsManager ? 'Cấp 2 · Quản Lý Vận Hành' : 'Cấp 3 · Quản Lý Ca Trực'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {adminUser.displayName} (@{adminUser.username})
              </p>
            </div>
          </div>

          {/* Role explanation */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 leading-relaxed">
            {isSuperAdmin ? (
              <span className="text-amber-300 font-medium">
                👑 Toàn quyền hệ thống: Quản lý tài xế, Chi tiêu nội bộ, Cân đối quỹ, Phân quyền cấp dưới và Xem toàn bộ nhật ký log.
              </span>
            ) : isOperationsManager ? (
              <span className="text-indigo-300 font-medium">
                👤 Quản lý vận hành: quản lý hồ sơ tài xế, đồng phục, cấp phát/thu hồi và điểm danh; không có quyền thu chi hoặc phân quyền.
              </span>
            ) : (
              <span className="text-indigo-300 font-medium">
                👤 Quản lý ca trực: chỉ xem tài xế đang trong ca tại màn hình Điểm Danh, không thể thay đổi dữ liệu.
              </span>
            )}
          </div>
        </div>

        {/* Body: Form đổi mật khẩu & tên */}
        <div className="p-5 sm:p-6 space-y-4">
          {isSuperAdmin && (
            <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
              <div className="flex items-start gap-2.5">
                <Settings className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Ghi nhớ thiết bị tài xế</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Số ngày tài xế không cần nhập lại SĐT và PIN trên cùng thiết bị. PIN không được lưu.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input type="number" min="1" max="300" value={driverSessionDays} onChange={event => setDriverSessionDays(event.target.value)} className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    <span className="text-xs text-slate-500">ngày</span>
                    <button type="button" onClick={() => { const days = Math.min(300, Math.max(1, Math.round(Number(driverSessionDays) || 7))); setDriverSessionDays(String(days)); onUpdateAuthSettings({ ...authSettings, driverSessionDays: days }); }} className="ml-auto rounded-xl bg-cyan-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-cyan-400">Lưu thời hạn</button>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">Cho phép từ 1 đến 300 ngày; áp dụng cho các lần tài xế đăng nhập tiếp theo.</p>
                </div>
              </div>
            </section>
          )}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cập Nhật Thông Tin & Đổi Mật Khẩu
          </h3>

          {passwordMsg && (
            <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}>
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mật khẩu hiện tại *
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu đang dùng để xác thực"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu mới *
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  placeholder="Ít nhất 4 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất Khỏi Hệ Thống</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition active:scale-95"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
