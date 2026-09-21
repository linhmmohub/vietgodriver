export type UniformItemStatus = 'none' | 'issued' | 'returned';

export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Chưa chọn';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type RevokeReason = 'violation' | 'resigned' | 'damaged' | 'other';

export type RefundStatus = 'refunded' | 'pending' | 'no_refund';

export interface Driver {
  id: string;
  code: string; // Mã tài xế (e.g. TX-001)
  name: string; // Họ và tên
  phone: string; // Số điện thoại
  licensePlate?: string; // Biển số xe
  joinDate: string; // Ngày vào làm / nhận việc
  
  // Tình trạng Mũ
  hasHelmet: boolean;
  helmetQuantity: number;
  helmetDate?: string;
  
  // Tình trạng Áo
  hasShirt: boolean;
  shirtSize: ShirtSize;
  shirtQuantity: number;
  shirtDate?: string;
  
  // Phụ kiện khác (nếu có, e.g. Áo mưa, Balo...)
  otherItems?: string;
  
  // Thu tiền đồng phục
  paymentStatus: PaymentStatus;
  uniformFeeRequired: number; // Tiền phải thu (vd: 350.000đ)
  uniformFeePaid: number; // Thực tế đã thu (vd: 350.000đ)
  paymentDate?: string;
  paymentMethod?: 'cash' | 'transfer';
  paymentNote?: string;

  // Thu hồi đồng phục (do vi phạm / nghỉ việc)
  isRevoked: boolean; // Đang trong trạng thái bị thu hồi
  revocationDate?: string;
  revocationReason?: RevokeReason;
  revocationReasonDetail?: string; // Chi tiết vi phạm
  revokedHelmet: boolean; // Đã thu hồi mũ chưa
  revokedShirt: boolean; // Đã thu hồi áo chưa
  
  // Hoàn tiền khi thu hồi
  refundStatus: RefundStatus; // Đã hoàn tiền / Chưa hoàn / Không hoàn (do phạt vi phạm)
  refundAmount: number; // Số tiền hoàn lại (vd: 200.000đ)
  refundDate?: string;
  refundNote?: string;
  
  generalNote?: string;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  title: string; // Tiêu đề khoản chi
  category: 'buy_uniform' | 'print_logo' | 'buy_helmet' | 'refund_driver' | 'warehouse_shipping' | 'other';
  amount: number; // Số tiền chi
  recipient?: string; // Người nhận / Đơn vị cung cấp
  internalNote?: string; // Ghi chú nội bộ
  receiptImageUrl?: string; // Ảnh hóa đơn / bill chuyển khoản (Data URL)
  createdAt: string;
}

export type ActiveTab = 'drivers' | 'expenses' | 'summary' | 'logs' | 'users';

export type UserRole = 'super_admin' | 'staff';

export interface SystemUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  passwordHash: string; // Base64 encoded password
  isActive: boolean;
  notes?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  lastLogin: string;
}

// Backward compatibility alias
export type AdminUser = AuthSession;

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'DRIVER_CREATE'
  | 'DRIVER_UPDATE'
  | 'DRIVER_DELETE'
  | 'EXPENSE_CREATE'
  | 'EXPENSE_UPDATE'
  | 'EXPENSE_DELETE'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'BACKUP_RESTORE'
  | 'EXPORT_DATA';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  username: string;
  displayName: string;
  role: UserRole;
  actionType: AuditActionType;
  actionLabel: string;
  description: string;
  targetName?: string;
}

export interface AuthSettings {
  requireLoginToView: boolean; // Bắt buộc đăng nhập để xem dữ liệu
  allowDemoQuickLogin: boolean; // Cho phép điền nhanh mẫu thử
}
