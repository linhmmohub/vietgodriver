import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  User, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  KeyRound, 
  AlertCircle,
  ShieldAlert,
  Car,
  DollarSign,
  FileText
} from 'lucide-react';
import { SystemUser, AuthSession, UserRole } from '../types';
import { 
  getSystemUsers, 
  createSubordinateUser, 
  updateSubordinateUser, 
  deleteSubordinateUser 
} from '../utils/auth';
import { formatDate } from '../utils/formatters';

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Cấp 1 · Admin (toàn quyền)',
  manager: 'Cấp 2 · Quản lý vận hành',
  staff: 'Cấp 3 · Quản lý ca trực',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Toàn quyền hệ thống, thu chi, báo cáo, cấu hình và phân quyền.',
  manager: 'Quản lý hồ sơ tài xế, cấp phát/thu hồi đồng phục và điểm danh.',
  staff: 'Chỉ xem các tài xế đang trong ca trực; không được sửa dữ liệu.',
};

interface UserManagementViewProps {
  currentUser: AuthSession;
  onRefreshSession: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onRefreshSession,
}) => {
  const [users, setUsers] = useState<SystemUser[]>(() => getSystemUsers());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form states for Add
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('manager');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for Edit
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editRole, setEditRole] = useState<UserRole>('staff');

  const reloadUsers = () => {
    setUsers(getSystemUsers());
  };

  const handleOpenAddModal = () => {
    setNewUsername('');
    setNewDisplayName('');
    setNewPassword('');
    setNewNotes('');
    setNewRole('manager');
    setErrorMessage('');
    setSuccessMessage('');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = createSubordinateUser(currentUser, {
      username: newUsername,
      password: newPassword,
      displayName: newDisplayName,
      role: newRole,
      notes: newNotes,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Không thể tạo tài khoản');
      return;
    }

    setSuccessMessage(`Đã tạo tài khoản "${newUsername}" thành công!`);
    reloadUsers();
    setTimeout(() => {
      setIsAddModalOpen(false);
      setSuccessMessage('');
    }, 1200);
  };

  const handleOpenEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName);
    setEditNewPassword('');
    setEditNotes(user.notes || '');
    setEditIsActive(user.isActive);
    setEditRole(user.role);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMessage('');

    const res = updateSubordinateUser(currentUser, editingUser.id, {
      displayName: editDisplayName,
      newPassword: editNewPassword.trim() || undefined,
      role: editRole,
      notes: editNotes,
      isActive: editIsActive,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Cập nhật thất bại');
      return;
    }

    setSuccessMessage('Cập nhật tài khoản thành công!');
    reloadUsers();
    onRefreshSession();
    setTimeout(() => {
      setEditingUser(null);
      setSuccessMessage('');
    }, 1000);
  };

  const handleDelete = (user: SystemUser) => {
    if (user.username === 'admin') {
      alert('Không thể xóa tài khoản Admin Tổng!');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${user.displayName} (${user.username})"?`)) {
      const res = deleteSubordinateUser(currentUser, user.id);
      if (!res.success) {
        alert(res.error);
        return;
      }
      reloadUsers();
    }
  };

  const handleToggleActive = (user: SystemUser) => {
    if (user.username === 'admin') {
      alert('Không thể khóa tài khoản Admin Tổng!');
      return;
    }
    const res = updateSubordinateUser(currentUser, user.id, {
      isActive: !user.isActive,
    });
    if (!res.success) {
      alert(res.error);
      return;
    }
    reloadUsers();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Quản Lý Tài Khoản & Phân Quyền
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Admin Tổng tạo và thay đổi 3 cấp quyền: Admin, Quản lý vận hành và Quản lý ca trực.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo Tài Khoản</span>
          </button>
        </div>

        {/* Roles explanation card */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Cấp 1: Admin Tổng</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Toàn quyền: tài xế, đồng phục, thu chi, báo cáo, cấu hình và tạo/phân quyền tài khoản.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs">
            <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-bold mb-1">
              <Car className="w-4 h-4 text-indigo-500" />
              <span>Cấp 2: Quản Lý Vận Hành</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Quản lý toàn bộ mảng tài xế và đồng phục: tạo/sửa/xóa, cấp phát, thu hồi, cọc/hoàn cọc và điểm danh. Không xem thu chi, báo cáo, cấu hình hay tài khoản.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-bold mb-1">
              <Car className="w-4 h-4 text-indigo-500" />
              <span>Cấp 3: Quản Lý Ca Trực</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Chỉ xem được tài xế đang trong ca trực tại màn hình Điểm Danh. Không thể tạo, sửa, xóa hoặc thay đổi trạng thái.
            </p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Danh Sách Người Dùng Hệ Thống ({users.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Cập nhật tức thì vào bộ nhớ mã hóa
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => {
            const isSuperAdmin = user.role === 'super_admin';
            const isOperationsManager = user.role === 'manager';
            const isRootAdmin = user.username === 'admin';

            return (
              <div 
                key={user.id} 
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
              >
                {/* User info */}
                <div className="flex items-start space-x-3.5">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSuperAdmin
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : isOperationsManager
                        ? 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                        : 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30'
                  }`}>
                    {isSuperAdmin ? <ShieldCheck className="w-5 h-5 stroke-[2.2]" /> : <User className="w-5 h-5 stroke-[2.2]" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {user.displayName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        @{user.username}
                      </span>

                      {/* Role badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        isSuperAdmin
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : isOperationsManager
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                      }`}>
                        {ROLE_LABELS[user.role]}
                      </span>

                      {/* Active / Inactive badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        user.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                            Đang hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1 text-rose-500" />
                            Đã tạm khóa
                          </>
                        )}
                      </span>
                    </div>

                    {user.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Tạo: {formatDate(user.createdAt)}</span>
                      {user.lastLogin && <span>• Đăng nhập gần nhất: {formatDate(user.lastLogin)}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1 transition active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa / Đổi MK</span>
                  </button>

                  {!isRootAdmin && (
                    <>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 ${
                          user.isActive
                            ? 'border-amber-200 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            : 'border-emerald-200 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        {user.isActive ? 'Khóa TK' : 'Mở Khóa'}
                      </button>

                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95"
                        title="Xóa tài khoản này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Thêm tài khoản mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-extrabold text-base">
                <UserPlus className="w-5 h-5" />
                <span>Tạo Tài Khoản Mới</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-300 font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: nhanvien2, tiepnhan, dispatch"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Viết liền, không dấu, ít nhất 3 ký tự</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ tên người sử dụng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: Nguyễn Thị Hoa (Điều hành kho)"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tối thiểu 4 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phân quyền vai trò
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="super_admin">Cấp 1 · Admin Tổng: Toàn quyền hệ thống</option>
                  <option value="manager">Cấp 2 · Quản lý vận hành: Tài xế & đồng phục</option>
                  <option value="staff">Cấp 3 · Quản lý ca trực: Chỉ xem ca làm</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {ROLE_DESCRIPTIONS[newRole]}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú nhiệm vụ (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú ca trực hoặc số điện thoại nhân viên"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs active:scale-95 transition"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sửa tài khoản */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                <KeyRound className="w-5 h-5" />
                <span>Chỉnh Sửa Tài Khoản: @{editingUser.username}</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-300 font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

               <div>
                 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                   Đặt lại mật khẩu mới
                </label>
                <input
                  type="text"
                  placeholder="Để trống nếu không muốn đổi mật khẩu"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                 <span className="text-[10px] text-slate-400 mt-0.5 block">Nhập mật khẩu mới (tối thiểu 4 ký tự) để cấp lại cho nhân viên</span>
               </div>

               <div>
                 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                   Cấp quyền
                 </label>
                 <select
                   value={editRole}
                   onChange={(e) => setEditRole(e.target.value as UserRole)}
                   disabled={editingUser.username === 'admin'}
                   className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                 >
                   <option value="super_admin">Cấp 1 · Admin Tổng</option>
                   <option value="manager">Cấp 2 · Quản lý vận hành</option>
                   <option value="staff">Cấp 3 · Quản lý ca trực</option>
                 </select>
                 <span className="text-[10px] text-slate-400 mt-1 block">
                   {editingUser.username === 'admin' ? 'Tài khoản Admin gốc luôn giữ cấp 1 để bảo đảm hệ thống còn quản trị viên.' : ROLE_DESCRIPTIONS[editRole]}
                 </span>
               </div>

               <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {editingUser.username !== 'admin' && (
                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Cho phép tài khoản này đăng nhập và hoạt động
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs active:scale-95 transition"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
