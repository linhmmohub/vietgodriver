import React, { useMemo, useState } from 'react';
import { Check, Edit2, Plus, RotateCcw, Settings2, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { DriverWorkflowCategory, DriverWorkflowOption, DriverWorkflowSettings } from '../types';
import { DEFAULT_DRIVER_WORKFLOW_SETTINGS } from '../utils/categories';

interface Props {
  settings: DriverWorkflowSettings;
  onSave: (settings: DriverWorkflowSettings) => void;
}

const GROUPS: { id: DriverWorkflowCategory; name: string; description: string }[] = [
  { id: 'approvalStatuses', name: 'Trạng thái hồ sơ', description: 'Duyệt, chờ duyệt hoặc các giai đoạn hồ sơ riêng.' },
  { id: 'workingTypes', name: 'Hình thức làm việc', description: 'Toàn thời gian, bán thời gian, cộng tác viên…' },
  { id: 'paymentStatuses', name: 'Trạng thái thu cọc', description: 'Dùng khi ghi nhận tiền đồng phục.' },
  { id: 'refundStatuses', name: 'Trạng thái hoàn cọc', description: 'Dùng khi thu hồi hoặc thanh lý.' },
  { id: 'revocationReasons', name: 'Lý do thu hồi', description: 'Lý do nghỉ việc, vi phạm, đổi trang bị…' },
];

export const DriverWorkflowManagementView: React.FC<Props> = ({ settings, onSave }) => {
  const [group, setGroup] = useState<DriverWorkflowCategory>('approvalStatuses');
  const [editing, setEditing] = useState<DriverWorkflowOption | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const activeGroup = useMemo(() => GROUPS.find(item => item.id === group)!, [group]);
  const options = settings[group] || [];

  const saveOption = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const option: DriverWorkflowOption = editing
      ? { ...editing, name: name.trim(), description: description.trim() }
      : {
          id: `status_${Date.now()}`,
          name: name.trim(),
          description: description.trim(),
          isActive: true,
          order: options.length + 1,
          createdAt: new Date().toISOString(),
        };
    const updated = editing
      ? options.map(item => item.id === option.id ? option : item)
      : [...options, option];
    onSave({ ...settings, [group]: updated, updatedAt: new Date().toISOString() });
    setEditing(null); setName(''); setDescription('');
  };

  const startEdit = (option: DriverWorkflowOption) => {
    setEditing(option); setName(option.name); setDescription(option.description || '');
  };

  const toggle = (option: DriverWorkflowOption) => onSave({
    ...settings,
    [group]: options.map(item => item.id === option.id ? { ...item, isActive: !item.isActive } : item),
    updatedAt: new Date().toISOString(),
  });

  const remove = (option: DriverWorkflowOption) => {
    window.alert(`Không thể xóa "${option.name}" để bảo toàn lịch sử hồ sơ. Hãy dùng nút Ẩn để ngừng áp dụng trạng thái này cho hồ sơ mới.`);
  };

  const reset = () => {
    if (window.confirm('Khôi phục toàn bộ danh mục trạng thái tài xế về mặc định?')) {
      onSave({ ...DEFAULT_DRIVER_WORKFLOW_SETTINGS, updatedAt: new Date().toISOString() });
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><Settings2 className="w-5 h-5 text-violet-500" />Danh mục vận hành tài xế</h2>
          <p className="text-xs text-slate-500 mt-1">Thêm, đổi tên hoặc ẩn trạng thái mà không cần sửa mã nguồn. Trạng thái đã dùng không bị mất khi tắt.</p>
        </div>
        <button onClick={reset} className="text-xs font-semibold text-slate-500 hover:text-violet-600 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" />Khôi phục mặc định</button>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        <div className="space-y-1">
          {GROUPS.map(item => <button key={item.id} onClick={() => { setGroup(item.id); setEditing(null); setName(''); setDescription(''); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition ${group === item.id ? 'bg-violet-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            {item.name}<span className={`block text-[10px] mt-0.5 ${group === item.id ? 'text-violet-100' : 'text-slate-400'}`}>{(settings[item.id] || []).filter(x => x.isActive).length} đang dùng</span>
          </button>)}
        </div>
        <div>
          <div className="mb-3"><h3 className="font-bold text-sm">{activeGroup.name}</h3><p className="text-xs text-slate-500 mt-0.5">{activeGroup.description}</p></div>
          <div className="space-y-2 mb-4">
            {[...options].sort((a, b) => a.order - b.order).map(option => <div key={option.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${option.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div className="min-w-0 flex-1"><div className="text-xs font-bold text-slate-800 dark:text-slate-100">{option.name}</div>{option.description && <div className="text-[11px] text-slate-500 truncate">{option.description}</div>}<div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {option.id}</div></div>
              <button title={option.isActive ? 'Ẩn khỏi form mới' : 'Bật lại'} onClick={() => toggle(option)} className="p-1.5 text-slate-500 hover:text-violet-600">{option.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}</button>
              <button title="Sửa" onClick={() => startEdit(option)} className="p-1.5 text-slate-500 hover:text-violet-600"><Edit2 className="w-4 h-4" /></button>
              <button title="Bảo toàn lịch sử" onClick={() => remove(option)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
            </div>)}
          </div>
          <form onSubmit={saveOption} className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <label className="text-xs font-semibold">Tên trạng thái<input required value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Tạm ngưng" className="mt-1 w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" /></label>
            <label className="text-xs font-semibold">Mô tả<input value={description} onChange={e => setDescription(e.target.value)} placeholder="Hiển thị cho nhân viên" className="mt-1 w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" /></label>
            <div className="flex gap-1"><button type="submit" className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1">{editing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}{editing ? 'Lưu' : 'Thêm'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setName(''); setDescription(''); }} className="px-2 py-2 rounded-lg text-slate-500 hover:bg-white"><X className="w-4 h-4" /></button>}</div>
          </form>
        </div>
      </div>
    </section>
  );
};
