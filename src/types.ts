export type UniformItemStatus = 'none' | 'issued' | 'returned';

export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Chưa chọn';

// IDs are configured by the Super Admin. The legacy IDs remain the defaults.
export type PaymentStatus = string;
export type RevokeReason = string;
export type RefundStatus = string;
export type DriverWorkingType = string;
export type DriverApprovalStatus = string;

// ==========================================
// CẤU HÌNH DANH MỤC & CHI PHÍ TÙY BIẾN (ADMIN)
// ==========================================

export interface EquipmentCategory {
  id: string; // Key / ID (vd: 'ao', 'mu', 'thung', 'ao_mua', 'balo', 'gang_tay'...)
  name: string; // Tên hiển thị (vd: 'Áo đồng phục', 'Mũ bảo hiểm', 'Thùng đựng hàng'...)
  code: string; // Mã viết tắt (vd: 'AO', 'MU', 'THUNG', 'AOMUA'...)
  unit: string; // Đơn vị tính (vd: 'cái', 'chiếc', 'bộ'...)
  icon: 'shirt' | 'helmet' | 'box' | 'shield' | 'package' | 'layers' | 'tag' | 'bag';
  defaultDeposit: number; // Mức tiền cọc / giá trị quy định cho món này (vd: 100.000đ)
  hasSize: boolean; // Có yêu cầu chọn size hay không
  availableSizes?: ShirtSize[]; // Danh sách size nếu hasSize = true
  penaltyOnLoss: number; // Mức phạt / khấu trừ khi làm mất hoặc không hoàn trả
  description?: string;
  isActive: boolean; // Bật / Tắt danh mục
  order: number;
  createdAt: string;
}

export interface ExpenseCategoryConfig {
  id: string; // Key / ID (vd: 'buy_uniform', 'buy_helmet', 'buy_delivery_box', 'print_logo'...)
  name: string; // Tên hiển thị (vd: 'May & Mua Áo đồng phục', 'Mua Thùng hàng'...)
  code: string;
  color: 'emerald' | 'blue' | 'amber' | 'indigo' | 'purple' | 'rose' | 'slate' | 'teal' | 'orange' | 'cyan';
  estimatedUnitPrice?: number; // Đơn giá dự toán tham khảo
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface SystemFeeSettings {
  defaultUniformDeposit: number; // Mức thu cọc mặc định khi thêm tài xế (mặc định 300.000đ)
  autoCalculateDepositFromItems: boolean; // Tự động cộng tổng tiền cọc theo các trang bị được chọn
  defaultRefundPercentage: number; // Tỷ lệ hoàn cọc mặc định khi trả đủ đồ (100%)
  feePolicyNote?: string; // Ghi chú chính sách cọc & hoàn trả
  updatedAt: string;
}

export type DriverWorkflowCategory =
  | 'workingTypes'
  | 'approvalStatuses'
  | 'paymentStatuses'
  | 'refundStatuses'
  | 'revocationReasons';

export interface DriverWorkflowOption {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface DriverWorkflowSettings {
  workingTypes: DriverWorkflowOption[];
  approvalStatuses: DriverWorkflowOption[];
  paymentStatuses: DriverWorkflowOption[];
  refundStatuses: DriverWorkflowOption[];
  revocationReasons: DriverWorkflowOption[];
  updatedAt: string;
}

export interface CustomIssuedItem {
  issued: boolean;
  quantity: number;
  date?: string;
  size?: string;
  isRevoked?: boolean;
}

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

  // Tình trạng Thùng đựng hàng / Thùng giao hàng
  hasDeliveryBox?: boolean;
  boxQuantity?: number;
  boxDate?: string;
  
  // Phụ kiện / Trang bị tùy biến theo danh mục Admin
  customItems?: Record<string, CustomIssuedItem>;
  otherItems?: string;
  
  // Thu tiền đồng phục
  paymentStatus: PaymentStatus;
  uniformFeeRequired: number; // Tiền phải thu (vd: 300.000đ)
  uniformFeePaid: number; // Thực tế đã thu (vd: 300.000đ)
  paymentDate?: string;
  paymentMethod?: 'cash' | 'transfer';
  paymentNote?: string;

