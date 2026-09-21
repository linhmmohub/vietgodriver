import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Users, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  LogOut, 
  Phone, 
  Car, 
  ShieldAlert, 
  Send, 
  UserCheck, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  UserPlus
} from 'lucide-react';
import { Driver, DriverAttendance, AttendanceShift, DriverShiftStatus } from '../types';

interface DispatchDashboardProps {
  drivers: Driver[];
  attendanceList: DriverAttendance[];
  onOpenDriverPortal: () => void;
  onUpdateAttendanceStatus: (attendance: DriverAttendance, newStatus: DriverShiftStatus, note?: string) => void;
  onAdminCheckInDriver: (driver: Driver, shift: AttendanceShift, status: DriverShiftStatus, zone?: string, note?: string) => void;
}

const SHIFT_LABELS: Record<AttendanceShift, { label: string; time: string; badge: string }> = {
  morning: { label: 'Ca Sáng', time: '06:00 - 12:00', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  afternoon: { label: 'Ca Chiều', time: '12:00 - 18:00', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  evening: { label: 'Ca Tối', time: '18:00 - 23:00', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  night: { label: 'Ca Đêm', time: '23:00 - 06:00', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  flexible: { label: 'Linh Hoạt', time: 'Toàn thời gian', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
};

export const DispatchDashboard: React.FC<DispatchDashboardProps> = ({
  drivers,
  attendanceList,
  onOpenDriverPortal,
  onUpdateAttendanceStatus,
  onAdminCheckInDriver,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick checkin modal state
  const [isQuickCheckinOpen, setIsQuickCheckinOpen] = useState(false);
  const [selectedDriverForCheckin, setSelectedDriverForCheckin] = useState<Driver | null>(null);
  const [quickShift, setQuickShift] = useState<AttendanceShift>('morning');
  const [quickStatus, setQuickStatus] = useState<DriverShiftStatus>('on_duty');
  const [quickZone, setQuickZone] = useState('Quận 1 - Bến Thành');
  const [quickNote, setQuickNote] = useState('');

  // Filter attendance by selected date
  const dateAttendanceList = useMemo(() => {
    return attendanceList.filter(a => a.date === selectedDate);
  }, [attendanceList, selectedDate]);

  // Realtime KPIs
  const stats = useMemo(() => {
    const onDuty = dateAttendanceList.filter(a => a.status === 'on_duty');
    const offDuty = dateAttendanceList.filter(a => a.status === 'off_duty');
    const emergencyLeave = dateAttendanceList.filter(a => a.status === 'emergency_leave');
    const standby = dateAttendanceList.filter(a => a.status === 'standby');

    const fulltimeWorking = onDuty.filter(a => a.workingType === 'fulltime').length;
    const parttimeWorking = onDuty.filter(a => a.workingType === 'parttime').length;

    // Drivers not checked in today yet
    const checkedInDriverIds = new Set(dateAttendanceList.map(a => a.driverId));
    const activeDrivers = drivers.filter(d => !d.isRevoked);
    const notCheckedIn = activeDrivers.filter(d => !checkedInDriverIds.has(d.id));

    return {
      totalActiveDrivers: activeDrivers.length,
      checkedInTotal: dateAttendanceList.length,
      onDutyCount: onDuty.length,
      offDutyCount: offDuty.length,
      emergencyLeaveCount: emergencyLeave.length,
      standbyCount: standby.length,
      fulltimeWorking,
      parttimeWorking,
      notCheckedInCount: notCheckedIn.length,
      notCheckedInDrivers: notCheckedIn,
    };
  }, [dateAttendanceList, drivers]);

  // Filtered attendance for table
  const filteredAttendance = useMemo(() => {
    return dateAttendanceList.filter(item => {
      const matchShift = filterShift === 'all' || item.shift === filterShift;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchType = filterType === 'all' || item.workingType === filterType;
      const matchSearch = 
        item.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.driverCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.driverPhone.includes(searchQuery) ||
        (item.standbyZone && item.standbyZone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchShift && matchStatus && matchType && matchSearch;
    });
  }, [dateAttendanceList, filterShift, filterStatus, filterType, searchQuery]);

  const handleOpenQuickCheckin = (driver?: Driver) => {
    if (driver) {
      setSelectedDriverForCheckin(driver);
    } else {
      // Pick first non-checked in driver
      const candidate = stats.notCheckedInDrivers[0] || drivers[0] || null;
      setSelectedDriverForCheckin(candidate);
    }
    setQuickNote('');
    setIsQuickCheckinOpen(true);
  };

  const handleConfirmQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverForCheckin) return;

    onAdminCheckInDriver(
      selectedDriverForCheckin,
      quickShift,
      quickStatus,
      quickZone,
      quickNote.trim() || undefined
    );

    setIsQuickCheckinOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Realtime Dispatch & Action Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Trung Tâm Điều Phối & Điểm Danh Ca Trực
                </h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Realtime Cloud
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Theo dõi tức thì tài xế đang chạy ca, phân bổ Fulltime/Parttime, giờ ra ca và báo cáo nghỉ đột xuất.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 mr-2 text-amber-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white focus:outline-hidden text-xs font-medium cursor-pointer"
              />
            </div>

            {/* Quick Dispatch Button for Drivers */}
            <button
              onClick={onOpenDriverPortal}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md transition active:scale-95"
            >
              <UserCheck className="w-4 h-4 mr-1.5 text-slate-950 stroke-[2.5]" />
              Mở Cổng Tài Xế Điểm Danh
            </button>

            {/* Quick Check-in by Admin */}
            <button
              onClick={() => handleOpenQuickCheckin()}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-750 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-emerald-400" />
              Điểm danh hộ
            </button>
          </div>

        </div>

        {/* Real-time KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          
          {/* 1. Đang chạy ca */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Đang Chạy Ca</span>
              <Radio className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-300 font-mono">
                {stats.onDutyCount}
              </span>
              <span className="text-[11px] text-emerald-400/80">
                {stats.fulltimeWorking} FT • {stats.parttimeWorking} PT
              </span>
            </div>
          </div>

          {/* 2. Sẵn sàng chờ lệnh */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Chờ Điều Phối</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {stats.standbyCount}
              </span>
              <span className="text-[11px] text-cyan-400/80">Sẵn sàng</span>
            </div>
          </div>

          {/* 3. Ra ca / Nghỉ */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Đã Ra Ca</span>
              <LogOut className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-300 font-mono">
                {stats.offDutyCount}
              </span>
              <span className="text-[11px] text-slate-400">Kết thúc ca</span>
            </div>
          </div>

          {/* 4. Nghỉ đột xuất */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
              <span>Nghỉ Đột Xuất</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-300 font-mono">
                {stats.emergencyLeaveCount}
              </span>
              <span className="text-[11px] text-rose-400/80">Cần lưu ý</span>
            </div>
          </div>

          {/* 5. Chưa điểm danh */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Chưa Điểm Danh</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {stats.notCheckedInCount}
              </span>
              <span className="text-[11px] text-amber-400/80">/ {stats.totalActiveDrivers} TX</span>
            </div>
          </div>

          {/* 6. Tỷ lệ huy động */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Tỷ Lệ Trực</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-purple-300 font-mono">
                {stats.totalActiveDrivers > 0 
                  ? Math.round((stats.onDutyCount / stats.totalActiveDrivers) * 100) 
                  : 0}%
              </span>
              <span className="text-[11px] text-purple-400/80">Hôm nay</span>
            </div>
          </div>

        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-lg">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Tất cả trạng thái ca ({dateAttendanceList.length})</option>
            <option value="on_duty">🟢 Đang chạy ca ({stats.onDutyCount})</option>
            <option value="standby">🔵 Chờ điều phối ({stats.standbyCount})</option>
            <option value="off_duty">⚪ Đã ra ca ({stats.offDutyCount})</option>
            <option value="emergency_leave">🔴 Nghỉ đột xuất ({stats.emergencyLeaveCount})</option>
          </select>

          {/* Filter Shift */}
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Tất cả khung giờ ca</option>
            <option value="morning">Ca Sáng (06:00 - 12:00)</option>
            <option value="afternoon">Ca Chiều (12:00 - 18:00)</option>
            <option value="evening">Ca Tối (18:00 - 23:00)</option>
            <option value="night">Ca Đêm (23:00 - 06:00)</option>
            <option value="flexible">Linh Hoạt / Tự Do</option>
          </select>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Fulltime & Parttime</option>
            <option value="fulltime">Chỉ Full-time</option>
            <option value="parttime">Chỉ Part-time</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã TX, trạm, lý do..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
          />
        </div>

      </div>

      {/* Main Table: Driver Attendance List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Bảng Theo Dõi Điều Phối Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {filteredAttendance.length} lượt
            </span>
          </div>
        </div>

        {filteredAttendance.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Radio className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">
              {dateAttendanceList.length === 0 
                ? `Chưa có tài xế nào điểm danh trong ngày ${selectedDate}.` 
                : 'Không có tài xế nào khớp bộ lọc tìm kiếm.'}
            </p>
            {stats.notCheckedInDrivers.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => handleOpenQuickCheckin()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                >
                  Điểm danh ngay cho tài xế ({stats.notCheckedInDrivers.length} tài xế chưa điểm danh)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tài Xế</th>
                  <th className="py-3.5 px-3">Hình Thức</th>
                  <th className="py-3.5 px-3">Khung Giờ Ca</th>
                  <th className="py-3.5 px-3">Trạng Thái Làm Việc</th>
                  <th className="py-3.5 px-3">Giờ Vào / Ra Ca</th>
                  <th className="py-3.5 px-4">Trạm / Khu Vực Trực</th>
                  <th className="py-3.5 px-4">Ghi Chú / Lý Do Nghỉ</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác Điều Phối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredAttendance.map((item) => {
                  const shiftInfo = SHIFT_LABELS[item.shift] || SHIFT_LABELS.flexible;
                  const isEmergency = item.status === 'emergency_leave';

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/40 transition ${
                        isEmergency ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Driver info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                            {item.driverCode}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{item.driverName}</span>
                              {item.licensePlate && (
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded-sm">
                                  {item.licensePlate}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{item.driverPhone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Working Type */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.workingType === 'parttime'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.workingType === 'parttime' ? 'Part-time' : 'Full-time'}
                        </span>
                      </td>

                      {/* Shift */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className={`inline-block w-fit px-2 py-0.5 rounded-md text-[10px] font-bold border ${shiftInfo.badge}`}>
                            {shiftInfo.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {shiftInfo.time}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          item.status === 'on_duty'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : item.status === 'standby'
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : item.status === 'emergency_leave'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            item.status === 'on_duty' ? 'bg-emerald-400' :
                            item.status === 'standby' ? 'bg-cyan-400' :
                            item.status === 'emergency_leave' ? 'bg-rose-400' : 'bg-slate-500'
                          }`}></span>
                          {item.status === 'on_duty' && 'Đang chạy ca'}
                          {item.status === 'standby' && 'Chờ điều phối'}
                          {item.status === 'emergency_leave' && 'Nghỉ đột xuất'}
                          {item.status === 'off_duty' && 'Đã ra ca'}
                        </span>
                      </td>

                      {/* Checkin / Checkout times */}
                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        <div className="text-slate-200">
                          Vào: {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                        {item.checkOutTime && (
                          <div className="text-slate-400 mt-0.5">
                            Ra: {new Date(item.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      {/* Standby Zone */}
                      <td className="py-3.5 px-4">
                        {item.standbyZone ? (
                          <div className="flex items-center text-xs text-slate-200">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{item.standbyZone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Chưa đăng ký trạm</span>
                        )}
                      </td>

                      {/* Note / Emergency reason */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {item.note ? (
                          <div className={`text-xs p-1.5 rounded-lg border ${
                            isEmergency 
                              ? 'bg-rose-950/60 border-rose-900 text-rose-300 font-medium'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                          }`}>
                            {item.note}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Quick Status Switching by Dispatcher */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {item.status !== 'on_duty' && (
                            <button
                              onClick={() => onUpdateAttendanceStatus(item, 'on_duty')}
                              title="Chuyển sang Đang chạy ca"
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-[11px] font-semibold transition"
                            >
                              Vào ca
                            </button>
                          )}
                          {item.status !== 'standby' && item.status !== 'off_duty' && (
                            <button
                              onClick={() => onUpdateAttendanceStatus(item, 'standby')}
                              title="Chuyển sang Chờ điều phối"
                              className="px-2 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg text-[11px] font-semibold transition"
                            >
                              Chờ
                            </button>
                          )}
                          {item.status !== 'off_duty' && (
                            <button
                              onClick={() => onUpdateAttendanceStatus(item, 'off_duty')}
                              title="Chuyển sang Ra ca"
                              className="px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-[11px] font-semibold transition"
                            >
                              Ra ca
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Non Checked-in Drivers Alert Box */}
      {stats.notCheckedInDrivers.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                Tài Xế Chưa Điểm Danh Hôm Nay ({stats.notCheckedInDrivers.length})
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              Cần liên hệ nhắc nhở hoặc nắm bắt lý do vắng mặt
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {stats.notCheckedInDrivers.slice(0, 9).map(d => (
              <div 
                key={d.id} 
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-amber-400 font-mono">{d.code}</span>
                    <span>{d.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{d.phone}</span>
                    <span className="text-slate-600">•</span>
                    <span>{d.workingType === 'parttime' ? 'Part-time' : 'Full-time'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenQuickCheckin(d)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-[11px] transition"
                >
                  Điểm danh
                </button>
              </div>
            ))}
          </div>
          
          {stats.notCheckedInDrivers.length > 9 && (
            <p className="text-xs text-slate-500 text-center mt-3">
              ... và {stats.notCheckedInDrivers.length - 9} tài xế khác chưa điểm danh
            </p>
          )}
        </div>
      )}

      {/* Quick Check-in Modal for Admin */}
      {isQuickCheckinOpen && selectedDriverForCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-amber-400" />
              Điểm Danh Hộ: {selectedDriverForCheckin.name} ({selectedDriverForCheckin.code})
            </h3>

            <form onSubmit={handleConfirmQuickCheckin} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Chọn tài xế:</label>
                <select
                  value={selectedDriverForCheckin.id}
                  onChange={(e) => {
                    const found = drivers.find(d => d.id === e.target.value);
                    if (found) setSelectedDriverForCheckin(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name} ({d.phone}) [{d.workingType === 'parttime' ? 'Part-time' : 'Full-time'}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Khung giờ ca:</label>
                <select
                  value={quickShift}
                  onChange={(e) => setQuickShift(e.target.value as AttendanceShift)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                >
                  <option value="morning">Ca Sáng (06:00 - 12:00)</option>
                  <option value="afternoon">Ca Chiều (12:00 - 18:00)</option>
                  <option value="evening">Ca Tối (18:00 - 23:00)</option>
                  <option value="night">Ca Đêm (23:00 - 06:00)</option>
                  <option value="flexible">Linh Hoạt / Tự Do</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Trạng thái:</label>
                <select
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value as DriverShiftStatus)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                >
                  <option value="on_duty">🟢 Đang trực ca / Đang chạy</option>
                  <option value="standby">🔵 Chờ điều phối</option>
                  <option value="off_duty">⚪ Đã ra ca</option>
                  <option value="emergency_leave">🔴 Nghỉ đột xuất / Báo hỏng xe</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Trạm / Khu vực trực:</label>
                <input
                  type="text"
                  value={quickZone}
                  onChange={(e) => setQuickZone(e.target.value)}
                  placeholder="Nhập trạm hoặc khu vực..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Ghi chú điều phối:</label>
                <textarea
                  rows={2}
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Ghi chú thêm nếu có..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCheckinOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
                >
                  Lưu Điểm Danh
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
