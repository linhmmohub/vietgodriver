export type UniformItemStatus = 'none' | 'issued' | 'returned';

export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Chưa chọn';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type RevokeReason = 'violation' | 'resigned' | 'damaged' | 'other';

export type RefundStatus = 'refunded' | 'pending' | 'no_refund';

export type DriverWorkingType = 'fulltime' | 'parttime';

export type DriverApprovalStatus = 'approved' | 'pending';

export interface Driver {
  id: string;
  code: string; // Mã tài xế (e.g. TX-001)
  name: string; // Họ và tên
  phone: string; // Số điện thoại
  licensePlate?: string; // Biển số xe
  joinDate: string; // Ngày vào làm / nhận việc
  secretCode?: string; // Mã bí mật điểm danh riêng cho tài xế (mật khẩu/PIN do quản lý cấp)

  // Hình thức làm việc & Trạng thái duyệt
  workingType?: DriverWorkingType; // 'fulltime' | 'parttime' (mặc định: 'fulltime')
  approvalStatus?: DriverApprovalStatus; // 'approved' (chính thức) | 'pending' (danh sách chờ / dự bị chưa duyệt)
  rejectionReason?: string; // Lý do chưa duyệt / từ chối nếu có
  
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

export type ActiveTab = 'drivers' | 'dispatch' | 'expenses' | 'summary' | 'logs' | 'users';

export type AttendanceShift = 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';

export type DriverShiftStatus = 
  | 'on_duty'        // Đang trực ca / Đang chạy
  | 'off_duty'       // Ra ca / Đã kết thúc ca
  | 'emergency_leave'// Nghỉ đột xuất / Báo hỏng xe / Việc gấp
  | 'scheduled_leave'// Nghỉ phép có báo trước
  | 'standby';       // Sẵn sàng chờ lệnh điều phối

export interface DriverAttendance {
  id: string;
  driverId: string;
  driverCode: string;
  driverName: string;
  driverPhone: string;
  licensePlate?: string;
  workingType: DriverWorkingType;
  date: string; // YYYY-MM-DD
  shift: AttendanceShift;
  status: DriverShiftStatus;
  checkInTime: string; // ISO string
  checkOutTime?: string; // ISO string
  note?: string; // Lý do nghỉ đột xuất, ra ca, ghi chú điều phối
  standbyZone?: string; // Khu vực hoạt động / Trạm chờ điều phối (e.g. Quận 1, Sân bay, Bến xe)
  updatedAt: string;
}

export interface DriverSession {
  driverId: string;
  driverCode: string;
  driverName: string;
  phone: string;
  workingType: DriverWorkingType;
  loginAt: string;
}

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
  | 'ATTENDANCE_CHECKIN'
  | 'ATTENDANCE_UPDATE'
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
