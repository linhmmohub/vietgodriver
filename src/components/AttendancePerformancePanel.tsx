import React, { useMemo } from 'react';
import { CalendarClock, CheckCircle2, Clock3, LogIn, LogOut, Timer } from 'lucide-react';
import { DriverAttendance, DriverAttendanceEvent } from '../types';

interface Props {
  events: DriverAttendanceEvent[];
  attendanceList: DriverAttendance[];
  selectedDate: string;
}

interface PerformanceItem {
  driverId: string;
  driverName: string;
  driverCode: string;
  totalMs: number;
  completedSessions: number;
  isActive: boolean;
  isLegacy: boolean;
  lastEvent?: DriverAttendanceEvent;
}

const formatDuration = (milliseconds: number) => {
  const minutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} giờ ${minutes % 60} phút` : `${minutes} phút`;
};

const eventLabel = (type: DriverAttendanceEvent['eventType']) => {
  if (type === 'check_in') return 'Vào ca';
  if (type === 'check_out') return 'Ra ca';
  if (type === 'schedule_update') return 'Cập nhật lịch';
  return 'Cập nhật trạng thái';
};

export const AttendancePerformancePanel: React.FC<Props> = ({ events, attendanceList, selectedDate }) => {
  const now = Date.now();
  const dateEvents = useMemo(() => events.filter(event => event.date === selectedDate), [events, selectedDate]);
  const legacyAttendance = useMemo(() => attendanceList.filter(item => item.date === selectedDate), [attendanceList, selectedDate]);
  const eventPerformance = useMemo<PerformanceItem[]>(() => {
    const grouped = new Map<string, DriverAttendanceEvent[]>();
    dateEvents.forEach(event => grouped.set(event.driverId, [...(grouped.get(event.driverId) || []), event]));
    return [...grouped.entries()].map(([driverId, driverEvents]) => {
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
      if (activeStart !== null && selectedDate === new Date().toLocaleDateString('en-CA')) totalMs += Math.max(0, now - activeStart);
      const first = ordered[0];
      return { driverId, driverName: first.driverName, driverCode: first.driverCode, totalMs, completedSessions, isActive: activeStart !== null, isLegacy: false, lastEvent: ordered[ordered.length - 1] };
    }).sort((a, b) => b.totalMs - a.totalMs);
  }, [dateEvents, now, selectedDate]);
  const legacyPerformance = useMemo<PerformanceItem[]>(() => legacyAttendance.map(item => {
    const checkIn = item.checkInTime ? new Date(item.checkInTime).getTime() : null;
    const checkOut = item.checkOutTime ? new Date(item.checkOutTime).getTime() : null;
    const isActive = (item.status === 'on_duty' || item.status === 'standby') && !checkOut;
    const endTime = checkOut || (isActive && selectedDate === new Date().toLocaleDateString('en-CA') ? now : null);
    return { driverId: item.driverId, driverName: item.driverName, driverCode: item.driverCode, totalMs: checkIn && endTime ? Math.max(0, endTime - checkIn) : 0, completedSessions: checkIn && checkOut ? 1 : 0, isActive, isLegacy: true };
  }).sort((a, b) => b.totalMs - a.totalMs), [legacyAttendance, now, selectedDate]);
  const performance = eventPerformance.length ? eventPerformance : legacyPerformance;
  const totals = useMemo(() => ({
    totalMs: performance.reduce((sum, item) => sum + item.totalMs, 0),
    completedSessions: performance.reduce((sum, item) => sum + item.completedSessions, 0),
    active: performance.filter(item => item.isActive).length,
  }), [performance]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"><Timer className="h-4 w-4" /></span><div><h3 className="font-black text-white">Hiệu suất ca làm việc</h3><p className="text-xs text-slate-400">Nhật ký vào/ra ca chi tiết, lưu Cloud theo từng lần thao tác.</p></div></div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300"><CalendarClock className="h-3.5 w-3.5" />{selectedDate}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3"><Clock3 className="h-4 w-4 text-cyan-300" /><p className="mt-1.5 text-lg font-black text-white sm:text-2xl">{formatDuration(totals.totalMs)}</p><p className="text-[10px] text-cyan-100">tổng thời gian</p></div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /><p className="mt-1.5 text-lg font-black text-white sm:text-2xl">{totals.completedSessions}</p><p className="text-[10px] text-emerald-100">ca đã hoàn tất</p></div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3"><LogIn className="h-4 w-4 text-amber-300" /><p className="mt-1.5 text-lg font-black text-white sm:text-2xl">{totals.active}</p><p className="text-[10px] text-amber-100">đang trong ca</p></div>
      </div>
      <div className="mt-4 grid gap-2 lg:grid-cols-2">
        {performance.length === 0 ? <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-xs text-slate-400">Chưa có lần vào/ra ca nào trong ngày được chọn.</p> : performance.map(item => (
          <div key={item.driverId} className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold text-white">{item.driverName}</p><p className="text-[10px] font-mono text-slate-400">{item.driverCode}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{item.isActive ? 'Đang trong ca' : item.isLegacy ? 'Bản ghi tổng' : `${item.completedSessions} ca xong`}</span></div>
            <p className="mt-2 text-xs font-bold text-cyan-200">{formatDuration(item.totalMs)} làm việc</p>
            <p className="mt-1 text-[10px] text-slate-400">{item.lastEvent ? `Lần cuối: ${eventLabel(item.lastEvent.eventType)} · ${new Date(item.lastEvent.occurredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Bản ghi cũ: chưa có nhật ký từng mốc vào/ra ca.'}</p>
          </div>
        ))}
      </div>
      {dateEvents.length > 0 && <div className="mt-4 border-t border-slate-800 pt-3"><p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Lịch sử mới nhất</p><div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{dateEvents.slice(0, 12).map(event => <div key={event.id} className="min-w-[145px] rounded-xl border border-slate-700 bg-slate-950/50 p-2.5"><p className={`text-[11px] font-bold ${event.eventType === 'check_in' ? 'text-emerald-300' : event.eventType === 'check_out' ? 'text-rose-300' : 'text-slate-300'}`}>{event.eventType === 'check_in' ? <LogIn className="mr-1 inline h-3.5 w-3.5" /> : event.eventType === 'check_out' ? <LogOut className="mr-1 inline h-3.5 w-3.5" /> : null}{eventLabel(event.eventType)}</p><p className="mt-1 truncate text-[10px] text-slate-300">{event.driverName}</p><p className="text-[10px] text-slate-500">{new Date(event.occurredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p></div>)}</div></div>}
      {!dateEvents.length && legacyAttendance.length > 0 && <p className="mt-3 text-[11px] text-amber-300">Đang hiển thị bản điểm danh tổng cũ. Nhật ký chi tiết sẽ được tạo từ lần điểm danh tiếp theo.</p>}
    </section>
  );
};