  // Thu hồi đồng phục / trang bị (do vi phạm / nghỉ việc)
  isRevoked: boolean; // Đang trong trạng thái bị thu hồi
  revocationDate?: string;
  revocationReason?: RevokeReason;
  revocationReasonDetail?: string; // Chi tiết vi phạm
  revokedHelmet: boolean; // Đã thu hồi mũ chưa
  revokedShirt: boolean; // Đã thu hồi áo chưa
  revokedBox?: boolean; // Đã thu hồi thùng đựng hàng chưa
  
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
  category: string; // ID danh mục chi tiêu (vd: buy_uniform, buy_helmet, buy_delivery_box, custom...)
  amount: number; // Số tiền chi
  recipient?: string; // Người nhận / Đơn vị cung cấp
  internalNote?: string; // Ghi chú nội bộ
  receiptImageUrl?: string; // Ảnh hóa đơn / bill chuyển khoản (Data URL)
  createdAt: string;
}

export type ActiveTab = 'drivers' | 'attendance' | 'inventory' | 'expenses' | 'summary' | 'logs' | 'users' | 'settings';

// Shift IDs are configured by Admin, so historic attendance keeps a string ID.
export type AttendanceShift = string;

export interface AttendanceShiftOption {
  id: string;
  name: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface AttendanceZoneOption {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface AttendanceSettings {
  shifts: AttendanceShiftOption[];
  zones: AttendanceZoneOption[];
  updatedAt: string;
}

export type DriverShiftStatus = 'on_duty' | 'standby' | 'off_duty' | 'emergency_leave';

export interface DriverSession {
  driverId: string;
  phone: string;
  loggedInAt: string;
  expiresAt?: string;
}

/**
 * A short-lived, consent-based live presence record.  One document is kept
 * per driver so the dispatch screen can subscribe to it in real time without
 * exposing a history of locations.
 */
export interface DriverLiveStatus {
  driverId: string;
  driverCode: string;
  driverName: string;
  driverPhone: string;
  licensePlate?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
  heading?: number | null;
  isSharingLocation: boolean;
  /** The driver has explicitly opted in to show their current point to colleagues. */
  isVisibleToDrivers: boolean;
  onlineSince: string;
  lastSeenAt: string;
}

export interface DriverRoutePoint {
  id: string;
  driverId: string;
  date: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
  recordedAt: string;
}

export interface DriverAttendance {
  id: string;
  driverId: string;
  driverCode: string;
  driverName: string;
  driverPhone: string;
  licensePlate?: string;
  workingType: DriverWorkingType;
  date: string;
  shift: AttendanceShift;
  /** Multiple company schedules may block the same VietGo day. */
  busyShiftIds?: AttendanceShift[];
  status: DriverShiftStatus;
  checkInTime?: string;
  checkOutTime?: string;
  standbyZone?: string;
  /** A driver may register more than one preferred dispatch zone. */
  standbyZones?: string[];
  note?: string;
  absenceStartTime?: string;
  absenceEndTime?: string;
  scheduleScope?: 'daily' | 'weekly';
  weekStart?: string;
  updatedAt: string;
}

export interface UniformStockItem {
  id: string;
  name: string;
  type: 'helmet' | 'shirt' | 'box' | 'other';
  size?: ShirtSize;
  totalImported: number; // Tổng số lượng nhập vào kho
  totalIssued: number; // Tổng số lượng đã phát cho tài xế
  totalReturned: number; // Tổng số lượng đã thu hồi về kho
  currentStock: number; // Số lượng tồn kho thực tế
  minThreshold: number; // Định mức tồn tối thiểu cảnh báo hết hàng
  unitPrice?: number; // Đơn giá dự kiến / cái
}

// Three access levels: Admin Tổng, Quản lý vận hành, and Quản lý ca trực.
export type UserRole = 'super_admin' | 'manager' | 'staff';

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
  | 'INVENTORY_UPDATE'
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
  /** Number of days a driver's remembered-device session remains valid. */
  driverSessionDays: number;
}
