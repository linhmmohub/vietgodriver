import React from 'react';
import { Check, ClipboardCheck, Clock3, ShieldAlert, X } from 'lucide-react';
import { AuthSession, DriverChangeRequest } from '../types';

interface Props {
  requests: DriverChangeRequest[];
  currentUser: AuthSession;
  onReview: (request: DriverChangeRequest, decision: 'approved' | 'rejected') => void;
}

export const DriverChangeRequestsPanel: React.FC<Props> = ({ requests, currentUser, onReview }) => {
  const isAdmin = currentUser.role === 'super_admin';
  const visibleRequests = (isAdmin ? requests : requests.filter(request => request.submittedBy.id === currentUser.id)).slice(0, 20);
  const pendingRequests = visibleRequests.filter(request => request.status === 'pending');

  return (
    <section className="rounded-3xl border border-violet-500/25 bg-slate-900 p-4 shadow-xl sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-violet-300"><ClipboardCheck className="h-4.5 w-4.5" /></span><div><h3 className="font-black text-white">{isAdmin ? 'Yêu cầu chờ Admin duyệt' : 'Yêu cầu bạn đã gửi Admin'}</h3><p className="text-[11px] text-slate-400">Dữ liệu hồ sơ chỉ thay đổi sau khi Admin cấp 1 duyệt.</p></div></div>
        <span className="w-fit rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-200">{pendingRequests.length} chờ duyệt</span>
      </div>
      {visibleRequests.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-700 p-4 text-center text-xs text-slate-400">Chưa có yêu cầu chỉnh sửa nào.</p> : <div className="mt-4 space-y-2">{visibleRequests.map(request => (
        <div key={request.id} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-white">{request.type === 'driver_create' ? 'Tạo hồ sơ tài xế' : 'Chỉnh sửa hồ sơ / đồng phục'} · <span className="font-mono text-violet-300">{request.driver.code}</span></p><p className="mt-0.5 text-xs text-slate-300">{request.driver.name} · {request.driver.phone}{request.driver.licensePlate ? ` · ${request.driver.licensePlate}` : ''}</p><p className="mt-1 text-[10px] text-slate-500">Gửi bởi {request.submittedBy.displayName} · {new Date(request.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p></div><span className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${request.status === 'pending' ? 'bg-amber-500/15 text-amber-200' : request.status === 'approved' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>{request.status === 'pending' ? 'Chờ duyệt' : request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span></div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400 sm:grid-cols-4"><span>Áo: {request.driver.shirtSize || 'Chưa chọn'} × {request.driver.shirtQuantity || 0}</span><span>Mũ: {request.driver.helmetQuantity || 0}</span><span>Thùng: {request.driver.boxQuantity || 0}</span><span>Cọc: {(request.driver.uniformFeePaid || 0).toLocaleString('vi-VN')}đ</span></div>
          {request.status === 'pending' && isAdmin && <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => onReview(request, 'rejected')} className="inline-flex items-center gap-1 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/20"><X className="h-3.5 w-3.5" />Từ chối</button><button type="button" onClick={() => onReview(request, 'approved')} className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400"><Check className="h-3.5 w-3.5" />Duyệt & áp dụng</button></div>}
          {request.reviewedBy && <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500"><Clock3 className="h-3 w-3" />{request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'} bởi {request.reviewedBy.displayName}{request.reviewedAt ? ` · ${new Date(request.reviewedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}` : ''}</p>}
        </div>
      ))}</div>}
      {isAdmin && pendingRequests.length > 0 && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-200"><ShieldAlert className="h-3.5 w-3.5" />Duyệt sẽ ghi hồ sơ vào Cloud; từ chối sẽ giữ nguyên dữ liệu hiện tại.</p>}
    </section>
  );
};
