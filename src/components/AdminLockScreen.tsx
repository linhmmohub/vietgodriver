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
  Car
} from 'lucide-react';
import { authenticateUser } from '../utils/auth';
import { AuthSession } from '../types';

interface AdminLockScreenProps {
  onLoginSuccess: (user: AuthSession) => void;
  appName?: string;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  onLoginSuccess,
  appName = 'Quản Lý Đồng Phục Tài Xế',
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        setError(result.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!');
      }
    }, 200);
  };

  const handleQuickFillAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  const handleQuickFillStaff = () => {
    setUsername('nhanvien');
    setPassword('nv123');
    setError(null);
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

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          
          <div className="flex items-center space-x-2.5 pb-5 border-b border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Xác Thực Đăng Nhập
              </h2>
              <p className="text-[11px] text-slate-400">
                Bắt buộc đăng nhập tài khoản để truy cập dữ liệu
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
                Tên đăng nhập (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username (admin hoặc nhanvien)..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center">
                <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Mật khẩu (Password)
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
                <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Fill Buttons for Fast Testing */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold text-center mb-1">
                ⚡ Tài khoản thử nghiệm có sẵn:
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex flex-col items-start transition active:scale-98 text-left"
                >
                  <div className="flex items-center space-x-1 text-amber-400 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Tổng</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">admin / admin123</span>
                  <span className="text-[9px] text-amber-300/80 mt-0.5">Toàn quyền hệ thống</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickFillStaff}
                  className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold flex flex-col items-start transition active:scale-98 text-left"
                >
                  <div className="flex items-center space-x-1 text-indigo-400 font-bold">
                    <Car className="w-3.5 h-3.5" />
                    <span>Cấp Dưới (Staff)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">nhanvien / nv123</span>
                  <span className="text-[9px] text-indigo-300/80 mt-0.5">Chỉ thao tác mục Tài xế</span>
                </button>
              </div>
            </div>

          </form>

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Bảo mật phân quyền & Ghi lại toàn bộ nhật ký thao tác thời gian thực
        </p>

      </div>
    </div>
  );
};
