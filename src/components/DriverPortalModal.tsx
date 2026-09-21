import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Search,
  User,
  Check,
  ChevronRight,
  Info
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
  // Login Mode: 'direct_code' or 'select_driver'
  const [loginMode, setLoginMode] = useState<'direct_code' | 'select_driver'>('select_driver');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');

  // Input credentials
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State for Attendance
  const [shift, setShift] = useState<AttendanceShift>('morning');
  const [status, setStatus] = useState<DriverShiftStatus>('on_duty');
  const [standbyZone, setStandbyZone] = useState('Quận 1 - Bến Thành');
  const [customZone, setCustomZone] = useState('');
  const [note, setNote] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Helper string cleaner
  const cleanStr = (s?: string | number) => String(s || '').toLowerCase().replace(/[\s\-_.\+()]/g, '');
  const cleanDigits = (s?: string | number) => String(s || '').replace(/\D/g, '');

  // Filter active approved drivers for list selection
  const selectableDrivers = useMemo(() => {
    return drivers.filter(d => !d.isRevoked);
  }, [drivers]);

  const searchedDrivers = useMemo(() => {
    const q = driverSearchQuery.trim().toLowerCase();
    if (!q) return selectableDrivers;
    return selectableDrivers.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      (d.licensePlate && d.licensePlate.toLowerCase().includes(q))
    );
  }, [selectableDrivers, driverSearchQuery]);

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

  // Handle Driver Authentication
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const inputVal = secretInput.trim();

    if (drivers.length === 0) {
      setLoginError('Hệ thống chưa có dữ liệu tài xế. Vui lòng liên hệ Quản lý tạo hồ sơ tài xế trước.');
      return;
    }

    if (!inputVal) {
      setLoginError('Vui lòng nhập Mã khóa bí mật hoặc 4 số cuối SĐT của bạn.');
      return;
    }

    let matchedDriver: Driver | undefined;

    // CASE 1: Driver selected their name first (Selected Driver Mode)
    if (loginMode === 'select_driver' && selectedDriverId) {
      const targetDriver = drivers.find(d => d.id === selectedDriverId);
      if (targetDriver) {
        const rawCode = (targetDriver.secretCode || '').trim();
        const phoneDigits = cleanDigits(targetDriver.phone);
        const last4 = phoneDigits.slice(-4);
        const cleanedInput = cleanStr(inputVal);
        const digitsInput = cleanDigits(inputVal);

        // Check matching
        const isMatched = 
          (rawCode && cleanStr(rawCode) === cleanedInput) ||
          (rawCode && cleanDigits(rawCode) === digitsInput) ||
          (last4 && (digitsInput === last4 || cleanedInput === last4)) ||
          (phoneDigits && digitsInput === phoneDigits) ||
          cleanStr(targetDriver.code) === cleanedInput;

        if (isMatched) {
          matchedDriver = targetDriver;
        } else {
          setLoginError(`Mã xác thực không đúng với tài xế [${targetDriver.name}]. Bạn có thể thử lại bằng 4 số cuối SĐT (${last4}) hoặc mã PIN do quản lý cấp.`);
          return;
        }
      }
    }

    // CASE 2: Direct Code Mode (Scan across all drivers)
    if (!matchedDriver) {
      const cleanedInput = cleanStr(inputVal);
      const digitsInput = cleanDigits(inputVal);

      // 1) Match by custom secretCode
      matchedDriver = drivers.find(d => {
        const c = cleanStr(d.secretCode);
        return c && (c === cleanedInput || (digitsInput && cleanDigits(d.secretCode) === digitsInput));
      });

      // 2) Match by last 4 digits of phone
      if (!matchedDriver && digitsInput.length >= 4) {
        matchedDriver = drivers.find(d => {
          const last4 = cleanDigits(d.phone).slice(-4);
          return last4 && last4 === digitsInput.slice(-4);
        });
      }

      // 3) Match by full phone number
      if (!matchedDriver && digitsInput.length >= 7) {
        matchedDriver = drivers.find(d => {
          const p = cleanDigits(d.phone);
          return p && p === digitsInput;
        });
      }

      // 4) Match by Driver Code (e.g. TX-101, 101, TX101)
      if (!matchedDriver) {
        matchedDriver = drivers.find(d => {
          const c = cleanStr(d.code);
          return c && (c === cleanedInput || c.replace('tx', '') === cleanedInput);
        });
      }

      // 5) Match by License Plate
      if (!matchedDriver && cleanedInput.length >= 4) {
        matchedDriver = drivers.find(d => {
          const plate = cleanStr(d.licensePlate);
          return plate && plate === cleanedInput;
        });
      }
    }

    if (!matchedDriver) {
      setLoginError('Mã khóa bí mật không khớp với bất kỳ tài xế nào trong hệ thống. Hãy thử chọn tên của bạn ở tab "Chọn Danh Sách" hoặc liên hệ Quản lý.');
      return;
    }

    // Check account status
    if (matchedDriver.isRevoked) {
      setLoginError(`Tài xế [${matchedDriver.name}] đã bị thu hồi trang bị / tạm dừng công tác.`);
      return;
    }

    if (matchedDriver.approvalStatus === 'pending') {
      setLoginError(`Hồ sơ tài xế [${matchedDriver.name}] đang trong danh sách chờ duyệt, vui lòng liên hệ quản lý để được kích hoạt.`);
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
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
                Điểm danh vào ca, chọn trạm trực & báo trạng thái realtime
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">

          {/* STEP 1: If no active driver session, show Driver Authentication UI */}
          {!activeDriver ? (
            <div className="space-y-4 max-w-lg mx-auto py-1">
              
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('select_driver');
                    setLoginError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    loginMode === 'select_driver'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>1. Chọn Tên Bạn</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('direct_code');
                    setLoginError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    loginMode === 'direct_code'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>2. Nhập Mã Trực Tiếp</span>
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="p-5 sm:p-6 rounded-2xl bg-slate-850 border border-slate-800 space-y-4 shadow-xl">
                
                {/* MODE A: Select Driver from list */}
                {loginMode === 'select_driver' && (
                  <div className="space-y-3 animate-in fade-in">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-amber-400" />
                        Chọn tài xế của bạn
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({selectableDrivers.length} tài xế sẵn sàng)
                      </span>
                    </label>

                    {/* Search box for driver */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={driverSearchQuery}
                        onChange={(e) => setDriverSearchQuery(e.target.value)}
                        placeholder="Tìm nhanh theo tên, SĐT hoặc Mã TX..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    {/* Driver List Scrollable Selector */}
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 rounded-xl border border-slate-800 p-1.5 bg-slate-900/60">
                      {searchedDrivers.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-500">
                          Không tìm thấy tài xế nào khớp với từ khóa.
                        </div>
                      ) : (
                        searchedDrivers.map((drv) => {
                          const isSelected = selectedDriverId === drv.id;
                          const last4 = cleanDigits(drv.phone).slice(-4);

                          return (
                            <button
                              key={drv.id}
                              type="button"
                              onClick={() => {
                                setSelectedDriverId(drv.id);
                                setLoginError(null);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between border ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-xs'
                                  : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className={`h-8 w-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {drv.code.replace('TX-', '')}
                                </div>
                                <div className="truncate">
                                  <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                                    <span>{drv.name}</span>
                                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1 rounded">
                                      {drv.code}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>SĐT: {drv.phone}</span>
                                    {drv.licensePlate && <span>• {drv.licensePlate}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0 pl-2">
                                {isSelected ? (
                                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {selectedDriverId && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Đã chọn: <strong>{drivers.find(d => d.id === selectedDriverId)?.name}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Password / PIN Input (Used in both modes) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      {loginMode === 'select_driver'
                        ? 'Mã PIN / Mật mã xác thực bí mật'
                        : 'Mã Khóa Bí Mật / 4 số cuối SĐT / Mã TX'}
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      {loginMode === 'select_driver' ? 'Hoặc 4 số cuối SĐT' : 'Tự động nhận diện'}
                    </span>
                  </label>

                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={secretInput}
                      onChange={(e) => {
                        setSecretInput(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder={
                        loginMode === 'select_driver'
                          ? "Nhập mã PIN riêng hoặc 4 số cuối SĐT..."
                          : "Nhập mã bí mật, SĐT hoặc Mã TX (VD: 8899, 1234, TX-101)..."
                      }
                      className="w-full px-4 py-3 pr-12 bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white font-mono tracking-wider placeholder:tracking-normal placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400/20 font-bold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                      tabIndex={-1}
                      title={showSecret ? "Ẩn mã" : "Hiện mã"}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-lg hover:shadow-amber-500/20 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>XÁC NHẬN VÀ MỞ ĐIỂM DANH</span>
                </button>
              </form>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Info className="w-3.5 h-3.5" />
                  <span>Hướng dẫn tài xế:</span>
                </div>
                <p>
                  1. Tài xế có thể chọn tên mình ở danh sách rồi nhập <strong>Mã PIN riêng</strong> hoặc <strong>4 số cuối SĐT</strong>.
                </p>
                <p>
                  2. Nếu chưa rõ mã bí mật, vui lòng liên hệ quản lý điều phối để được xem hoặc cấp lại.
                </p>
              </div>

            </div>
          ) : (
            /* STEP 2: Driver is authenticated -> Show Attendance Action Form */
            <form onSubmit={handlePerformAttendance} className="space-y-4">
              
              {/* Driver info banner */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 font-mono text-sm">
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
                    <span>Đổi tài xế</span>
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

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  Trạng thái ca hôm nay ({todayStr})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('on_duty')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                      status === 'on_duty'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-black text-xs sm:text-sm text-emerald-400">VÀO CA CHẠY</span>
                      <CheckCircle2 className={`w-4 h-4 ${status === 'on_duty' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400">Đang trực tuyến chạy xe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('standby')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                      status === 'standby'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-black text-xs sm:text-sm text-blue-400">CHỜ ĐIỀU PHỐI</span>
                      <Clock className={`w-4 h-4 ${status === 'standby' ? 'text-blue-400' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400">Sẵn sàng nhận cuốc/trạm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('emergency_leave')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                      status === 'emergency_leave'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-black text-xs sm:text-sm text-rose-400">NGHỈ ĐỘT XUẤT</span>
                      <AlertTriangle className={`w-4 h-4 ${status === 'emergency_leave' ? 'text-rose-400' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400">Hỏng xe / việc gấp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('off_duty')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                      status === 'off_duty'
                        ? 'bg-slate-700 border-slate-500 text-slate-200 ring-2 ring-slate-500/30 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-black text-xs sm:text-sm text-slate-300">KẾT THÚC RA CA</span>
                      <LogOut className={`w-4 h-4 ${status === 'off_duty' ? 'text-slate-300' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400">Hoàn thành ca làm</span>
                  </button>
                </div>
              </div>

              {/* Shift Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Khung giờ ca trực
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHIFT_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setShift(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        shift === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-xs'
                          : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Standby Zone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Trạm / Khu vực trực chính
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {POPULAR_ZONES.map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => {
                        setStandbyZone(zone);
                        setCustomZone('');
                      }}
                      className={`p-2 rounded-xl border text-xs font-medium text-left truncate transition ${
                        standbyZone === zone && !customZone
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                          : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                      }`}
                      title={zone}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value)}
                  placeholder="Hoặc gõ vị trí trạm cụ thể khác..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Note / Reason for leave */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Ghi chú cho điều phối viên {status === 'emergency_leave' && <span className="text-rose-400">* (Ghi rõ lý do hỏng xe / việc bận)</span>}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú thêm về phương tiện, tuyến đường hoặc lý do nếu có..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Submit Attendance Record */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition active:scale-98 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>XÁC NHẬN ĐIỂM DANH CA TRỰC NGAY</span>
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
