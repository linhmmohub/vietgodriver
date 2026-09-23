import React, { useState } from 'react';
import { CalendarClock, MapPin, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { AttendanceSettings, AttendanceShiftOption, AttendanceZoneOption } from '../types';

interface Props {
  settings: AttendanceSettings;
  onSave: (settings: AttendanceSettings) => void;
}

const newShift = (): AttendanceShiftOption => ({ id: '', name: '', startTime: '', endTime: '', description: '', isActive: true, order: 0 });
const newZone = (): AttendanceZoneOption => ({ id: '', name: '', description: '', isActive: true, order: 0 });
const makeId = (prefix: string, name: string) => `${prefix}_${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || Date.now()}`;

export const AttendanceSettingsManagementView: React.FC<Props> = ({ settings, onSave }) => {
  const [shiftForm, setShiftForm] = useState<AttendanceShiftOption | null>(null);
  const [zoneForm, setZoneForm] = useState<AttendanceZoneOption | null>(null);

  const saveShift = () => {
    if (!shiftForm?.name.trim()) return;
    const item = { ...shiftForm, id: shiftForm.id || makeId('shift', shiftForm.name), name: shiftForm.name.trim(), order: shiftForm.order || settings.shifts.length + 1 };
    const exists = settings.shifts.some(s => s.id === item.id);
    onSave({ ...settings, shifts: exists ? settings.shifts.map(s => s.id === item.id ? item : s) : [...settings.shifts, item] });
    setShiftForm(null);
  };

  const saveZone = () => {
    if (!zoneForm?.name.trim()) return;
    const item = { ...zoneForm, id: zoneForm.id || makeId('zone', zoneForm.name), name: zoneForm.name.trim(), order: zoneForm.order || settings.zones.length + 1 };
    const exists = settings.zones.some(z => z.id === item.id);
    onSave({ ...settings, zones: exists ? settings.zones.map(z => z.id === item.id ? item : z) : [...settings.zones, item] });
    setZoneForm(null);
  };

  const sortedShifts = [...settings.shifts].sort((a, b) => a.order - b.order);
  const sortedZones = [...settings.zones].sort((a, b) => a.order - b.order);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center"><CalendarClock className="w-5 h-5" /></div>
          <div><h2 className="font-extrabold text-slate-900 dark:text-white">Danh Mục Khả Dụng VietGo</h2><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cấu hình giờ tài xế bận ở công ty khác; hệ thống tự tính giờ rảnh trong khung VietGo 06:00–23:00.</p></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-amber-500" />Khung giờ bận ở công ty khác</h3><button onClick={() => setShiftForm(newShift())} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Thêm lịch bận</button></div>
          <div className="space-y-2">
            {sortedShifts.map(item => <div key={item.id} className={`p-3 rounded-xl border flex items-center gap-2 ${item.isActive ? 'border-slate-200 dark:border-slate-700' : 'opacity-50 border-slate-200 dark:border-slate-800'}`}>
              <div className="min-w-0 flex-1"><div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</div><div className="text-[11px] text-slate-500">{item.startTime && item.endTime ? `${item.startTime} – ${item.endTime}` : 'Không cố định'}{item.description ? ` · ${item.description}` : ''}</div></div>
              <button onClick={() => onSave({ ...settings, shifts: settings.shifts.map(s => s.id === item.id ? { ...s, isActive: !s.isActive } : s) })} className="text-[10px] font-bold text-slate-500 hover:text-emerald-600">{item.isActive ? 'Đang dùng' : 'Tắt'}</button>
              <button onClick={() => setShiftForm(item)} className="p-1 text-slate-400 hover:text-amber-600"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => onSave({ ...settings, shifts: settings.shifts.filter(s => s.id !== item.id) })} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>)}
          </div>
          {shiftForm && <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2"><input autoFocus value={shiftForm.name} onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })} placeholder="Tên lịch bận, ví dụ: Ca giày da 4" className="w-full field" /><div className="grid grid-cols-2 gap-2"><input type="time" value={shiftForm.startTime || ''} onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })} className="field" /><input type="time" value={shiftForm.endTime || ''} onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })} className="field" /></div><input value={shiftForm.description || ''} onChange={e => setShiftForm({ ...shiftForm, description: e.target.value })} placeholder="Tên công ty / ghi chú (tùy chọn)" className="w-full field" /><div className="flex justify-end gap-2"><button onClick={() => setShiftForm(null)} className="mini-btn"><X className="w-3.5 h-3.5" />Hủy</button><button onClick={saveShift} className="mini-btn bg-amber-500 text-slate-950 border-amber-500"><Save className="w-3.5 h-3.5" />Lưu lịch bận</button></div></div>}
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-500" />Trạm / khu vực trực</h3><button onClick={() => setZoneForm(newZone())} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Thêm khu vực</button></div>
          <div className="space-y-2">
            {sortedZones.map(item => <div key={item.id} className={`p-3 rounded-xl border flex items-center gap-2 ${item.isActive ? 'border-slate-200 dark:border-slate-700' : 'opacity-50 border-slate-200 dark:border-slate-800'}`}>
              <div className="min-w-0 flex-1"><div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</div>{item.description && <div className="text-[11px] text-slate-500 truncate">{item.description}</div>}</div>
              <button onClick={() => onSave({ ...settings, zones: settings.zones.map(z => z.id === item.id ? { ...z, isActive: !z.isActive } : z) })} className="text-[10px] font-bold text-slate-500 hover:text-emerald-600">{item.isActive ? 'Đang dùng' : 'Tắt'}</button>
              <button onClick={() => setZoneForm(item)} className="p-1 text-slate-400 hover:text-teal-600"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => onSave({ ...settings, zones: settings.zones.filter(z => z.id !== item.id) })} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>)}
          </div>
          {zoneForm && <div className="p-3 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-2"><input autoFocus value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder="Tên trạm / khu vực" className="w-full field" /><input value={zoneForm.description || ''} onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })} placeholder="Ghi chú (tùy chọn)" className="w-full field" /><div className="flex justify-end gap-2"><button onClick={() => setZoneForm(null)} className="mini-btn"><X className="w-3.5 h-3.5" />Hủy</button><button onClick={saveZone} className="mini-btn bg-teal-500 text-slate-950 border-teal-500"><Save className="w-3.5 h-3.5" />Lưu khu vực</button></div></div>}
        </div>
      </div>
    </section>
  );
};
