import React, { useState } from 'react';
import { 
  UserCheck, 
  LogIn, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  MapPin, 
  Calendar,
  X,
  Phone,
  Car,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  Lock,
  Sparkles
} from 'lucide-react';
import { Driver, DriverAttendance, DriverSession, AttendanceShift, DriverShiftStatus } from '../types';

interface DriverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  currentDriverSession: DriverSession | null;
  onDriverLogin: (driver: Driver) => void;
  onDriverLogout: () => void;
  todayAttendanceList: DriverAttendance[];
  onSubmitAttendance: (attendanceData: Omit<DriverAttendance, 'id' | 'updatedAt'>) => void;
}

const SHIFT_OPTIONS: { id: AttendanceShift; label: string; time: string }[] = [
  { id: 'morning', label: 'Ca Sáng', time: '06:00 - 12:00' },
  { id: 'afternoon', label: 'Ca Chiều', time: '12:00 - 18:00' },
  { id: 'evening', label: 'Ca Tối', time: '18:00 - 23:00' },
  { id: 'night', label: 'Ca Đêm', time: '23:00 - 06:00' },
  { id: 'flexible', label: 'Linh Hoạt / Tự Do', time: 'Toàn thời gian / Theo điều phối' },
];

const POPULAR_ZONES = [
  'Quận 1 - Bến Thành',
  'Quận 3 - Dân Chủ',
  'Tân Bình - Sân Bay Tân Sơn Nhất',
  'Bình Thạnh - Bến Xe Miền Đông',
  'Thủ Đức - Khu Công Nghệ Cao',
  'Quận 7 - Phú Mỹ Hưng',
  'Bình Tân - Bến Xe Miền Tây',
  'Khu vực Linh hoạt'
];

