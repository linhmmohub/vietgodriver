import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  HardHat, 
  Shirt, 
  Package,
  Boxes,
  DollarSign, 
  ShieldAlert, 
  Save, 
  Calendar, 
  AlertCircle,
  Briefcase,
  Clock,
  CheckCircle2,
  Hourglass,
  Key,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { 
  Driver, 
  ShirtSize, 
  PaymentStatus, 
  RevokeReason, 
  RefundStatus, 
  DriverWorkingType, 
  DriverApprovalStatus,
  EquipmentCategory,
  SystemFeeSettings,
  DriverWorkflowSettings,
  DriverWorkflowCategory,
  CustomIssuedItem
} from '../types';
import { getTodayDateString, formatCurrency } from '../utils/formatters';
import { CurrencyInput } from './CurrencyInput';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Driver) => void;
  driverToEdit: Driver | null;
  existingDriverCodes: string[];
  equipmentCategories?: EquipmentCategory[];
  systemFeeSettings?: SystemFeeSettings;
  driverWorkflowSettings?: DriverWorkflowSettings;
}

export const DriverModal: React.FC<DriverModalProps> = ({
  isOpen,
  onClose,
  onSave,
  driverToEdit,
  existingDriverCodes,
  equipmentCategories = [],
  systemFeeSettings,
  driverWorkflowSettings,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [joinDate, setJoinDate] = useState(getTodayDateString());
  const [secretCode, setSecretCode] = useState('');
  const [isSecretCopied, setIsSecretCopied] = useState(false);

  // Hình thức làm việc & Trạng thái duyệt
  const [workingType, setWorkingType] = useState<DriverWorkingType>('fulltime');
  const [approvalStatus, setApprovalStatus] = useState<DriverApprovalStatus>('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  // Mũ
  const [hasHelmet, setHasHelmet] = useState(true);
  const [helmetQuantity, setHelmetQuantity] = useState(1);
  const [helmetDate, setHelmetDate] = useState(getTodayDateString());

  // Áo
  const [hasShirt, setHasShirt] = useState(true);
  const [shirtSize, setShirtSize] = useState<ShirtSize>('L');
  const [shirtQuantity, setShirtQuantity] = useState(2);
  const [shirtDate, setShirtDate] = useState(getTodayDateString());

  // Thùng đựng hàng / Thùng giao hàng
  const [hasDeliveryBox, setHasDeliveryBox] = useState(true);
  const [boxQuantity, setBoxQuantity] = useState(1);
  const [boxDate, setBoxDate] = useState(getTodayDateString());

  // Dynamic Custom Items from Admin Categories
  const [customItems, setCustomItems] = useState<Record<string, CustomIssuedItem>>({});
  const [otherItems, setOtherItems] = useState('');

  // Thu tiền
  const defaultFee = systemFeeSettings?.defaultUniformDeposit ?? 300000;
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [uniformFeeRequired, setUniformFeeRequired] = useState(defaultFee);
  const [uniformFeePaid, setUniformFeePaid] = useState(defaultFee);
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');
  const [paymentNote, setPaymentNote] = useState('');

  // Thu hồi vi phạm
  const [isRevoked, setIsRevoked] = useState(false);
  const [revocationDate, setRevocationDate] = useState(getTodayDateString());
  const [revocationReason, setRevocationReason] = useState<RevokeReason>('violation');
  const [revocationReasonDetail, setRevocationReasonDetail] = useState('');
  const [revokedHelmet, setRevokedHelmet] = useState(false);
  const [revokedShirt, setRevokedShirt] = useState(false);
  const [revokedBox, setRevokedBox] = useState(false);

  // Hoàn tiền
  const [refundStatus, setRefundStatus] = useState<RefundStatus>('no_refund');
  const [refundAmount, setRefundAmount] = useState(250000);
  const [refundDate, setRefundDate] = useState(getTodayDateString());
  const [refundNote, setRefundNote] = useState('');

  const activeOptions = (key: DriverWorkflowCategory) =>
    (driverWorkflowSettings?.[key] || []).filter((item) => item.isActive).sort((a, b) => a.order - b.order);

  const [generalNote, setGeneralNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto calculate total deposit based on chosen items
  const calculateTotalDeposit = () => {
    let sum = 0;
    if (equipmentCategories && equipmentCategories.length > 0) {
      for (const cat of equipmentCategories) {
        if (!cat.isActive) continue;
        if (cat.id === 'shirt' && hasShirt) {
          sum += (cat.defaultDeposit || 100000);
        } else if (cat.id === 'helmet' && hasHelmet) {
          sum += (cat.defaultDeposit || 100000);
        } else if (cat.id === 'box' && hasDeliveryBox) {
          sum += (cat.defaultDeposit || 100000);
        } else if (customItems[cat.id]?.issued) {
          sum += (cat.defaultDeposit || 0);
        }
      }
    } else {
      if (hasHelmet) sum += 100000;
      if (hasShirt) sum += 100000;
      if (hasDeliveryBox) sum += 100000;
    }
    return sum > 0 ? sum : defaultFee;
  };

  useEffect(() => {
    if (driverToEdit) {
      setCode(driverToEdit.code);
      setName(driverToEdit.name);
      setPhone(driverToEdit.phone);
      setLicensePlate(driverToEdit.licensePlate || '');
      setJoinDate(driverToEdit.joinDate || getTodayDateString());
      setSecretCode(driverToEdit.secretCode || (driverToEdit.phone ? driverToEdit.phone.replace(/\D/g, '').slice(-4) : '1234') || '1234');

      setHasHelmet(driverToEdit.hasHelmet);
      setHelmetQuantity(driverToEdit.helmetQuantity || 1);
      setHelmetDate(driverToEdit.helmetDate || getTodayDateString());

      setHasShirt(driverToEdit.hasShirt);
      setShirtSize(driverToEdit.shirtSize || 'L');
      setShirtQuantity(driverToEdit.shirtQuantity || 1);
      setShirtDate(driverToEdit.shirtDate || getTodayDateString());

      setHasDeliveryBox(driverToEdit.hasDeliveryBox !== undefined ? driverToEdit.hasDeliveryBox : true);
      setBoxQuantity(driverToEdit.boxQuantity || 1);
      setBoxDate(driverToEdit.boxDate || getTodayDateString());

      setCustomItems(driverToEdit.customItems || {});
      setOtherItems(driverToEdit.otherItems || '');

      setWorkingType(driverToEdit.workingType || 'fulltime');
      setApprovalStatus(driverToEdit.approvalStatus || 'approved');
      setRejectionReason(driverToEdit.rejectionReason || '');

      setPaymentStatus(driverToEdit.paymentStatus);
      setUniformFeeRequired(driverToEdit.uniformFeeRequired !== undefined ? driverToEdit.uniformFeeRequired : defaultFee);
      setUniformFeePaid(driverToEdit.uniformFeePaid !== undefined ? driverToEdit.uniformFeePaid : 0);
      setPaymentDate(driverToEdit.paymentDate || getTodayDateString());
      setPaymentMethod(driverToEdit.paymentMethod || 'transfer');
      setPaymentNote(driverToEdit.paymentNote || '');

      setIsRevoked(driverToEdit.isRevoked || false);
      setRevocationDate(driverToEdit.revocationDate || getTodayDateString());
      setRevocationReason(driverToEdit.revocationReason || 'violation');
      setRevocationReasonDetail(driverToEdit.revocationReasonDetail || '');
      setRevokedHelmet(driverToEdit.revokedHelmet || false);
      setRevokedShirt(driverToEdit.revokedShirt || false);
      setRevokedBox(driverToEdit.revokedBox || false);

      setRefundStatus(driverToEdit.refundStatus || 'no_refund');
      setRefundAmount(driverToEdit.refundAmount || 0);
      setRefundDate(driverToEdit.refundDate || getTodayDateString());
      setRefundNote(driverToEdit.refundNote || '');

      setGeneralNote(driverToEdit.generalNote || '');
      setErrorMsg('');
    } else {
      // Auto generate code
      const nextNum = existingDriverCodes.length + 101;
      setCode(`TX-${nextNum}`);
      setName('');
      setPhone('');
      setLicensePlate('');
      setJoinDate(getTodayDateString());
      setSecretCode(Math.floor(1000 + Math.random() * 9000).toString());

      setHasHelmet(true);
      setHelmetQuantity(1);
      setHelmetDate(getTodayDateString());

      setHasShirt(true);
      setShirtSize('L');
      setShirtQuantity(2);
      setShirtDate(getTodayDateString());

      setHasDeliveryBox(true);
      setBoxQuantity(1);
      setBoxDate(getTodayDateString());

      setCustomItems({});
      setOtherItems('');

      setWorkingType('fulltime');
      setApprovalStatus('approved');
      setRejectionReason('');

      const initialFee = systemFeeSettings?.defaultUniformDeposit || 300000;
      setPaymentStatus('paid');
      setUniformFeeRequired(initialFee);
      setUniformFeePaid(initialFee);
      setPaymentDate(getTodayDateString());
      setPaymentMethod('transfer');
      setPaymentNote('');

      setIsRevoked(false);
      setRevocationDate(getTodayDateString());
      setRevocationReason('violation');
      setRevocationReasonDetail('');
      setRevokedHelmet(false);
      setRevokedShirt(false);
      setRevokedBox(false);

      setRefundStatus('no_refund');
      setRefundAmount(0);
      setRefundDate(getTodayDateString());
      setRefundNote('');

      setGeneralNote('');
      setErrorMsg('');
    }
  }, [driverToEdit, isOpen, existingDriverCodes.length, defaultFee]);

  if (!isOpen) return null;

  const handlePaymentStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'paid') {
      setUniformFeePaid(uniformFeeRequired);
    } else if (status === 'unpaid') {
      setUniformFeePaid(0);
    }
  };

  const handleRevokedToggle = (checked: boolean) => {
    setIsRevoked(checked);
    if (checked) {
      if (refundStatus === 'no_refund') {
        setRefundStatus('pending');
        setRefundAmount(Math.max(0, uniformFeePaid - 150000));
      }
    } else {
      setRefundStatus('no_refund');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ tên tài xế.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    const newDriver: Driver = {
      id: driverToEdit ? driverToEdit.id : `drv-${Date.now()}`,
      code: code.trim().toUpperCase() || 'TX-NEW',
      name: name.trim(),
      phone: phone.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
      joinDate,
      secretCode: secretCode.trim() || (phone ? phone.replace(/\D/g, '').slice(-4) : '1234') || '1234',

      workingType,
      approvalStatus,
      rejectionReason: approvalStatus !== 'approved' ? rejectionReason.trim() : undefined,

      hasHelmet,
      helmetQuantity: Number(helmetQuantity) || 0,
      helmetDate: hasHelmet ? helmetDate : undefined,

      hasShirt,
      shirtSize,
      shirtQuantity: Number(shirtQuantity) || 0,
      shirtDate: hasShirt ? shirtDate : undefined,

      hasDeliveryBox,
      boxQuantity: Number(boxQuantity) || 0,
      boxDate: hasDeliveryBox ? boxDate : undefined,

      customItems,
      otherItems: otherItems.trim(),

      paymentStatus,
      uniformFeeRequired: Number(uniformFeeRequired) || 0,
      uniformFeePaid: Number(uniformFeePaid) || 0,
      paymentDate: paymentDate || undefined,
      paymentMethod,
      paymentNote: paymentNote.trim(),

      isRevoked,
      revocationDate: isRevoked ? revocationDate : undefined,
      revocationReason: isRevoked ? revocationReason : undefined,
      revocationReasonDetail: isRevoked ? revocationReasonDetail.trim() : undefined,
      revokedHelmet: isRevoked ? revokedHelmet : false,
      revokedShirt: isRevoked ? revokedShirt : false,
      revokedBox: isRevoked ? revokedBox : false,

      refundStatus: isRevoked ? refundStatus : 'no_refund',
      refundAmount: isRevoked ? Number(refundAmount) || 0 : 0,
      refundDate: isRevoked && refundStatus === 'refunded' ? refundDate : undefined,
      refundNote: isRevoked ? refundNote.trim() : undefined,

      generalNote: generalNote.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newDriver);
  };

  return (
    <div className="mobile-modal-frame fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="mobile-sheet bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {driverToEdit ? `Cập nhật hồ sơ: ${driverToEdit.name} (${driverToEdit.code})` : 'Thêm hồ sơ tài xế mới'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý cấp phát Mũ, Áo, tiền cọc & xử lý thu hồi vi phạm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form (Scrollable) */}
        <form onSubmit={handleSubmit} className="mobile-safe-bottom flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 text-xs sm:text-sm">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center text-xs">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Phần 1: Thông tin cơ bản tài xế */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-amber-500" />
              1. Thông tin tài xế
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Mã tài xế <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="TX-101"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Họ và tên tài xế <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Biển số xe
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="29A-123.45"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ngày nhận việc / Vào làm
                </label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Hình thức làm việc <span className="text-rose-500">*</span>
                </label>
                <select value={workingType} onChange={(e) => setWorkingType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold">
                  {activeOptions('workingTypes').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>

              {/* Mã bí mật điểm danh riêng cho tài xế */}
              <div className="sm:col-span-2 md:col-span-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Mã bí mật điểm danh ca trực (Secret PIN) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                        setSecretCode(newPin);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/30 flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Tạo mã ngẫu nhiên
                    </button>
                    {secretCode && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(secretCode);
                          setIsSecretCopied(true);
                          setTimeout(() => setIsSecretCopied(false), 2000);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 flex items-center gap-1 transition"
                      >
                        {isSecretCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {isSecretCopied ? 'Đã chép' : 'Sao chép mã'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value.trim())}
                    placeholder="VD: 8899, 1234, 6868..."
                    maxLength={16}
                    className="w-full sm:w-48 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-500/40 text-slate-900 dark:text-slate-100 font-mono text-sm tracking-widest font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cấp mã này cho tài xế để tự mở cổng điểm danh ca làm việc.
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 md:col-span-3 pt-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Trạng thái hồ sơ & Xét duyệt
                </label>
                <select value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold">
                  {activeOptions('approvalStatuses').map(item => <option key={item.id} value={item.id}>{item.name}{item.description ? ` — ${item.description}` : ''}</option>)}
                </select>

                {approvalStatus !== 'approved' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ghi chú thêm về trạng thái dự bị (vd: Chờ bổ sung CCCD, chưa test xe...)"
                      className="w-full px-3 py-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phần 2: Cấp phát Trang bị (Áo, Mũ & Thùng đựng hàng) */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <Boxes className="w-4 h-4 mr-1.5 text-amber-500" />
              2. Tình trạng cấp phát trang bị (Áo, Mũ & Thùng đựng hàng)
            </h3>

            {/* Mũ bảo hiểm */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHelmet}
                    onChange={(e) => setHasHelmet(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center">
                    <HardHat className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Đã cấp Mũ bảo hiểm
                  </span>
                </label>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${hasHelmet ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                  {hasHelmet ? 'Có mũ bảo hiểm' : 'Chưa có mũ'}
                </span>
              </div>

              {hasHelmet && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Số lượng mũ
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={helmetQuantity}
                      onChange={(e) => setHelmetQuantity(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Ngày nhận mũ
                    </label>
                    <input
                      type="date"
                      value={helmetDate}
                      onChange={(e) => setHelmetDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Áo đồng phục */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasShirt}
                    onChange={(e) => setHasShirt(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center">
                    <Shirt className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    Đã cấp Áo đồng phục
                  </span>
                </label>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${hasShirt ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-slate-100 text-slate-500'}`}>
                  {hasShirt ? `Đã có áo (Size ${shirtSize})` : 'Chưa có áo'}
                </span>
              </div>

              {hasShirt && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Size áo
                    </label>
                    <select
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value as ShirtSize)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                    >
                      <option value="S">Size S (Dưới 55kg)</option>
                      <option value="M">Size M (55 - 63kg)</option>
                      <option value="L">Size L (64 - 72kg)</option>
                      <option value="XL">Size XL (73 - 80kg)</option>
                      <option value="XXL">Size XXL (81 - 88kg)</option>
                      <option value="3XL">Size 3XL (Trên 88kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Số lượng áo
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={shirtQuantity}
                      onChange={(e) => setShirtQuantity(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Ngày nhận áo
                    </label>
                    <input
                      type="date"
                      value={shirtDate}
                      onChange={(e) => setShirtDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Thùng đựng hàng / Thùng giao hàng */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDeliveryBox}
                    onChange={(e) => setHasDeliveryBox(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center">
                    <Package className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Đã cấp Thùng đựng hàng / Thùng giao hàng
                  </span>
                </label>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${hasDeliveryBox ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                  {hasDeliveryBox ? `Đã có thùng (${boxQuantity} cái)` : 'Chưa có thùng'}
                </span>
              </div>

              {hasDeliveryBox && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Số lượng thùng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={boxQuantity}
                      onChange={(e) => setBoxQuantity(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                      Ngày nhận thùng
                    </label>
                    <input
                      type="date"
                      value={boxDate}
                      onChange={(e) => setBoxDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trang bị mở rộng từ Quản trị danh mục (nếu có) */}
            {equipmentCategories && equipmentCategories.filter(c => !['shirt', 'helmet', 'box'].includes(c.id) && c.isActive).map((cat) => {
              const itemState = customItems[cat.id] || {
                itemId: cat.id,
                name: cat.name,
                issued: false,
                quantity: 1,
                date: getTodayDateString(),
                size: cat.availableSizes?.[0] || '',
              };

              const handleToggle = (checked: boolean) => {
                setCustomItems(prev => ({
                  ...prev,
                  [cat.id]: {
                    ...itemState,
                    issued: checked,
                  }
                }));
              };

              const handleQtyChange = (qty: number) => {
                setCustomItems(prev => ({
                  ...prev,
                  [cat.id]: {
                    ...itemState,
                    quantity: qty,
                  }
                }));
              };

              const handleDateChange = (date: string) => {
                setCustomItems(prev => ({
                  ...prev,
                  [cat.id]: {
                    ...itemState,
                    date,
                  }
                }));
              };

              const handleSizeChange = (size: string) => {
                setCustomItems(prev => ({
                  ...prev,
                  [cat.id]: {
                    ...itemState,
                    size,
                  }
                }));
              };

              return (
                <div key={cat.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemState.issued}
                        onChange={(e) => handleToggle(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center">
                        <Package className="w-3.5 h-3.5 mr-1 text-amber-500" />
                        Đã cấp {cat.name} {cat.defaultDeposit ? `(Cọc: ${formatCurrency(cat.defaultDeposit)})` : ''}
                      </span>
                    </label>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${itemState.issued ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {itemState.issued ? `Đã cấp (${itemState.quantity || 1} cái)` : 'Chưa cấp'}
                    </span>
                  </div>

                  {itemState.issued && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                      {cat.hasSize && cat.availableSizes && cat.availableSizes.length > 0 && (
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                            Kích thước / Size
                          </label>
                          <select
                            value={itemState.size || cat.availableSizes[0]}
                            onChange={(e) => handleSizeChange(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                          >
                            {cat.availableSizes.map((s: string) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                          Số lượng
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={itemState.quantity || 1}
                          onChange={(e) => handleQtyChange(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                          Ngày cấp
                        </label>
                        <input
                          type="date"
                          value={itemState.date || getTodayDateString()}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Phụ kiện khác */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 text-xs">
                Phụ kiện/Đồ cấp phát khác (Áo mưa, túi chống nước, thẻ tên...)
              </label>
              <input
                type="text"
                value={otherItems}
                onChange={(e) => setOtherItems(e.target.value)}
                placeholder="VD: 01 Áo mưa cánh dơi, 01 Thẻ tên tài xế"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Phần 3: Thu tiền đồng phục / Tiền cọc */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" />
                3. Quản lý thu tiền đồng phục / Cọc
              </h3>
              <button
                type="button"
                onClick={() => {
                  const autoDeposit = calculateTotalDeposit();
                  setUniformFeeRequired(autoDeposit);
                  if (paymentStatus === 'paid') {
                    setUniformFeePaid(autoDeposit);
                  }
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition flex items-center gap-1"
                title="Tính lại mức tiền cọc theo các trang bị đã tick ở trên"
              >
                <RefreshCw className="w-3 h-3" />
                Tính cọc theo trang bị ({formatCurrency(calculateTotalDeposit())})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Trạng thái thu tiền
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {activeOptions('paymentStatuses').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Mức tiền quy định
                </label>
                <CurrencyInput
                  id="driver-fee-required"
                  value={uniformFeeRequired}
                  onChange={setUniformFeeRequired}
                  presets={[200000, 250000, 300000, 350000, 400000]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Số tiền thực tế ĐÃ THU
                </label>
                <CurrencyInput
                  id="driver-fee-paid"
                  value={uniformFeePaid}
                  onChange={setUniformFeePaid}
                  presets={[0, 150000, 200000, 300000]}
                  className="text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Phương thức thu
                </label>
                <div className="flex space-x-4 pt-1 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="text-emerald-500"
                    />
                    <span>Chuyển khoản</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="text-emerald-500"
                    />
                    <span>Tiền mặt</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ngày thu tiền
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 text-xs">
                Ghi chú thu tiền (Ngân hàng, mã giao dịch, thỏa thuận trả nợ...)
              </label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="VD: Chuyển khoản Techcombank lúc 14h, hẹn ngày 20 trả nốt 100k"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Phần 4: THU HỒI ĐỒNG PHỤC DO VI PHẠM & HOÀN TIỀN */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-900/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                4. Trường hợp Thu hồi đồng phục & Hoàn tiền
              </h3>
              
              <label className="flex items-center space-x-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800 text-xs font-semibold shadow-xs">
                <input
                  type="checkbox"
                  checked={isRevoked}
                  onChange={(e) => handleRevokedToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className={isRevoked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}>
                  {isRevoked ? 'Đang Thu Hồi Vi Phạm / Nghỉ Việc' : 'Tài xế bình thường (Chưa thu hồi)'}
                </span>
              </label>
            </div>

            {isRevoked && (
              <div className="space-y-3 pt-2 border-t border-rose-200/80 dark:border-rose-900/60 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Lý do thu hồi đồng phục
                    </label>
                    <select
                      value={revocationReason}
                      onChange={(e) => setRevocationReason(e.target.value as RevokeReason)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                    >
                      {activeOptions('revocationReasons').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ngày quyết định thu hồi
                    </label>
                    <input
                      type="date"
                      value={revocationDate}
                      onChange={(e) => setRevocationDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chi tiết vi phạm / Lý do thu hồi
                  </label>
                  <textarea
                    rows={2}
                    value={revocationReasonDetail}
                    onChange={(e) => setRevocationReasonDetail(e.target.value)}
                    placeholder="VD: Chạy sai tuyến, thái độ không đúng mực với khách hàng hoặc tự ý nghỉ không báo trước..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>

                {/* Tình trạng thu hồi đồ vật */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                    Đã nhận lại hiện vật đồng phục chưa?
                  </span>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={revokedHelmet}
                        onChange={(e) => setRevokedHelmet(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>Đã nhận lại Mũ bảo hiểm</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={revokedShirt}
                        onChange={(e) => setRevokedShirt(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>Đã nhận lại Áo đồng phục</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={revokedBox}
                        onChange={(e) => setRevokedBox(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>Đã nhận lại Thùng đựng hàng</span>
                    </label>
                  </div>
                </div>

                {/* Tình trạng Hoàn tiền */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Tình trạng Hoàn tiền cho tài xế:
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      (Tiền tài xế đã nộp trước đó: <strong className="text-emerald-600 font-bold">{formatCurrency(uniformFeePaid)}</strong>)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                        Trạng thái hoàn tiền
                      </label>
                      <select
                        value={refundStatus}
                        onChange={(e) => setRefundStatus(e.target.value as RefundStatus)}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold text-xs"
                      >
                        {activeOptions('refundStatuses').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                        Số tiền hoàn lại
                      </label>
                      <CurrencyInput
                        id="driver-refund-amount"
                        value={refundAmount}
                        onChange={setRefundAmount}
                        disabled={refundStatus === 'no_refund'}
                        presets={[150000, 200000, 250000, 300000]}
                        className="font-bold text-amber-600 dark:text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                        Ngày hoàn tiền
                      </label>
                      <input
                        type="date"
                        value={refundDate}
                        onChange={(e) => setRefundDate(e.target.value)}
                        disabled={refundStatus !== 'refunded'}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                      Ghi chú hoàn tiền / Khấu trừ phạt
                    </label>
                    <input
                      type="text"
                      value={refundNote}
                      onChange={(e) => setRefundNote(e.target.value)}
                      placeholder="VD: Khấu trừ 150.000đ do làm rách áo và phạt vi phạm, hoàn trả 250.000đ tiền mặt"
                      className="w-full px-3 py-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Ghi chú chung */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Ghi chú nội bộ bổ sung về tài xế này
            </label>
            <input
              type="text"
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="VD: Tài xế chăm chỉ, chạy khu vực Cầu Giấy..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              id="btn-save-driver-submit"
              type="submit"
              className="inline-flex items-center px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md transition active:scale-95"
            >
              <Save className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              {driverToEdit ? 'Cập nhật hồ sơ' : 'Lưu tài xế mới'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
