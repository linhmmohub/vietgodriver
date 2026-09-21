import { Driver, ExpenseItem } from '../types';

const DRIVERS_STORAGE_KEY = 'driver_uniform_drivers_v1';
const EXPENSES_STORAGE_KEY = 'driver_uniform_expenses_v1';

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    code: 'TX-101',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    licensePlate: '29A-883.92',
    joinDate: '2026-03-01',
    hasHelmet: true,
    helmetQuantity: 1,
    helmetDate: '2026-03-01',
    hasShirt: true,
    shirtSize: 'L',
    shirtQuantity: 2,
    shirtDate: '2026-03-01',
    otherItems: '01 Áo mưa cánh dơi, 01 Túi bao điện thoại chống nước',
    paymentStatus: 'paid',
    uniformFeeRequired: 400000,
    uniformFeePaid: 400000,
    paymentDate: '2026-03-01',
    paymentMethod: 'transfer',
    paymentNote: 'Đã thanh toán đủ qua Techcombank',
    isRevoked: false,
    revokedHelmet: false,
    revokedShirt: false,
    refundStatus: 'no_refund',
    refundAmount: 0,
    generalNote: 'Tài xế chạy tuyến nội thành, tác phong tốt',
    updatedAt: '2026-03-01T08:30:00Z',
  },
  {
    id: 'drv-2',
    code: 'TX-102',
    name: 'Trần Minh Bình',
    phone: '0912345678',
    licensePlate: '51F-654.12',
    joinDate: '2026-02-15',
    hasHelmet: true,
    helmetQuantity: 1,
    helmetDate: '2026-02-15',
    hasShirt: true,
    shirtSize: 'XL',
    shirtQuantity: 2,
    shirtDate: '2026-02-15',
    otherItems: '01 Thẻ tên đeo cổ',
    paymentStatus: 'paid',
    uniformFeeRequired: 400000,
    uniformFeePaid: 400000,
    paymentDate: '2026-02-15',
    paymentMethod: 'cash',
    paymentNote: 'Tiền mặt nộp tại văn phòng',
    isRevoked: true,
    revocationDate: '2026-03-12',
    revocationReason: 'violation',
    revocationReasonDetail: 'Vi phạm quy định chạy quá tốc độ và thái độ không đúng chuẩn mực với khách hàng.',
    revokedHelmet: true,
    revokedShirt: true,
    refundStatus: 'refunded',
    refundAmount: 250000,
    refundDate: '2026-03-14',
    refundNote: 'Đã thu hồi đủ mũ + áo. Khấu trừ 150k phí hao mòn và phạt vi phạm, hoàn trả 250k tiền mặt.',
    generalNote: 'Đã ký biên bản hủy hợp đồng dịch vụ',
    updatedAt: '2026-03-14T10:15:00Z',
  },
  {
    id: 'drv-3',
    code: 'TX-103',
    name: 'Lê Hoàng Cường',
    phone: '0987654321',
    licensePlate: '30E-918.44',
    joinDate: '2026-03-10',
    hasHelmet: false,
    helmetQuantity: 0,
    hasShirt: true,
    shirtSize: 'M',
    shirtQuantity: 1,
    shirtDate: '2026-03-10',
    otherItems: '',
    paymentStatus: 'partial',
    uniformFeeRequired: 400000,
    uniformFeePaid: 200000,
    paymentDate: '2026-03-10',
    paymentMethod: 'transfer',
    paymentNote: 'Cọc trước 200k khi nhận áo, hẹn nhận mũ trả nốt',
    isRevoked: false,
    revokedHelmet: false,
    revokedShirt: false,
    refundStatus: 'no_refund',
    refundAmount: 0,
    generalNote: 'Kho đang tạm hết mũ size L, chờ đợt hàng về bù',
    updatedAt: '2026-03-10T14:20:00Z',
  },
  {
    id: 'drv-4',
    code: 'TX-104',
    name: 'Vũ Đức Dũng',
    phone: '0978112233',
    licensePlate: '43C-445.89',
    joinDate: '2026-01-20',
    hasHelmet: true,
    helmetQuantity: 1,
    helmetDate: '2026-01-20',
    hasShirt: true,
    shirtSize: 'XXL',
    shirtQuantity: 2,
    shirtDate: '2026-01-20',
    otherItems: '01 Áo mưa',
    paymentStatus: 'paid',
    uniformFeeRequired: 400000,
    uniformFeePaid: 400000,
    paymentDate: '2026-01-20',
    paymentMethod: 'transfer',
    isRevoked: true,
    revocationDate: '2026-03-18',
    revocationReason: 'violation',
    revocationReasonDetail: 'Tự ý hủy 5 đơn liên tiếp và sử dụng đồng phục công ty ngoài mục đích vận chuyển.',
    revokedHelmet: false,
    revokedShirt: false,
    refundStatus: 'pending',
    refundAmount: 300000,
    refundNote: 'Chưa thu hồi được đồng phục do tài xế chưa lên văn phòng bàn giao.',
    generalNote: 'Cần gọi điện nhắc nhở hoàn trả đồng phục trong tuần này',
    updatedAt: '2026-03-18T16:45:00Z',
  },
  {
    id: 'drv-5',
    code: 'TX-105',
    name: 'Phạm Thị Thúy',
    phone: '0933556677',
    licensePlate: '60B-789.01',
    joinDate: '2026-03-15',
    hasHelmet: true,
    helmetQuantity: 1,
    helmetDate: '2026-03-15',
    hasShirt: true,
    shirtSize: 'S',
    shirtQuantity: 2,
    shirtDate: '2026-03-15',
    otherItems: '01 Túi đeo chéo logo',
    paymentStatus: 'unpaid',
    uniformFeeRequired: 400000,
    uniformFeePaid: 0,
    isRevoked: false,
    revokedHelmet: false,
    revokedShirt: false,
    refundStatus: 'no_refund',
    refundAmount: 0,
    paymentNote: 'Tài xế xin nợ tiền đồng phục đến kỳ lương ngày 25',
    generalNote: 'Tài xế nữ giao hàng nhanh',
    updatedAt: '2026-03-15T09:00:00Z',
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    date: '2026-03-01',
    title: 'Đặt may 50 áo thun đồng phục cổ bẻ (size S, M, L, XL)',
    category: 'buy_uniform',
    amount: 5500000,
    recipient: 'Xưởng may Đồng Phục Tân Tiến',
    internalNote: 'Đơn giá 110.000đ/áo, vải cá sấu mè thoáng mát. Chuyển khoản cọc 50%.',
    receiptImageUrl: '',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'exp-2',
    date: '2026-03-05',
    title: 'Nhập 40 Mũ bảo hiểm nửa đầu có kính in logo chuẩn CR',
    category: 'buy_helmet',
    amount: 3800000,
    recipient: 'Công ty TNHH Mũ Bảo Hiểm Việt Nhật',
    internalNote: 'Đơn giá 95.000đ/mũ. Đã nhận đủ hàng tại kho.',
    receiptImageUrl: '',
    createdAt: '2026-03-05T15:20:00Z',
  },
  {
    id: 'exp-3',
    date: '2026-03-14',
    title: 'Chi hoàn tiền đồng phục tài xế Trần Minh Bình (TX-102)',
    category: 'refund_driver',
    amount: 250000,
    recipient: 'Tài xế Trần Minh Bình',
    internalNote: 'Thu hồi đủ mũ + áo do vi phạm, trừ 150k và hoàn 250k tiền mặt.',
    receiptImageUrl: '',
    createdAt: '2026-03-14T10:20:00Z',
  }
];

export function getStoredDrivers(): Driver[] {
  try {
    const raw = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(INITIAL_DRIVERS));
      return INITIAL_DRIVERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading drivers from localStorage:', e);
    return INITIAL_DRIVERS;
  }
}

export function saveStoredDrivers(drivers: Driver[]) {
  try {
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  } catch (e) {
    console.error('Error saving drivers to localStorage:', e);
  }
}

export function getStoredExpenses(): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses from localStorage:', e);
    return INITIAL_EXPENSES;
  }
}

export function saveStoredExpenses(expenses: ExpenseItem[]) {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage:', e);
  }
}