export const DriverPortalModal: React.FC<DriverPortalModalProps> = ({
  isOpen,
  onClose,
  drivers,
  currentDriverSession,
  onDriverLogin,
  onDriverLogout,
  todayAttendanceList,
  onSubmitAttendance,
}) => {
  // Input credentials for unlocking attendance - ONLY needs secret code!
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State
  const [shift, setShift] = useState<AttendanceShift>('morning');
  const [status, setStatus] = useState<DriverShiftStatus>('on_duty');
  const [standbyZone, setStandbyZone] = useState('Quận 1 - Bến Thành');
  const [customZone, setCustomZone] = useState('');
  const [note, setNote] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find current session driver from drivers array
  const sessionDriver = currentDriverSession 
    ? drivers.find(d => d.id === currentDriverSession.driverId) || null
    : null;

  const activeDriver: Driver | null = sessionDriver;

  // Find today's attendance for current driver
  const todayStr = new Date().toISOString().split('T')[0];
  const driverTodayAttendance = todayAttendanceList.find(a => 
    a.driverId === activeDriver?.id && a.date === todayStr
  );

  // Handle Driver Authentication via Secret Code ONLY
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const inputVal = secretInput.trim();

    if (!inputVal) {
      setLoginError('Vui lòng nhập Mã khóa bí mật của bạn để mở điểm danh.');
      return;
    }

    // 1) Match by secretCode directly (case-insensitive)
    let matchedDriver = drivers.find(d => {
      const code = (d.secretCode || '').trim();
      return code && code.toLowerCase() === inputVal.toLowerCase();
    });

    // 2) Fallback: if driver didn't set custom secretCode, check last 4 digits of phone
    if (!matchedDriver) {
      matchedDriver = drivers.find(d => {
        const last4 = (d.phone || '').replace(/\D/g, '').slice(-4);
        return last4 && last4 === inputVal;
      });
    }

    // 3) Support matching by Driver Code if they typed their TX code as secret
    if (!matchedDriver) {
      matchedDriver = drivers.find(d => {
        return d.code.trim().toLowerCase() === inputVal.toLowerCase();
      });
    }

    if (!matchedDriver) {
      setLoginError('Mã khóa bí mật không chính xác. Vui lòng kiểm tra lại mã được quản lý cấp!');
      return;
    }

    // Check account status
    if (matchedDriver.isRevoked) {
      setLoginError(`Tài xế [${matchedDriver.name}] đã bị thu hồi trang bị / đình chỉ công tác.`);
      return;
    }

    if (matchedDriver.approvalStatus === 'pending') {
      setLoginError(`Hồ sơ tài xế [${matchedDriver.name}] đang trong danh sách chờ duyệt, chưa kích hoạt.`);
      return;
    }

    // Success! Log in the driver
    onDriverLogin(matchedDriver);
    setSecretInput('');
    setLoginError(null);
  };

  const handlePerformAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriver) return;

    const now = new Date().toISOString();
    const finalZone = customZone.trim() || standbyZone;

    const attendanceData: Omit<DriverAttendance, 'id' | 'updatedAt'> = {
      driverId: activeDriver.id,
      driverCode: activeDriver.code,
      driverName: activeDriver.name,
      driverPhone: activeDriver.phone,
      licensePlate: activeDriver.licensePlate,
      workingType: activeDriver.workingType || 'fulltime',
      date: todayStr,
      shift,
      status,
      checkInTime: driverTodayAttendance ? driverTodayAttendance.checkInTime : now,
      checkOutTime: status === 'off_duty' ? now : undefined,
      note: note.trim() || undefined,
      standbyZone: finalZone,
    };

    onSubmitAttendance(attendanceData);
    setSubmittedMessage(
      status === 'on_duty' 
        ? '✅ Điểm danh VÀO CA thành công! Dữ liệu đã đồng bộ tức thì lên bảng điều phối.' 
        : status === 'off_duty' 
          ? '🏁 Đã báo cáo RA CA thành công. Chúc bạn nghỉ ngơi an toàn!' 
          : status === 'emergency_leave' 
            ? '⚠️ Đã gửi Báo cáo NGHỈ ĐỘT XUẤT tới đội ngũ điều phối.'
            : '✅ Đã cập nhật trạng thái làm việc thành công!'
    );

    setTimeout(() => {
      setSubmittedMessage(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Cổng Điểm Danh Tài Xế
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Đăng nhập bằng mã khóa bí mật để mở bảng điểm danh ca trực realtime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* STEP 1: If no active driver session, show Secret Code / Driver Code Login */}
          {!activeDriver ? (
            <div className="space-y-5 max-w-lg mx-auto py-2">
              
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Nhập Mã Khóa Bí Mật Để Điểm Danh
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Mỗi tài xế được cấp một mã khóa bí mật riêng từ quản lý để mở bảng điểm danh ca làm việc.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="p-6 rounded-2xl bg-slate-850 border border-slate-800 space-y-5 shadow-lg">
                
                {/* Single Field: Mã Khóa Bí Mật */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      Mã Khóa Bí Mật Điểm Danh
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium">Do quản lý cấp riêng</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={secretInput}
                      onChange={(e) => {
                        setSecretInput(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Nhập mã bí mật (VD: 8899, 1234...)"
                      className="w-full px-4 py-3.5 pr-12 bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-base text-white font-mono tracking-widest placeholder:tracking-normal placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20 text-center font-bold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                      tabIndex={-1}
                      title={showSecret ? "Ẩn mã bí mật" : "Hiện mã bí mật"}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Tài xế chỉ cần nhập đúng mã khóa bí mật được cấp để mở ca trực.
                  </p>
                </div>

                {/* Login Error Notification */}
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="leading-relaxed font-medium">{loginError}</div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-md hover:shadow-amber-500/10"
                >
                  <LogIn className="w-4 h-4" />
                  <span>MỞ BẢNG ĐIỂM DANH</span>
                </button>
              </form>

              <div className="text-center text-[11px] text-slate-500">
                💡 <span className="text-slate-400">Gợi ý:</span> Nếu bạn quên mã bí mật, vui lòng liên hệ quản lý điều phối để được cấp lại mã PIN.
              </div>

            </div>
          ) : (
            /* STEP 2: Driver is authenticated -> Show Attendance Action Form */
            <form onSubmit={handlePerformAttendance} className="space-y-5">
              
              {/* Driver info banner */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 font-mono text-sm">
                    {activeDriver.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{activeDriver.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeDriver.workingType === 'parttime'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {activeDriver.workingType === 'parttime' ? 'Part-time' : 'Full-time'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{activeDriver.phone}</span>
                      {activeDriver.licensePlate && (
                        <>
                          <span>•</span>
                          <Car className="w-3 h-3 text-slate-400" />
                          <span>{activeDriver.licensePlate}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDriverLogout();
                      setSecretInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đổi tài xế / Thoát</span>
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {submittedMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{submittedMessage}</span>
                </div>
              )}

              {/* Current Attendance State for Today */}
              {driverTodayAttendance && (
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-700/80 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Trạng thái hiện tại hôm nay:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold ${
                      driverTodayAttendance.status === 'on_duty'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : driverTodayAttendance.status === 'off_duty'
                          ? 'bg-slate-700 text-slate-300'
                          : driverTodayAttendance.status === 'emergency_leave'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {driverTodayAttendance.status === 'on_duty' && '🟢 Đang trực ca'}
                      {driverTodayAttendance.status === 'off_duty' && '⚪ Đã ra ca'}
                      {driverTodayAttendance.status === 'emergency_leave' && '🔴 Nghỉ đột xuất'}
                      {driverTodayAttendance.status === 'scheduled_leave' && '🟡 Nghỉ phép'}
                      {driverTodayAttendance.status === 'standby' && '🔵 Chờ điều phối'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Vào ca: {new Date(driverTodayAttendance.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    {driverTodayAttendance.checkOutTime && ` • Ra ca: ${new Date(driverTodayAttendance.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                </div>
              )}

              {/* Form Action Selection: What do you want to report? */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Hành Động Báo Cáo / Điểm Danh:</span>
                  <span className="text-[11px] text-amber-400 font-normal">Realtime cho Quản lý & Điều phối</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('on_duty')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      status === 'on_duty'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">Vào Ca / Chạy Xe</span>
                    <span className="text-[10px] text-slate-400">Bắt đầu trực</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('off_duty')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      status === 'off_duty'
                        ? 'bg-slate-700/80 border-slate-400 text-white font-bold ring-2 ring-slate-500/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <LogOut className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold">Báo Ra Ca</span>
                    <span className="text-[10px] text-slate-400">Kết thúc làm việc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('emergency_leave')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      status === 'emergency_leave'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-500/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-rose-300 hover:bg-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold">Nghỉ Đột Xuất</span>
                    <span className="text-[10px] text-rose-400/80">Hỏng xe / Việc gấp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('standby')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      status === 'standby'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold">Chờ Điều Phối</span>
                    <span className="text-[10px] text-slate-400">Sẵn sàng nhận lệnh</span>
                  </button>
                </div>
              </div>

              {/* Shift selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Khung Giờ Ca Làm Việc:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHIFT_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShift(s.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        shift === s.id
                          ? 'bg-amber-500/15 border-amber-500/60 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{s.label}</span>
                        {shift === s.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.time}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Standby Zone / Trạm trực */}
              {status !== 'emergency_leave' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Khu Vực Trực / Trạm Điểm Danh:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_ZONES.map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => {
                          setStandbyZone(zone);
                          setCustomZone('');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          standbyZone === zone && !customZone
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Hoặc tự gõ vị trí cụ thể (ngã tư, bến xe, quận...)..."
                    value={customZone}
                    onChange={(e) => setCustomZone(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              )}

              {/* Note / Lý do nghỉ đột xuất */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Ghi Chú Báo Cáo:</span>
                  {status === 'emergency_leave' && (
                    <span className="text-[11px] text-rose-400 font-medium">* Bắt buộc ghi rõ lý do nghỉ đột xuất</span>
                  )}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    status === 'emergency_leave'
                      ? 'Ghi rõ lý do: Xe thủng lốp, ốm sốt, việc gia đình đột xuất...'
                      : 'Ghi chú thêm nếu có (ví dụ: đã nhận đủ 2 áo 1 mũ, đang trực khu vực cổng A)...'
                  }
                  required={status === 'emergency_leave'}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition active:scale-98 ${
                    status === 'emergency_leave'
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : status === 'off_duty'
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {status === 'on_duty' && 'GỬI ĐIỂM DANH VÀO CA NGAY'}
                    {status === 'off_duty' && 'XÁC NHẬN BÁO CÁO RA CA'}
                    {status === 'emergency_leave' && 'GỬI BÁO CÁO NGHỈ ĐỘT XUẤT'}
                    {status === 'standby' && 'GỬI BÁO CÁO CHỜ ĐIỀU PHỐI'}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Đồng bộ Cloud Firestore Realtime</span>
          </div>
          <span className="font-mono text-slate-500">
            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
          </span>
        </div>

      </div>
    </div>
  );
};
