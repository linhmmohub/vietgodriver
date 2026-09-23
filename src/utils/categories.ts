import { EquipmentCategory, ExpenseCategoryConfig, SystemFeeSettings, DriverWorkflowSettings, AttendanceSettings } from '../types';

export const EQUIPMENT_STORAGE_KEY = 'driver_equipment_categories_v1';
export const EXPENSE_CATEGORIES_STORAGE_KEY = 'driver_expense_categories_v1';
export const FEE_SETTINGS_STORAGE_KEY = 'driver_fee_settings_v1';
export const DRIVER_WORKFLOW_STORAGE_KEY = 'driver_workflow_settings_v1';
export const ATTENDANCE_SETTINGS_STORAGE_KEY = 'driver_attendance_settings_v1';

export const DEFAULT_EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'shirt',
    name: 'Áo đồng phục',
    code: 'AO',
    unit: 'áo',
    icon: 'shirt',
    defaultDeposit: 100000,
    hasSize: true,
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    penaltyOnLoss: 100000,
    description: 'Áo thun đồng phục có cổ in logo công ty',
    isActive: true,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'helmet',
    name: 'Mũ bảo hiểm',
    code: 'MU',
    unit: 'cái',
    icon: 'helmet',
    defaultDeposit: 100000,
    hasSize: false,
    penaltyOnLoss: 100000,
    description: 'Mũ bảo hiểm 3/4 hoặc nửa đầu đạt chuẩn',
    isActive: true,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'box',
    name: 'Thùng đựng hàng',
    code: 'THUNG',
    unit: 'thùng',
    icon: 'box',
    defaultDeposit: 100000,
    hasSize: false,
    penaltyOnLoss: 100000,
    description: 'Thùng giữ nhiệt / giao hàng chuyên dụng gắn xe máy',
    isActive: true,
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'raincoat',
    name: 'Áo mưa phản quang',
    code: 'AOMUA',
    unit: 'bộ',
    icon: 'shield',
    defaultDeposit: 50000,
    hasSize: false,
    penaltyOnLoss: 50000,
    description: 'Áo mưa bộ cánh dơi chống thấm có dải phản quang an toàn',
    isActive: true,
    order: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'delivery_bag',
    name: 'Balo giao hàng',
    code: 'BALO',
    unit: 'chiếc',
    icon: 'package',
    defaultDeposit: 150000,
    hasSize: false,
    penaltyOnLoss: 150000,
    description: 'Balo chống nước đa năng cho tài xế giao hàng nhanh',
    isActive: true,
    order: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    id: 'buy_uniform',
    name: 'May & Mua Áo đồng phục',
    code: 'CHI_AO',
    color: 'emerald',
    estimatedUnitPrice: 85000,
    description: 'Đặt may áo thun đồng phục mới từ xưởng',
    isActive: true,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'buy_helmet',
    name: 'Mua Mũ bảo hiểm',
    code: 'CHI_MU',
    color: 'blue',
    estimatedUnitPrice: 95000,
    description: 'Nhập lô mũ bảo hiểm in logo đạt chuẩn',
    isActive: true,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'buy_delivery_box',
    name: 'Mua Thùng đựng hàng',
    code: 'CHI_THUNG',
    color: 'amber',
    estimatedUnitPrice: 180000,
    description: 'Mua thùng giao hàng giữ nhiệt & giá sắt lắp xe',
    isActive: true,
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'print_logo',
    name: 'In ấn logo & Decal',
    code: 'CHI_IN',
    color: 'purple',
    estimatedUnitPrice: 25000,
    description: 'In ấn logo, decal phản quang dán thùng và mũ',
    isActive: true,
    order: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'warehouse_shipping',
    name: 'Vận chuyển kho & Ship hàng',
    code: 'CHI_SHIP',
    color: 'indigo',
    estimatedUnitPrice: 30000,
    description: 'Phí ship trang bị đến kho hoặc bưu cục',
    isActive: true,
    order: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'refund_driver',
    name: 'Hoàn tiền cọc tài xế',
    code: 'HOAN_COC',
    color: 'orange',
    estimatedUnitPrice: 300000,
    description: 'Chi hoàn tiền cọc khi tài xế nghỉ việc bàn giao đủ đồ',
    isActive: true,
    order: 6,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'buy_accessories',
    name: 'Mua Áo mưa & Phụ kiện',
    code: 'CHI_PK',
    color: 'teal',
    estimatedUnitPrice: 45000,
    description: 'Mua áo mưa, găng tay, thẻ tên, túi chống nước',
    isActive: true,
    order: 7,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'maintenance',
    name: 'Bảo dưỡng & Sửa chữa trang bị',
    code: 'BAO_DUONG',
    color: 'slate',
    estimatedUnitPrice: 50000,
    description: 'Hàn khung sắt, thay khóa thùng, vá áo bảo hộ',
    isActive: true,
    order: 8,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'other',
    name: 'Chi phí nội bộ khác',
    code: 'CHI_KHAC',
    color: 'rose',
    description: 'Các khoản phát sinh nội bộ chưa phân loại',
    isActive: true,
    order: 9,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_SYSTEM_FEE_SETTINGS: SystemFeeSettings = {
  defaultUniformDeposit: 300000, // 300.000 VND
  autoCalculateDepositFromItems: true, // Auto sum from selected equipment
  defaultRefundPercentage: 100, // 100% when returned
  feePolicyNote: 'Mức thu cọc chuẩn là 300.000đ khi nhận bộ 3 trang bị cơ bản (Áo, Mũ, Thùng). Khi nghỉ việc hoặc thanh lý hợp đồng, tài xế bàn giao đầy đủ hiện vật sẽ được hoàn lại 100% tiền cọc.',
  updatedAt: new Date().toISOString(),
};

