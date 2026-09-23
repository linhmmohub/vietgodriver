import { AttendanceSettings, AttendanceShift } from '../types';

export const VIETGO_OPERATING_START = 6 * 60;
export const VIETGO_OPERATING_END = 23 * 60;

type Interval = [number, number];

const toMinutes = (value?: string) => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const formatIntervals = (intervals: Interval[]) => intervals.map(([start, end]) => `${formatTime(start)}–${formatTime(end)}`).join(', ');

/** VietGo availability = 06:00–23:00 minus the driver's other-company working time. */
export const getVietgoAvailability = (shifts: AttendanceShift | AttendanceShift[], settings: AttendanceSettings) => {
  const shiftIds = Array.isArray(shifts) ? shifts : [shifts];
  const busy: Interval[] = [];

  shiftIds.forEach(shift => {
    const item = settings.shifts.find(value => value.id === shift);
    const start = toMinutes(item?.startTime);
    const end = toMinutes(item?.endTime);
    if (start !== null && end !== null && start !== end) {
      if (start < end) busy.push([start, end]);
      else {
        // Overnight company shifts occupy both the end of this day and start of the next/previous day.
        busy.push([0, end], [start, 24 * 60]);
      }
    }
  });

  const busyInVietgo = busy
    .map(([from, to]) => [Math.max(from, VIETGO_OPERATING_START), Math.min(to, VIETGO_OPERATING_END)] as Interval)
    .filter(([from, to]) => to > from)
    .sort((a, b) => a[0] - b[0]);

  const mergedBusy = busyInVietgo.reduce<Interval[]>((merged, interval) => {
    const last = merged[merged.length - 1];
    if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]);
    else merged.push([...interval] as Interval);
    return merged;
  }, []);
  const free: Interval[] = [];
  let cursor = VIETGO_OPERATING_START;
  mergedBusy.forEach(([from, to]) => {
    if (from > cursor) free.push([cursor, from]);
    cursor = Math.max(cursor, to);
  });
  if (cursor < VIETGO_OPERATING_END) free.push([cursor, VIETGO_OPERATING_END]);

  return {
    busyLabel: mergedBusy.length ? formatIntervals(mergedBusy) : 'Không có giờ bận cố định',
    freeLabel: free.length ? formatIntervals(free) : 'Không còn giờ rảnh trong 06:00–23:00',
    free,
  };
};
