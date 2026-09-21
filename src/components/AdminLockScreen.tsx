import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Shirt, 
  ArrowRight,
  Shield,
  Car,
  Radio
} from 'lucide-react';
import { authenticateUser } from '../utils/auth';
import { AuthSession } from '../types';

interface AdminLockScreenProps {
  onLoginSuccess: (user: AuthSession) => void;
  onOpenDriverPortal: () => void;
  appName?: string;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  onLoginSuccess,
  onOpenDriverPortal,
  appName = 'Quản Lý Đồng Phục Tài Xế',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeScreenTab, setActiveScreenTab] = useState<'driver_portal' | 'admin_login'>('driver_portal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      setLoading(false);

      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setError(result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Brand identity */}
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 items-center justify-center text-amber-400 shadow-xl mb-3.5">
            <Shirt className="h-8 w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {appName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hệ thống nội bộ: Phân quyền quản lý & Ghi nhận nhật ký thao tác
          </p>
        </div>

        {/* Dual Tab Switcher: Driver Attendance vs Admin Login */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 mb-4 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveScreenTab('driver_portal')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeScreenTab === 'driver_portal'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Tài Xế Điểm Danh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreenTab('admin_login')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeScreenTab === 'admin_login'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Quản Trị Viên</span>
          </button>
        </div>

        {/* TAB 1: CỔNG TÀI XẾ ĐIỂM DANH */}
        {activeScreenTab === 'driver_portal' && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-emerald-500/40 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <span>Cổng Điểm Danh Tài Xế</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Trực Tiếp
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Dành cho tài xế điểm danh ca trực, chọn trạm & trạng thái
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Không cần tài khoản quản trị!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tài xế chỉ cần nhập <strong>Mã khóa bí mật</strong> (hoặc <strong>4 số cuối SĐT</strong> / <strong>Mã TX</strong>) do quản lý cấp để tự mở điểm danh.
              </p>
            </div>

            <button
              type="button"
              id="btn-lockscreen-open-driver-portal"
              onClick={onOpenDriverPortal}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition active:scale-98"
            >
              <Radio className="w-4 h-4 text-slate-950" />
              <span>CHẠM ĐỂ ĐIỂM DANH CA TRỰC NGAY</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveScreenTab('admin_login')}
                className="text-xs text-slate-400 hover:text-amber-400 transition inline-flex items-center gap-1"
              >
                <span>Bạn là Quản lý / Điều phối viên?</span>
                <span className="underline font-semibold text-slate-300">Đăng nhập tại đây</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ĐĂNG NHẬP QUẢN TRỊ VIÊN */}
        {activeScreenTab === 'admin_login' && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl animate-in fade-in duration-200">
            
            <div className="flex items-center space-x-2.5 pb-5 border-b border-slate-800">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Xác Thực Quản Trị
                </h2>
                <p className="text-[11px] text-slate-400">
                  Đăng nhập tài khoản được cấp quyền để truy cập hệ thống
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {error && (
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-900 text-rose-400 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                  required
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400 pt-2">
                Liên hệ Admin tổng nếu bạn chưa có tài khoản hoặc cần cấp lại mật khẩu.
              </p>

            </form>

          </div>
        )}

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Bảo mật phân quyền & Ghi nhận toàn bộ nhật ký thao tác thời gian thực
        </p>

      </div>
    </div>
  );
};