const workflowOption = (id: string, name: string, description: string, order: number) => ({
  id, name, description, order, isActive: true, createdAt: '2026-01-01T00:00:00.000Z',
});

export const DEFAULT_DRIVER_WORKFLOW_SETTINGS: DriverWorkflowSettings = {
  workingTypes: [
    workflowOption('fulltime', 'Toàn thời gian', 'Làm việc theo lịch cố định', 1),
    workflowOption('parttime', 'Bán thời gian', 'Làm việc linh hoạt/theo ca', 2),
  ],
  approvalStatuses: [
    workflowOption('approved', 'Đã duyệt', 'Đủ điều kiện hoạt động và nhận trang bị', 1),
    workflowOption('pending', 'Chờ duyệt', 'Đang kiểm tra hồ sơ hoặc chờ bổ sung', 2),
  ],
  paymentStatuses: [
    workflowOption('paid', 'Đã thu đủ', 'Đã hoàn tất tiền cọc', 1),
    workflowOption('partial', 'Thu một phần', 'Còn công nợ', 2),
    workflowOption('unpaid', 'Chưa thu', 'Chưa nhận tiền cọc', 3),
  ],
  refundStatuses: [
    workflowOption('refunded', 'Đã hoàn tiền', 'Đã hoàn cọc cho tài xế', 1),
    workflowOption('pending', 'Chờ hoàn', 'Chờ bàn giao hoặc phê duyệt', 2),
    workflowOption('no_refund', 'Không hoàn', 'Không thuộc diện hoàn cọc', 3),
  ],
  revocationReasons: [
    workflowOption('violation', 'Vi phạm quy chế / kỷ luật', 'Thu hồi do vi phạm', 1),
    workflowOption('resigned', 'Nghỉ việc / bàn giao đồ', 'Thanh lý khi nghỉ việc', 2),
    workflowOption('damaged', 'Trang bị hư hỏng cần đổi', 'Đổi hoặc thu hồi trang bị', 3),
    workflowOption('other', 'Lý do khác', 'Trường hợp khác', 4),
  ],
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_ATTENDANCE_SETTINGS: AttendanceSettings = {
  shifts: [
    { id: 'office_hours', name: 'Bận giờ hành chính', startTime: '08:00', endTime: '17:00', description: 'Công việc tại công ty khác', isActive: true, order: 1 },
    { id: 'factory_shift_1', name: 'Bận ca giày da 1', startTime: '05:00', endTime: '14:00', description: 'Công việc tại công ty khác', isActive: true, order: 2 },
    { id: 'factory_shift_2', name: 'Bận ca giày da 2', startTime: '14:00', endTime: '22:00', description: 'Công việc tại công ty khác', isActive: true, order: 3 },
    { id: 'factory_shift_3', name: 'Bận ca giày da 3', startTime: '22:00', endTime: '07:00', description: 'Công việc tại công ty khác', isActive: true, order: 4 },
    { id: 'vietgo_fulltime', name: 'Không bận công ty khác', description: 'Có thể nhận ca VietGo toàn khung giờ', isActive: true, order: 5 },
    { id: 'flexible', name: 'Lịch bận linh hoạt', description: 'Đăng ký theo ngày/tuần', isActive: true, order: 6 },
  ],
  zones: [
    { id: 'q1_ben_thanh', name: 'Quận 1 - Bến Thành', isActive: true, order: 1 },
    { id: 'q3_dan_chu', name: 'Quận 3 - Dân Chủ', isActive: true, order: 2 },
    { id: 'tan_binh_airport', name: 'Tân Bình - Sân Bay Tân Sơn Nhất', isActive: true, order: 3 },
    { id: 'binh_thanh_mien_dong', name: 'Bình Thạnh - Bến Xe Miền Đông', isActive: true, order: 4 },
    { id: 'thu_duc_hitech', name: 'Thủ Đức - Khu Công Nghệ Cao', isActive: true, order: 5 },
    { id: 'q7_phu_my_hung', name: 'Quận 7 - Phú Mỹ Hưng', isActive: true, order: 6 },
    { id: 'binh_tan_mien_tay', name: 'Bình Tân - Bến Xe Miền Tây', isActive: true, order: 7 },
    { id: 'flexible_zone', name: 'Khu vực linh hoạt', isActive: true, order: 8 },
  ],
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================

export function getStoredEquipmentCategories(): EquipmentCategory[] {
  try {
    const raw = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    if (!raw) return DEFAULT_EQUIPMENT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EQUIPMENT_CATEGORIES;
  } catch {
    return DEFAULT_EQUIPMENT_CATEGORIES;
  }
}

export function saveStoredEquipmentCategories(categories: EquipmentCategory[]) {
  try {
    localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving equipment categories:', e);
  }
}

export function getStoredExpenseCategories(): ExpenseCategoryConfig[] {
  try {
    const raw = localStorage.getItem(EXPENSE_CATEGORIES_STORAGE_KEY);
    if (!raw) return DEFAULT_EXPENSE_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EXPENSE_CATEGORIES;
  } catch {
    return DEFAULT_EXPENSE_CATEGORIES;
  }
}

export function saveStoredExpenseCategories(categories: ExpenseCategoryConfig[]) {
  try {
    localStorage.setItem(EXPENSE_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving expense categories:', e);
  }
}

export function getStoredSystemFeeSettings(): SystemFeeSettings {
  try {
    const raw = localStorage.getItem(FEE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SYSTEM_FEE_SETTINGS;
    const parsed = JSON.parse(raw);
    return parsed?.defaultUniformDeposit ? parsed : DEFAULT_SYSTEM_FEE_SETTINGS;
  } catch {
    return DEFAULT_SYSTEM_FEE_SETTINGS;
  }
}

export function saveStoredSystemFeeSettings(settings: SystemFeeSettings) {
  try {
    localStorage.setItem(FEE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving fee settings:', e);
  }
}

// Kept for compatibility with existing application imports.
export const getStoredFeeSettings = getStoredSystemFeeSettings;
export const saveStoredFeeSettings = saveStoredSystemFeeSettings;

export function getStoredDriverWorkflowSettings(): DriverWorkflowSettings {
  try {
    const raw = localStorage.getItem(DRIVER_WORKFLOW_STORAGE_KEY);
    if (!raw) return DEFAULT_DRIVER_WORKFLOW_SETTINGS;
    const parsed = JSON.parse(raw);
    return parsed?.workingTypes && parsed?.approvalStatuses ? parsed : DEFAULT_DRIVER_WORKFLOW_SETTINGS;
  } catch {
    return DEFAULT_DRIVER_WORKFLOW_SETTINGS;
  }
}

export function saveStoredDriverWorkflowSettings(settings: DriverWorkflowSettings) {
  try {
    localStorage.setItem(DRIVER_WORKFLOW_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving driver workflow settings:', e);
  }
}

export function getStoredAttendanceSettings(): AttendanceSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(ATTENDANCE_SETTINGS_STORAGE_KEY) || 'null');
    return parsed?.shifts && parsed?.zones ? parsed : DEFAULT_ATTENDANCE_SETTINGS;
  } catch {
    return DEFAULT_ATTENDANCE_SETTINGS;
  }
}

export function saveStoredAttendanceSettings(settings: AttendanceSettings) {
  try {
    localStorage.setItem(ATTENDANCE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving attendance settings:', error);
  }
}
