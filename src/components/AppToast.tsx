import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface Props {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const AppToast: React.FC<Props> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(onDismiss, toast.tone === 'error' ? 5500 : 3800);
    return () => window.clearTimeout(timeout);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const theme = toast.tone === 'success'
    ? 'border-emerald-400/40 bg-emerald-950 text-emerald-50'
    : toast.tone === 'error'
      ? 'border-rose-400/40 bg-rose-950 text-rose-50'
      : 'border-sky-400/40 bg-slate-900 text-slate-50';
  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertTriangle : Info;

  return (
    <div className="fixed inset-x-3 top-[max(env(safe-area-inset-top),0.75rem)] z-[100] mx-auto w-auto max-w-md animate-in slide-in-from-top-3 fade-in duration-200 sm:left-auto sm:right-5 sm:mx-0" role="status" aria-live="polite">
      <div className={`flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur ${theme}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">{toast.message}</p>
        <button type="button" onClick={onDismiss} aria-label="Đóng thông báo" className="rounded-lg p-1 opacity-70 hover:bg-white/10 hover:opacity-100"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};
