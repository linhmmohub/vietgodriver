import React, { useRef, useState, useMemo } from 'react';
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
import { Driver, DriverAttendance, DriverSession, AttendanceShift, DriverShiftStatus, AttendanceSettings, DriverLiveStatus, DriverRoutePoint } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { LiveDriverMap } from './LiveDriverMap';
import { getVietgoAvailability } from '../utils/availability';

const distanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface DriverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  currentDriverSession: DriverSession | null;
  onDriverLogin: (driver: Driver) => void;
  onDriverLogout: () => void;
  todayAttendanceList: DriverAttendance[];
  attendanceSettings: AttendanceSettings;
  onSubmitAttendance: (attendanceData: Array<Omit<DriverAttendance, 'id' | 'updatedAt'>>) => Promise<void>;
  liveStatus: DriverLiveStatus | null;
  onUpdateLiveStatus: (status: DriverLiveStatus) => Promise<void>;
  onStopLocationSharing: (driverId: string) => Promise<void>;
  onSaveRoutePoint: (point: DriverRoutePoint) => Promise<void>;
  liveDriverStatuses: DriverLiveStatus[];
}

export const DriverPortalModal: React.FC<DriverPortalModalProps> = ({
  isOpen,
  onClose,
  drivers,
  currentDriverSession,
  onDriverLogin,
  onDriverLogout,
  todayAttendanceList,
  attendanceSettings,
  onSubmitAttendance,
  liveStatus,
  onUpdateLiveStatus,
  onStopLocationSharing,
  onSaveRoutePoint,
  liveDriverStatuses,
}) => {
  // The public portal never exposes a directory of drivers.
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');

  // Input credentials
  const [phoneInput, setPhoneInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State for Attendance
  const [busyShifts, setBusyShifts] = useState<AttendanceShift[]>([]);
  const [status, setStatus] = useState<DriverShiftStatus | ''>('');
  const [standbyZones, setStandbyZones] = useState<string[]>([]);
  const [customZone, setCustomZone] = useState('');
  const [attendanceValidationError, setAttendanceValidationError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [absenceStartTime, setAbsenceStartTime] = useState('');
  const [absenceEndTime, setAbsenceEndTime] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [attendanceScope, setAttendanceScope] = useState<'daily' | 'weekly'>('daily');
  const [weekAnchor, setWeekAnchor] = useState(getTodayDateString);
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [shareWithTeam, setShareWithTeam] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const locationHeartbeatRef = useRef<number | null>(null);
  const latestPositionRef = useRef<GeolocationPosition | null>(null);
  const liveStatusRef = useRef<DriverLiveStatus | null>(liveStatus);
  const lastLiveUploadRef = useRef(0);
  const lastRoutePointRef = useRef<DriverRoutePoint | null>(null);
  liveStatusRef.current = liveStatus;

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

  const activeShifts = useMemo(() => [...attendanceSettings.shifts].filter(item => item.isActive).sort((a, b) => a.order - b.order), [attendanceSettings]);
  const activeZones = useMemo(() => [...attendanceSettings.zones].filter(item => item.isActive).sort((a, b) => a.order - b.order), [attendanceSettings]);

  if (!isOpen) return null;

  // Find current session driver from drivers array
  const sessionDriver = currentDriverSession 
    ? drivers.find(d => d.id === currentDriverSession.driverId) || null
    : null;

  const activeDriver: Driver | null = sessionDriver;

  // Find today's attendance for current driver
  const todayStr = getTodayDateString();
  const driverTodayAttendance = todayAttendanceList.find(a => 
    a.driverId === activeDriver?.id && a.date === todayStr
  );
  const isCheckedInForLiveTracking = driverTodayAttendance?.status === 'on_duty' || driverTodayAttendance?.status === 'standby';
  const selectedBusyShifts = busyShifts;
  const selectedAvailability = getVietgoAvailability(selectedBusyShifts, attendanceSettings);

  const clearLocationWatcher = () => {
    if (locationWatchRef.current !== null) navigator.geolocation?.clearWatch(locationWatchRef.current);
    if (locationHeartbeatRef.current !== null) window.clearInterval(locationHeartbeatRef.current);
    locationWatchRef.current = null;
    locationHeartbeatRef.current = null;
  };

  const publishLocation = async (position: GeolocationPosition, driver: Driver) => {
    const timestamp = Date.now();
    if (timestamp - lastLiveUploadRef.current < 15000) return;
    const now = new Date().toISOString();
    const previous = liveStatusRef.current;
    const status: DriverLiveStatus = {
      driverId: driver.id,
      driverCode: driver.code,
      driverName: driver.name,
      driverPhone: driver.phone,
      licensePlate: driver.licensePlate,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      heading: position.coords.heading,
      isSharingLocation: true,
      isVisibleToDrivers: shareWithTeam,
      onlineSince: previous?.isSharingLocation && Date.now() - new Date(previous.lastSeenAt).getTime() <= 2 * 60 * 1000 ? previous.onlineSince : now,
      lastSeenAt: now,
    };
    liveStatusRef.current = status;
    await onUpdateLiveStatus(status);
    lastLiveUploadRef.current = timestamp;

    const routePoint: DriverRoutePoint = {
      id: `point_${timestamp}`,
      driverId: driver.id,
      date: getTodayDateString(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      recordedAt: now,
    };
    const previousPoint = lastRoutePointRef.current;
    const distance = previousPoint ? distanceInMeters(previousPoint.latitude, previousPoint.longitude, routePoint.latitude, routePoint.longitude) : Number.POSITIVE_INFINITY;
    if (!previousPoint || timestamp - new Date(previousPoint.recordedAt).getTime() >= 60000 || distance >= 50) {
      lastRoutePointRef.current = routePoint;
      await onSaveRoutePoint(routePoint);
    }
  };

  const handleStartLocationSharing = () => {
    if (!activeDriver) return;
    if (!isCheckedInForLiveTracking) {
      setLocationError('Hãy điểm danh Vào ca hoặc Chờ điều phối trước khi bật GPS trực tuyến.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Thiết bị/trình duyệt này không hỗ trợ GPS. Hãy dùng Chrome hoặc Safari trên điện thoại.');
      return;
    }
    setLocationError(null);
    setIsLocationSharing(true);
    const sendPosition = (position: GeolocationPosition) => {
      latestPositionRef.current = position;
      void publishLocation(position, activeDriver).catch(() => setLocationError('Chưa gửi được vị trí lên Cloud. Vui lòng kiểm tra mạng và thử lại.'));
    };
    const onPositionError = (error: GeolocationPositionError) => {
      setIsLocationSharing(false);
      clearLocationWatcher();
      setLocationError(error.code === error.PERMISSION_DENIED ? 'Bạn chưa cho phép chia sẻ vị trí. Hãy bật quyền Vị trí cho trình duyệt rồi thử lại.' : 'Chưa lấy được GPS. Hãy kiểm tra tín hiệu, bật vị trí và thử lại.');
    };
    const startWatching = () => {
      locationWatchRef.current = navigator.geolocation.watchPosition(sendPosition, onPositionError, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
      locationHeartbeatRef.current = window.setInterval(() => {
        if (latestPositionRef.current) void publishLocation(latestPositionRef.current, activeDriver).catch(() => undefined);
      }, 60000);
    };
    // First obtain a fresh fix rather than relying on a cached GPS value.
    navigator.geolocation.getCurrentPosition((position) => {
      sendPosition(position);
      startWatching();
    }, onPositionError, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  };

  const handleStopLocationSharing = async () => {
    clearLocationWatcher();
    setIsLocationSharing(false);
    if (activeDriver) {
      try {
        await onStopLocationSharing(activeDriver.id);
      } catch {
        setLocationError('Không thể cập nhật trạng thái dừng GPS lên Cloud.');
      }
    }
  };

  const handleClosePortal = async () => {
    if (isLocationSharing) await handleStopLocationSharing();
    onClose();
  };

  const handleSwitchDriver = async () => {
    if (isLocationSharing) await handleStopLocationSharing();
    onDriverLogout();
    setSecretInput('');
  };

  // Handle Driver Authentication
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const inputVal = secretInput.trim();
    const phoneDigits = cleanDigits(phoneInput);

    // Driver accounts use the registered phone number plus the private PIN.
    // Do not fall back to a public identifier such as name, vehicle plate or
    // the last four digits: those are not credentials.
    if (!phoneDigits || !inputVal) {
      setLoginError('Vui lòng nhập đầy đủ số điện thoại đã đăng ký và mã PIN bí mật.');
      return;
    }
    const phoneMatchedDriver = drivers.find(driver => cleanDigits(driver.phone) === phoneDigits);
    if (!phoneMatchedDriver) {
      setLoginError('Số điện thoại chưa được cấp tài khoản tài xế. Vui lòng liên hệ quản lý.');
      return;
    }
    if (!phoneMatchedDriver.secretCode || cleanStr(phoneMatchedDriver.secretCode) !== cleanStr(inputVal)) {
      setLoginError('Mã PIN bí mật không chính xác.');
      return;
    }
    if (phoneMatchedDriver.isRevoked || phoneMatchedDriver.approvalStatus === 'pending') {
      setLoginError('Tài khoản hiện chưa đủ điều kiện điểm danh. Vui lòng liên hệ quản lý.');
      return;
    }
    onDriverLogin(phoneMatchedDriver);
    setPhoneInput('');
    setSecretInput('');
    setLoginError(null);
    return;
  };

  const handlePerformAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriver) return;

    const finalZones = Array.from(new Set([...standbyZones, ...(customZone.trim() ? [customZone.trim()] : [])]));
    if (!status) {
      setAttendanceValidationError('Vui lòng chọn trạng thái ca trước khi xác nhận.');
      return;
    }
    if (!selectedBusyShifts.length) {
      setAttendanceValidationError('Vui lòng chọn ít nhất một khung giờ bận ở công ty khác.');
      return;
    }
    if (!finalZones.length) {
      setAttendanceValidationError('Vui lòng chọn hoặc nhập ít nhất một trạm / khu vực trực chính.');
      return;
    }
    if (attendanceScope === 'weekly' && !weekDays.length) {
      setAttendanceValidationError('Vui lòng chọn ít nhất một ngày trong tuần.');
      return;
    }
    setAttendanceValidationError(null);
    const selectedStatus: DriverShiftStatus = status;
    const now = new Date().toISOString();
    const selectedShift = selectedBusyShifts[0];
    const buildRecord = (date: string, weekly = false): Omit<DriverAttendance, 'id' | 'updatedAt'> => ({
      driverId: activeDriver.id, driverCode: activeDriver.code, driverName: activeDriver.name,
      driverPhone: activeDriver.phone, licensePlate: activeDriver.licensePlate,
      workingType: activeDriver.workingType || 'fulltime', date, shift: selectedShift, busyShiftIds: selectedBusyShifts, status: selectedStatus,
      checkInTime: date === todayStr && (selectedStatus === 'on_duty' || selectedStatus === 'standby')
        ? ((driverTodayAttendance?.status === 'on_duty' || driverTodayAttendance?.status === 'standby') ? driverTodayAttendance.checkInTime || now : now)
        : undefined,
      checkOutTime: date === todayStr && selectedStatus === 'off_duty' ? now : undefined,
      note: note.trim() || undefined, standbyZone: finalZones[0], standbyZones: finalZones,
      absenceStartTime: selectedStatus === 'emergency_leave' ? absenceStartTime || undefined : undefined,
      absenceEndTime: selectedStatus === 'emergency_leave' ? absenceEndTime || undefined : undefined,
      scheduleScope: weekly ? 'weekly' : 'daily',
    });
    let records: Array<Omit<DriverAttendance, 'id' | 'updatedAt'>>;
    if (attendanceScope === 'weekly') {
      const anchor = new Date(`${weekAnchor}T12:00:00`);
      const monday = new Date(anchor);
      monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
      const weekStart = monday.toISOString().slice(0, 10);
      records = weekDays.map(day => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + day - 1);
        return { ...buildRecord(date.toISOString().slice(0, 10), true), weekStart };
      });
    } else {
      records = [buildRecord(todayStr)];
    }
    if (!records.length) return;
    await onSubmitAttendance(records);
    if (selectedStatus === 'off_duty' || selectedStatus === 'emergency_leave') await handleStopLocationSharing();
    setSubmittedMessage(
      attendanceScope === 'weekly'
        ? `✅ Đã đăng ký ${records.length} ngày trong tuần. Bạn vẫn có thể cập nhật từng ngày khi lịch thay đổi.`
        : selectedStatus === 'on_duty'
        ? '✅ Điểm danh VÀO CA thành công! Dữ liệu đã đồng bộ tức thì lên bảng điều phối.' 
        : selectedStatus === 'off_duty'
          ? '🏁 Đã báo cáo RA CA thành công. Chúc bạn nghỉ ngơi an toàn!' 
          : selectedStatus === 'emergency_leave'
            ? '⚠️ Đã gửi Báo cáo NGHỈ ĐỘT XUẤT tới đội ngũ điều phối.'
            : '✅ Đã cập nhật trạng thái làm việc thành công!'
    );

    setTimeout(() => {
      setSubmittedMessage(null);
    }, 4000);
  };

  return (
    <div className="mobile-modal-frame fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="mobile-sheet bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
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
            onClick={() => void handleClosePortal()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mobile-safe-bottom p-4 sm:p-6 overflow-y-auto space-y-4">

          {/* STEP 1: If no active driver session, show Driver Authentication UI */}
          {!activeDriver ? (
            <div className="space-y-4 max-w-lg mx-auto py-1">
              
              <form onSubmit={handleAuthSubmit} className="p-5 sm:p-6 rounded-2xl bg-slate-850 border border-slate-800 space-y-4 shadow-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5"><Phone className="w-4 h-4 text-amber-400" />Số điện thoại tài khoản</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); setLoginError(null); }}
                    placeholder="Nhập SĐT đã đăng ký với quản lý"
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>
                
                {/* MODE A: Select Driver from list */}
                {false && (
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
                      Mã định danh / PIN bí mật
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      Do quản lý cấp
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
                        "Nhập mã định danh hoặc PIN bí mật..."
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
                  1. Đăng nhập bằng <strong>số điện thoại đã đăng ký</strong> và <strong>mã PIN riêng</strong> do quản lý cấp.
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
                    <p className="mt-1 text-[10px] text-emerald-300">Thiết bị này được ghi nhớ trong 7 ngày · “Đổi tài xế” sẽ đăng xuất ngay.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSwitchDriver()}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đổi tài xế</span>
                  </button>
                </div>
              </div>

              <div className={`rounded-2xl border p-3.5 ${isLocationSharing ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2.5"><MapPin className={`mt-0.5 h-5 w-5 shrink-0 ${isLocationSharing ? 'text-emerald-400' : 'text-amber-400'}`} /><div><p className="text-xs font-black text-white">Vị trí trực tuyến cho điều phối</p><p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">Chỉ gửi GPS sau khi vào ca và khi bạn đồng ý, trong lúc cổng điểm danh đang mở. Dữ liệu cập nhật khoảng mỗi phút và tự dừng khi bạn tắt hoặc đăng xuất.</p></div></div>
                  {isLocationSharing ? <button type="button" onClick={() => void handleStopLocationSharing()} className="shrink-0 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20">Dừng chia sẻ GPS</button> : <button type="button" onClick={handleStartLocationSharing} disabled={!isCheckedInForLiveTracking} className="shrink-0 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">Bật chia sẻ vị trí</button>}
                </div>
                {!isLocationSharing && <label className="mt-3 flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-950/30 p-2.5 text-[11px] leading-relaxed text-slate-300"><input type="checkbox" checked={shareWithTeam} onChange={event => setShareWithTeam(event.target.checked)} className="mt-0.5 accent-emerald-500" /><span>Tôi đồng ý chia sẻ <strong>vị trí hiện tại</strong> với điều phối và các tài xế đang trực, để hiển thị khoảng cách giữa đội xe. Hành trình chi tiết chỉ hiển thị cho điều phối.</span></label>}
                {isLocationSharing && <p className="mt-2 text-[11px] font-semibold text-emerald-300">● Đang chia sẻ vị trí an toàn tới bảng điều phối.</p>}
                {!isLocationSharing && !isCheckedInForLiveTracking && <p className="mt-2 text-[11px] text-amber-300">Điểm danh Vào ca/Chờ điều phối để mở chức năng GPS.</p>}
                {locationError && <p className="mt-2 text-[11px] font-semibold text-rose-300">{locationError}</p>}
              </div>

              {isLocationSharing && <LiveDriverMap statuses={liveDriverStatuses} canViewLocation viewerDriverId={activeDriver.id} canViewRoute={false} compact />}

              {/* Status Message */}
              {submittedMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{submittedMessage}</span>
                </div>
              )}

              {attendanceValidationError && (
                <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-200">
                  {attendanceValidationError}
                </div>
              )}

              {/* Daily / weekly attendance scope */}
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold text-white">Cách điểm danh</div><div className="text-[11px] text-slate-400">Giày da có thể đăng ký lịch một lần cho cả tuần.</div></div><div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-700"><button type="button" onClick={() => setAttendanceScope('daily')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${attendanceScope === 'daily' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Hôm nay</button><button type="button" onClick={() => setAttendanceScope('weekly')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${attendanceScope === 'weekly' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}>Theo tuần</button></div></div>
                {attendanceScope === 'weekly' && <div className="grid sm:grid-cols-[150px_1fr] gap-2 items-center"><label className="text-[11px] text-slate-300">Chọn một ngày trong tuần<input type="date" value={weekAnchor} onChange={e => setWeekAnchor(e.target.value)} className="mt-1 w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" /></label><div><div className="text-[11px] text-slate-300 mb-1">Các ngày làm trong tuần</div><div className="grid grid-cols-7 gap-1">{['T2','T3','T4','T5','T6','T7','CN'].map((label, index) => { const day = index + 1; const selected = weekDays.includes(day); return <button key={day} type="button" onClick={() => setWeekDays(prev => selected ? prev.filter(v => v !== day) : [...prev, day].sort())} className={`py-2 rounded-lg text-[11px] font-bold ${selected ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>{label}</button>; })}</div></div></div>}
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  {attendanceScope === 'weekly' ? 'Trạng thái / lịch ca áp dụng cho các ngày đã chọn' : `Trạng thái ca hôm nay (${todayStr})`}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setStatus('on_duty'); setAttendanceValidationError(null); }}
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
                    onClick={() => { setStatus('standby'); setAttendanceValidationError(null); }}
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
                    onClick={() => { setStatus('emergency_leave'); setAttendanceValidationError(null); }}
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
                    onClick={() => { setStatus('off_duty'); setAttendanceValidationError(null); }}
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
                  Khung giờ bạn bận ở công ty khác <span className="text-[10px] font-normal text-rose-300">(bắt buộc chọn ít nhất 1)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeShifts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setBusyShifts(previous => previous.includes(item.id) ? previous.filter(value => value !== item.id) : [...previous, item.id]); setAttendanceValidationError(null); }}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        busyShifts.includes(item.id)
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-xs'
                          : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.description || 'Không cố định'}</div>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">Giờ rảnh nhận VietGo hôm nay: <strong>{selectedAvailability.freeLabel}</strong></div>
              </div>

              {/* Standby Zone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Trạm / Khu vực trực chính <span className="text-[10px] font-normal text-rose-300">(bắt buộc chọn ít nhất 1)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {activeZones.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        setStandbyZones(previous => previous.includes(zone.name) ? previous.filter(value => value !== zone.name) : [...previous, zone.name]);
                        setCustomZone('');
                        setAttendanceValidationError(null);
                      }}
                      className={`p-2 rounded-xl border text-xs font-medium text-left truncate transition ${
                        standbyZones.includes(zone.name) && !customZone
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                          : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                      }`}
                      title={zone.name}
                    >
                      {zone.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customZone}
                  onChange={(e) => { setCustomZone(e.target.value); setAttendanceValidationError(null); }}
                  placeholder="Hoặc gõ vị trí trạm cụ thể khác..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {standbyZones.length > 0 && <div className="text-[11px] text-teal-300">Đã chọn: {standbyZones.join(' · ')}</div>}
              </div>

              {/* Note / Reason for leave */}
              {status === 'emergency_leave' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <label className="text-xs font-bold text-rose-200">Bắt đầu nghỉ
                    <input type="time" value={absenceStartTime} onChange={(e) => setAbsenceStartTime(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-lg bg-slate-900 border border-rose-500/30 text-white" />
                  </label>
                  <label className="text-xs font-bold text-rose-200">Dự kiến quay lại
                    <input type="time" value={absenceEndTime} onChange={(e) => setAbsenceEndTime(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-lg bg-slate-900 border border-rose-500/30 text-white" />
                  </label>
                </div>
              )}

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
                  <span>{attendanceScope === 'weekly' ? 'XÁC NHẬN ĐĂNG KÝ LỊCH CA TUẦN' : 'XÁC NHẬN ĐIỂM DANH CA TRỰC NGAY'}</span>
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
