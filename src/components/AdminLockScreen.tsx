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
  Radio,
  ArrowRight,
  Shield,
  UserCheck
} from 'lucide-react';
import { authenticateUser } from '../utils/auth';
import { AuthSession } from '../types';

interface AdminLockScreenProps {
  onLoginSuccess: (user: AuthSession) => void;
  onOpenDriverCheckin: () => void;
  appName?: string;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  onLoginSuccess,
  onOpenDriverCheckin,
  appName = 'Hệ Thống Quản Lý Điểm Danh Tài Xế VietGo',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [entryMode, setEntryMode] = useState<'driver' | 'admin'>('driver');

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full min-w-0 relative z-10">
        
        {/* Brand identity */}
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 items-center justify-center text-amber-400 shadow-xl mb-3.5">
            <Radio className="h-8 w-8" />
          </div>
          <h1 className="text-lg leading-tight sm:text-2xl font-black text-white tracking-tight text-balance">
            {appName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hệ thống nội bộ: Điểm danh, điều phối ca trực, theo dõi hiệu suất và GPS tài xế VietGo
          </p>
        </div>

        {/* LOGIN FORM */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl animate-in fade-in duration-200">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-slate-700 bg-slate-950/50 p-1">
            <button type="button" onClick={() => setEntryMode('driver')} className={`min-h-11 rounded-xl px-2 py-2 text-[11px] leading-tight font-black transition ${entryMode === 'driver' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>1. Điểm danh tài xế</button>
            <button type="button" onClick={() => setEntryMode('admin')} className={`min-h-11 rounded-xl px-2 py-2 text-[11px] leading-tight font-black transition ${entryMode === 'admin' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>2. Quản trị hệ thống</button>
          </div>

          {entryMode === 'driver' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 sm:p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/15 text-emerald-300"><UserCheck className="h-6 w-6" /></div>
                <h2 className="mt-3 text-lg font-black text-white">Cổng điểm danh tài xế</h2>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">Dành cho tài xế VietGo vào/ra ca, báo nghỉ và chia sẻ GPS. Đăng nhập bằng số điện thoại cùng mã PIN riêng.</p>
                <button type="button" onClick={onOpenDriverCheckin} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-emerald-400 active:scale-98"><UserCheck className="h-4 w-4" />Mở điểm danh tài xế<ArrowRight className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 text-center text-[11px] text-slate-500">Bạn là điều phối viên hoặc Admin? Chọn tab 2 để đăng nhập quản trị.</p>
            </div>
          )}

          {entryMode === 'admin' && <>
          
          <div className="flex items-center space-x-2.5 pb-5 border-b border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Đăng Nhập Quản Trị
              </h2>
              <p className="text-[11px] text-slate-400">
                Đăng nhập tài khoản Admin hoặc Nhân viên để truy cập hệ thống
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

          </>}

          {entryMode === 'admin' && <div className="mt-5 pt-5 border-t border-slate-800">
            <p className="text-center text-xs text-slate-400 mb-3">Bạn là tài xế?</p>
            <button
              type="button"
              onClick={onOpenDriverCheckin}
              className="w-full py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-extrabold text-sm flex items-center justify-center space-x-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Điểm Danh Tài Xế</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">Đăng nhập bằng SĐT và mã định danh/PIN do quản lý cấp.</p>
          </div>}

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Bảo mật phân quyền & Ghi nhận toàn bộ nhật ký thao tác thời gian thực
        </p>

      </div>
    </div>
  );
};
