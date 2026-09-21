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
  Search, 
  Calendar,
  X,
  Phone,
  Car,
  ChevronRight,
  ShieldAlert
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Find current session driver from drivers array
  const sessionDriver = currentDriverSession 
    ? drivers.find(d => d.id === currentDriverSession.driverId) || null
    : null;

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(() => sessionDriver);
  const [phoneConfirm, setPhoneConfirm] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State
  const [shift, setShift] = useState<AttendanceShift>('morning');
  const [status, setStatus] = useState<DriverShiftStatus>('on_duty');
  const [standbyZone, setStandbyZone] = useState('Quận 1 - Bến Thành');
  const [customZone, setCustomZone] = useState('');
  const [note, setNote] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active drivers only (approved or ready)
  const approvedDrivers: Driver[] = drivers.filter((d: Driver) => !d.isRevoked);

  const filteredDrivers: Driver[] = approvedDrivers.filter((d: Driver) => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  const activeDriver: Driver | null = sessionDriver || selectedDriver;

  // Find today's attendance for current driver
  const todayStr = new Date().toISOString().split('T')[0];
  const driverTodayAttendance = todayAttendanceList.find(a => 
    a.driverId === activeDriver?.id && a.date === todayStr
  );

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setPhoneConfirm('');
    setLoginError(null);
  };

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    // Check last 4 digits of phone or full phone for security
    const cleanPhone = selectedDriver.phone.replace(/\D/g, '');
    const cleanInput = phoneConfirm.replace(/\D/g, '');

    if (cleanPhone === cleanInput || cleanPhone.endsWith(cleanInput) && cleanInput.length >= 4) {
      onDriverLogin(selectedDriver);
      setLoginError(null);
    } else {
      setLoginError('Số điện thoại xác nhận không khớp với hồ sơ tài xế!');
    }
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
                Tài xế vào ca, chọn khung giờ, báo ra ca hoặc báo nghỉ đột xuất realtime
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

          {/* STEP 1: If no driver selected/logged in, show driver identification */}
          {!activeDriver ? (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  Bước 1: Chọn tài xế để điểm danh ca hôm nay
                </p>
                Tìm theo tên, mã số tài xế (TX-...) hoặc 4 số cuối điện thoại.
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nhập tên tài xế, mã TX hoặc SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  autoFocus
                />
              </div>

              {/* Drivers selection list */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {filteredDrivers.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Không tìm thấy tài xế nào khớp từ khóa. Vui lòng kiểm tra lại.
                  </div>
                ) : (
                  filteredDrivers.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDriver(d)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        selectedDriver?.id === d.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-white'
                          : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                          {d.code}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            {d.name}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              d.workingType === 'parttime'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {d.workingType === 'parttime' ? 'Part-time' : 'Full-time'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>SĐT: {d.phone}</span>
                            {d.licensePlate && <span>• Biển: {d.licensePlate}</span>}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  ))
                )}
              </div>

              {/* Confirm phone authentication */}
              {selectedDriver && (
                <form onSubmit={handleConfirmLogin} className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Xác nhận đăng nhập: {selectedDriver.name} ({selectedDriver.code})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDriver(null)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Đổi tài xế
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">
                      Nhập số điện thoại (hoặc 4 số cuối của SĐT tài xế) để bảo mật:
                    </label>
                    <input
                      type="password"
                      maxLength={11}
                      placeholder="Nhập SĐT xác thực..."
                      value={phoneConfirm}
                      onChange={(e) => setPhoneConfirm(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                      autoFocus
                    />
                  </div>

                  {loginError && (
                    <div className="text-xs text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Vào Ca</span>
                  </button>
                </form>
              )}
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
                      setSelectedDriver(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Thoát tài khoản</span>
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
