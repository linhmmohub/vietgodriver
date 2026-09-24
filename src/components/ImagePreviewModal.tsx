import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  title = 'Biên lai chuyển khoản',
  onClose,
}) => {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `bill-chuyen-khoan-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="mobile-modal-frame fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="mobile-sheet relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-slate-800 text-slate-200">
          <span className="text-xs font-semibold">{title}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              title="Tải ảnh về máy"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image body */}
        <div className="mobile-modal-content flex-1 overflow-auto p-2 flex items-center justify-center bg-slate-950">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
};
