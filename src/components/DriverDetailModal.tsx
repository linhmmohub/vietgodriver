import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  HardHat, 
  Shirt, 
  Package,
  Boxes,
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Phone, 
  Calendar,
  CreditCard,
  Edit2,
  Briefcase,
  Clock,
  Hourglass,
  UserCheck,
  Key,
  Copy,
  Check,
  Activity,
  Timer,
  LogIn,
  LogOut
} from 'lucide-react';
import { AttendanceSettings, Driver, DriverAttendance, DriverAttendanceEvent, DriverRoutePoint, DriverShiftStatus } from '../types';
import { formatCurrency, formatDate, getTodayDateString } from '../utils/formatters';
import { subscribeCloudDriverRoute } from '../services/firestoreSync';

interface DriverDetailModalProps {
  driver: Driver | null;
  onClose: () => void;
  onEdit: (driver: Driver) => void;
  onApprove?: (driver: Driver) => void;
  attendanceList: DriverAttendance[];
  attendanceEvents: DriverAttendanceEvent[];
  attendanceSettings: AttendanceSettings;
}

const formatWorkDuration = (milliseconds: number) => {
  const minutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} giờ ${minutes % 60} phút` : `${minutes} phút`;
};

const attendanceEventLabel = (type: DriverAttendanceEvent['eventType']) => {
  if (type === 'check_in') return 'Vào ca';
  if (type === 'check_out') return 'Ra ca';
  if (type === 'schedule_update') return 'Cập nhật lịch';
  return 'Cập nhật trạng thái';
};

const attendanceStatusLabel = (status: DriverShiftStatus) => ({
  on_duty: 'Đang chạy VietGo',
  standby: 'Chờ điều phối',
  off_duty: 'Đã ra ca',
  emergency_leave: 'Nghỉ đột xuất',
}[status]);

const routeDistanceInKm = (points: DriverRoutePoint[]) => {
  const radians = (value: number) => value * Math.PI / 180;
  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    const dLat = radians(point.latitude - previous.latitude);
    const dLon = radians(point.longitude - previous.longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(previous.latitude)) * Math.cos(radians(point.latitude)) * Math.sin(dLon / 2) ** 2;
    return total + 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, 0);
};

export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({
  driver,
  onClose,
  onEdit,
  onApprove,
  attendanceList,
  attendanceEvents,
  attendanceSettings,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [todayRoutePoints, setTodayRoutePoints] = useState<DriverRoutePoint[]>([]);
  const todayRouteDate = getTodayDateString();

  useEffect(() => {
    if (!driver) {
      setTodayRoutePoints([]);
      return undefined;
    }
    return subscribeCloudDriverRoute(driver.id, todayRouteDate, setTodayRoutePoints);
  }, [driver?.id, todayRouteDate]);

  if (!driver) return null;

  const debt = Math.max(0, driver.uniformFeeRequired - driver.uniformFeePaid);
  const secretCode = driver.secretCode || (driver.phone ? driver.phone.replace(/\D/g, '').slice(-4) : '1234') || '1234';
  const driverEvents = attendanceEvents
    .filter(event => event.driverId === driver.id)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const driverAttendance = attendanceList
    .filter(item => item.driverId === driver.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const workPerformance = (() => {
    const ordered = [...driverEvents].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    let activeStart: number | null = null;
    let totalMs = 0;
    let completedSessions = 0;
    ordered.forEach(event => {
      const timestamp = new Date(event.occurredAt).getTime();
      if (event.eventType === 'check_in' && activeStart === null) activeStart = timestamp;
      if (event.eventType === 'check_out' && activeStart !== null) {
        totalMs += Math.max(0, timestamp - activeStart);
        completedSessions += 1;
        activeStart = null;
      }
    });
    if (activeStart !== null) totalMs += Math.max(0, Date.now() - activeStart);
    return { totalMs, completedSessions, isActive: activeStart !== null };
  })();
  const todayDistanceKm = routeDistanceInKm(todayRoutePoints);
  const latestAttendance = driverAttendance[0];
  const completedAttendanceDays = driverAttendance.filter(item => item.status === 'off_duty').length;
  const emergencyLeaveDays = driverAttendance.filter(item => item.status === 'emergency_leave').length;
  const getBusyShiftLabel = (shiftId: string) => {
    const shift = attendanceSettings.shifts.find(item => item.id === shiftId);
    if (!shift) return shiftId;
    return shift.startTime && shift.endTime ? `${shift.name} (${shift.startTime} - ${shift.endTime})` : shift.name;
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="mobile-modal-frame fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="mobile-sheet bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:max-w-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hồ Sơ Cấp Phát & Tiền Cọc
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono text-xs font-bold">
              {driver.code}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrint}
              title="In phiếu này"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">In phiếu</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Driver Title Card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {driver.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-500 dark:text-slate-400 mt-1.5 text-xs">
                {/* Direct Call Link */}
                <a 
                  href={`tel:${driver.phone}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800"
                >
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  {driver.phone} (Gọi ngay)
                </a>

                {driver.licensePlate && (
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                    {driver.licensePlate}
                  </span>
                )}
                {driver.joinDate && (
                  <span className="flex items-center text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Vào làm: {formatDate(driver.joinDate)}
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  driver.workingType === 'parttime'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  {driver.workingType === 'parttime' ? (
                    <>
                      <Clock className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400" />
                      Part-time (Bán thời gian)
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
                      Full-time (Toàn thời gian)
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              {driver.approvalStatus === 'pending' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300">
                  <Hourglass className="w-3.5 h-3.5 mr-1 animate-pulse" />
                  DANH SÁCH CHỜ (DỰ BỊ)
                </span>
              ) : driver.isRevoked ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  BỊ THU HỒI ĐỒNG PHỤC
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Đã duyệt chính thức
                </span>
              )}

              {driver.approvalStatus === 'pending' && driver.rejectionReason && (
                <span className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                  Ghi chú dự bị: {driver.rejectionReason}
                </span>
              )}
            </div>
          </div>

          {/* BẢN TÓM TẮT BÀN GIAO TRANG BỊ & TIỀN CỌC */}
          <section className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-3.5 dark:border-cyan-900/60 dark:bg-cyan-950/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300 bg-cyan-100 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300"><Activity className="h-4.5 w-4.5" /></span>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Nhật ký & hiệu suất ca làm việc</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Mỗi lần vào/ra ca mới đều được lưu thành nhật ký Cloud riêng cho tài xế này.</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${workPerformance.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                {workPerformance.isActive ? 'Đang trong ca' : 'Không trong ca'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-cyan-200 bg-white/80 p-2.5 dark:border-cyan-900/50 dark:bg-slate-900/60"><Timer className="h-4 w-4 text-cyan-600 dark:text-cyan-300" /><p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{formatWorkDuration(workPerformance.totalMs)}</p><p className="text-[10px] text-slate-500">tổng thời gian</p></div>
              <div className="rounded-xl border border-emerald-200 bg-white/80 p-2.5 dark:border-emerald-900/50 dark:bg-slate-900/60"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /><p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{workPerformance.completedSessions}</p><p className="text-[10px] text-slate-500">ca hoàn tất</p></div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5 dark:border-slate-700 dark:bg-slate-900/60"><Activity className="h-4 w-4 text-slate-600 dark:text-slate-300" /><p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{driverEvents.length}</p><p className="text-[10px] text-slate-500">mốc nhật ký</p></div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60"><p className="text-[10px] text-slate-500">Ngày đã điểm danh</p><p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{driverAttendance.length}</p></div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60"><p className="text-[10px] text-slate-500">Ngày hoàn tất</p><p className="mt-0.5 text-sm font-black text-emerald-700 dark:text-emerald-300">{completedAttendanceDays}</p></div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60"><p className="text-[10px] text-slate-500">Nghỉ đột xuất</p><p className="mt-0.5 text-sm font-black text-rose-700 dark:text-rose-300">{emergencyLeaveDays}</p></div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/60"><p className="text-[10px] text-slate-500">GPS hôm nay</p><p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{todayRoutePoints.length ? `${todayDistanceKm.toFixed(1)} km` : 'Chưa bật'}</p><p className="text-[10px] text-slate-400">{todayRoutePoints.length ? `${todayRoutePoints.length} điểm hành trình` : 'Cần tài xế chia sẻ GPS'}</p></div>
            </div>
            {latestAttendance && <div className="mt-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"><strong>Ca gần nhất:</strong> {latestAttendance.date} · {attendanceStatusLabel(latestAttendance.status)}{latestAttendance.standbyZones?.length ? ` · ${latestAttendance.standbyZones.join(' · ')}` : latestAttendance.standbyZone ? ` · ${latestAttendance.standbyZone}` : ''}</div>}

            {driverEvents.length > 0 ? (
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                {driverEvents.slice(0, 30).map(event => (
                  <div key={event.id} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900/60">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${event.eventType === 'check_in' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : event.eventType === 'check_out' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {event.eventType === 'check_in' ? <LogIn className="h-3.5 w-3.5" /> : event.eventType === 'check_out' ? <LogOut className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{attendanceEventLabel(event.eventType)} <span className="font-normal text-slate-400">· {attendanceStatusLabel(event.status)}</span></p>
                      <div className="mt-1 grid gap-x-3 gap-y-0.5 text-[10px] text-slate-500 sm:grid-cols-2">
                        <p><strong className="font-semibold text-slate-600 dark:text-slate-300">Thời điểm:</strong> {new Date(event.occurredAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        <p><strong className="font-semibold text-slate-600 dark:text-slate-300">Khu vực:</strong> {event.standbyZones?.length ? event.standbyZones.join(' · ') : 'Chưa ghi'}</p>
                        <p className="sm:col-span-2"><strong className="font-semibold text-slate-600 dark:text-slate-300">Giờ bận công ty khác:</strong> {event.busyShiftIds?.length ? event.busyShiftIds.map(getBusyShiftLabel).join(' · ') : 'Chưa ghi'}</p>
                        <p><strong className="font-semibold text-slate-600 dark:text-slate-300">Ghi nhận bởi:</strong> {event.recordedBy === 'dispatcher' ? 'Điều phối' : 'Tài xế'}</p>
                      </div>
                      {event.note && <p className="mt-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"><strong>Ghi chú:</strong> {event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : driverAttendance.length > 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">Có {driverAttendance.length} bản điểm danh tổng đã tạo trước khi nhật ký chi tiết được bật. Các mốc vào/ra ca cũ không thể khôi phục chính xác; lần điểm danh tiếp theo sẽ hiển thị đầy đủ tại đây.</div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 text-center text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">Chưa có lịch sử điểm danh cho tài xế này.</div>
            )}
          </section>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Tình Trạng Bàn Giao Trang Bị:
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    driver.hasHelmet && driver.hasShirt && driver.hasDeliveryBox !== false
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                  }`}>
                    {driver.hasHelmet && driver.hasShirt && driver.hasDeliveryBox !== false ? '✓ Đã bàn giao đủ Áo, Mũ & Thùng' : 'Thiếu trang bị'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Áo: <strong>{driver.shirtSize || 'L'} ({driver.shirtQuantity || 1} cái)</strong> • Mũ: <strong>{driver.helmetQuantity || 1} cái</strong> • Thùng: <strong>{driver.hasDeliveryBox !== false ? `${driver.boxQuantity || 1} cái` : 'Chưa cấp'}</strong> • Cọc đã thu: <strong>{formatCurrency(driver.uniformFeePaid || 0)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300/80 dark:border-amber-700 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Biên Bản Bàn Giao</span>
              </button>
            </div>
          </div>

          {/* Grid thông tin cấp phát & tiền thu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Cấp phát Mũ, Áo & Thùng */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center">
                <Boxes className="w-4 h-4 mr-1.5 text-amber-500" />
                Trang Bị & Dụng Cụ Đã Cấp
              </h3>

              <div className="space-y-2.5">
                {/* Mũ bảo hiểm */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <HardHat className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Mũ bảo hiểm:</span>
                  </div>
                  <div>
                    {driver.hasHelmet ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Đã cấp ({driver.helmetQuantity || 1} cái)
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Chưa cấp mũ
                      </span>
                    )}
                  </div>
                </div>

                {/* Áo đồng phục */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Shirt className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Áo đồng phục:</span>
                  </div>
                  <div>
                    {driver.hasShirt ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Size {driver.shirtSize || 'L'} ({driver.shirtQuantity || 1} cái)
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Chưa cấp áo
                      </span>
                    )}
                  </div>
                </div>

                {/* Thùng đựng hàng */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Thùng đựng hàng:</span>
                  </div>
                  <div>
                    {driver.hasDeliveryBox !== false ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Đã cấp ({driver.boxQuantity || 1} thùng)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Chưa cấp thùng
                      </span>
                    )}
                  </div>
                </div>

                {driver.otherItems && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Phụ kiện khác:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{driver.otherItems}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Tiền cọc */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" />
                Tài Chính / Tiền Thu Cọc
              </h3>

              <div className="space-y-2.5 font-mono">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Tiền cọc quy định:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(driver.uniformFeeRequired)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Số tiền thực tế ĐÃ THU:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(driver.uniformFeePaid)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Còn nợ:</span>
                  {debt > 0 ? (
                    <span className="font-bold text-rose-500">
                      {formatCurrency(debt)}
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans text-xs">
                      Đã nộp đủ 100%
                    </span>
                  )}
                </div>

                {driver.paymentNote && (
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-sans text-slate-500 italic">
                    Ghi chú thu tiền: {driver.paymentNote}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Box 3: THU HỒI VI PHẠM & HOÀN TIỀN (NẾU CÓ) */}
          {driver.isRevoked && (
            <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <h3 className="font-bold text-rose-800 dark:text-rose-300 text-xs uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-600" />
                Hồ Sơ Thu Hồi & Hoàn Tiền Vi Phạm
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Lý do thu hồi:</span>
                  <strong className="text-rose-600 dark:text-rose-400">{driver.revocationReason}</strong>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-0.5">Ngày thu hồi:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {driver.revocationDate ? formatDate(driver.revocationDate) : 'Chưa ghi ngày'}
                  </span>
                </div>
              </div>

              {driver.revocationReasonDetail && (
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 block mb-0.5">Chi tiết vi phạm:</span>
                  <p className="text-slate-700 dark:text-slate-300">{driver.revocationReasonDetail}</p>
                </div>
              )}

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-slate-600 dark:text-slate-400">Tình trạng thu hồi hiện vật:</span>
                  <span className="font-semibold">
                    Mũ: {driver.revokedHelmet ? '✅ Đã trả' : '❌ Chưa trả'} | Áo: {driver.revokedShirt ? '✅ Đã trả' : '❌ Chưa trả'} | Thùng: {driver.revokedBox ? '✅ Đã trả' : '❌ Chưa trả'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-slate-100 dark:border-slate-700 gap-1">
                  <span className="text-slate-600 dark:text-slate-400">Tình trạng hoàn tiền:</span>
                  {driver.refundStatus === 'refunded' ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Đã hoàn: {formatCurrency(driver.refundAmount)} {driver.refundDate ? `(${formatDate(driver.refundDate)})` : ''}
                    </span>
                  ) : driver.refundStatus === 'pending' ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      Chờ hoàn: {formatCurrency(driver.refundAmount)} (Chờ bàn giao đủ đồ)
                    </span>
                  ) : (
                    <span className="font-medium text-slate-500">
                      Không hoàn tiền (Khấu trừ vi phạm)
                    </span>
                  )}
                </div>

                {driver.refundNote && (
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    Ghi chú hoàn/khấu trừ: {driver.refundNote}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ghi chú chung */}
          {driver.generalNote && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Ghi chú chung:</span>
              <p className="text-slate-800 dark:text-slate-200">{driver.generalNote}</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 print:hidden gap-2">
          <span className="text-[11px] text-slate-400 truncate">
            Cập nhật: {formatDate(driver.updatedAt)}
          </span>
          <div className="flex items-center space-x-2">
            {driver.approvalStatus === 'pending' && onApprove && (
              <button
                onClick={() => {
                  onApprove(driver);
                }}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Duyệt chính thức
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onEdit(driver);
              }}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Sửa thông tin
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
