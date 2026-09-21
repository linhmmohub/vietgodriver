import React, { useState, useEffect } from 'react';
import { 
  getStoredDrivers, 
  saveStoredDrivers, 
  getStoredExpenses, 
  saveStoredExpenses,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredDriverSession,
  saveStoredDriverSession
} from './utils/storage';
import { 
  getStoredAuthSession, 
  saveStoredAuthSession, 
  logoutActiveUser,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  addAuditLog,
  getAuthSettings,
  saveAuthSettings,
  getSystemUsers,
  saveSystemUsers,
  DEFAULT_SUPER_ADMIN,
  DEFAULT_STAFF_USER
} from './utils/auth';
import { 
  subscribeCloudDrivers, 
  subscribeCloudExpenses, 
  subscribeCloudUsers, 
  subscribeCloudLogs,
  subscribeCloudAttendance,
  saveDriverToCloud,
  deleteDriverFromCloud,
  saveExpenseToCloud,
  deleteExpenseFromCloud,
  saveAttendanceToCloud,
  deleteAttendanceFromCloud,
  restoreDatabaseToCloud,
  initializeCloudDatabaseIfNeeded
} from './services/firestoreSync';
import { 
  Driver, 
  ExpenseItem, 
  ActiveTab, 
  AuthSession, 
  AuthSettings, 
  AuditLogItem,
  DriverAttendance,
  DriverSession,
  AttendanceShift,
  DriverShiftStatus
} from './types';
import { downloadCSV, formatDate } from './utils/formatters';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { DriverList } from './components/DriverList';
import { DriverModal } from './components/DriverModal';
import { DriverDetailModal } from './components/DriverDetailModal';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { BackupModal } from './components/BackupModal';
import { SummaryDashboard } from './components/SummaryDashboard';
import { AuditLogView } from './components/AuditLogView';
import { UserManagementView } from './components/UserManagementView';
import { DispatchDashboard } from './components/DispatchDashboard';
import { DriverPortalModal } from './components/DriverPortalModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { AdminLockScreen } from './components/AdminLockScreen';
import { Plus, CloudCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredDrivers());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => getStoredExpenses());
  const [logs, setLogs] = useState<AuditLogItem[]>(() => getStoredAuditLogs());
  const [attendanceList, setAttendanceList] = useState<DriverAttendance[]>(() => getStoredAttendance());
  const [driverSession, setDriverSession] = useState<DriverSession | null>(() => getStoredDriverSession());
  const [activeTab, setActiveTab] = useState<ActiveTab>('drivers');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Auth & Session state
  const [adminUser, setAdminUser] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [authSettings, setAuthSettings] = useState<AuthSettings>(() => getAuthSettings());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDriverPortalOpen, setIsDriverPortalOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState<string | undefined>();

  // Modals
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseItem | null>(null);

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Initialize Cloud Firestore and setup real-time listeners for all devices
  useEffect(() => {
    // 1. Listen for drivers in real time
    const unsubDrivers = subscribeCloudDrivers((cloudDrivers) => {
      setDrivers(cloudDrivers);
      saveStoredDrivers(cloudDrivers);
      setIsCloudSynced(true);
    });

    // 2. Listen for expenses in real time
    const unsubExpenses = subscribeCloudExpenses((cloudExpenses) => {
      setExpenses(cloudExpenses);
      saveStoredExpenses(cloudExpenses);
    });

    // 3. Listen for system users & roles in real time
    const unsubUsers = subscribeCloudUsers((cloudUsers) => {
      saveSystemUsers(cloudUsers);
    });

    // 4. Listen for audit logs in real time
    const unsubLogs = subscribeCloudLogs((cloudLogs) => {
      setLogs(cloudLogs);
      saveStoredAuditLogs(cloudLogs);
    });

    // 5. Listen for driver attendance / checkin in real time
    const unsubAttendance = subscribeCloudAttendance((cloudAttendance) => {
      setAttendanceList(cloudAttendance);
      saveStoredAttendance(cloudAttendance);
    });

    return () => {
      unsubDrivers();
      unsubExpenses();
      unsubUsers();
      unsubLogs();
      unsubAttendance();
    };
  }, []);

  // Sync data to local storage as offline cache
  useEffect(() => {
    saveStoredDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredAttendance(attendanceList);
  }, [attendanceList]);

  useEffect(() => {
    saveStoredDriverSession(driverSession);
  }, [driverSession]);

  // Keep logs refreshed
  const reloadLogs = () => {
    setLogs(getStoredAuditLogs());
  };

  // Restrict staff tab access: Subordinates can access 'drivers' and 'dispatch'
  useEffect(() => {
    if (adminUser && adminUser.role === 'staff' && activeTab !== 'drivers' && activeTab !== 'dispatch') {
      setActiveTab('drivers');
    }
  }, [adminUser, activeTab]);

  const handleLoginSuccess = (user: AuthSession) => {
    setAdminUser(user);
    saveStoredAuthSession(user);
    setIsLoginModalOpen(false);
    setLoginPromptMessage(undefined);
    reloadLogs();
  };

  const handleLogout = () => {
    logoutActiveUser();
    setAdminUser(null);
    reloadLogs();
  };

  const handleLockApp = () => {
    handleLogout();
  };

  // Helper for admin-only restriction
  const requireSuperAdmin = (featureName: string): boolean => {
    if (!adminUser) {
      setLoginPromptMessage('Vui lòng đăng nhập Admin Tổng để tiếp tục.');
      setIsLoginModalOpen(true);
      return false;
    }
    if (adminUser.role !== 'super_admin') {
      alert(`Tính năng "${featureName}" chỉ dành cho tài khoản Admin Tổng. Tài khoản cấp dưới chỉ có quyền thao tác mục Tài xế.`);
      return false;
    }
    return true;
  };

  // DRIVER ACTIONS (Accessible by both Super Admin and Subordinates)
  const handleOpenNewDriver = () => {
    if (!adminUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setDriverToEdit(null);
    setIsDriverModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    if (!adminUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setDriverToEdit(driver);
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = (savedDriver: Driver) => {
    const isNew = !drivers.some((d) => d.id === savedDriver.id);

    setDrivers((prev) => {
      if (!isNew) {
        return prev.map((d) => (d.id === savedDriver.id ? savedDriver : d));
      }
      return [savedDriver, ...prev];
    });

    // Save to Firestore Cloud
    saveDriverToCloud(savedDriver);

    // Write Audit Log
    if (isNew) {
      addAuditLog(
        'DRIVER_CREATE',
        'Thêm tài xế mới',
        `Thêm tài xế ${savedDriver.name} (${savedDriver.code}) - SĐT: ${savedDriver.phone}, Cọc: ${savedDriver.uniformFeePaid.toLocaleString('vi-VN')}đ, Mũ: ${savedDriver.helmetQuantity || 0}, Áo: ${savedDriver.shirtQuantity || 0} (${savedDriver.shirtSize || 'Chưa chọn'})`,
        `${savedDriver.name} (${savedDriver.code})`,
        adminUser
      );
    } else {
      addAuditLog(
        'DRIVER_UPDATE',
        'Cập nhật tài xế',
        `Cập nhật hồ sơ tài xế ${savedDriver.name} (${savedDriver.code}) - Trạng thái tiền: ${savedDriver.paymentStatus}${savedDriver.isRevoked ? ' [Vi phạm thu hồi]' : ''}`,
        `${savedDriver.name} (${savedDriver.code})`,
        adminUser
      );
    }
    reloadLogs();

    setIsDriverModalOpen(false);
    setDriverToEdit(null);

    if (selectedDriver && selectedDriver.id === savedDriver.id) {
      setSelectedDriver(savedDriver);
    }
  };

  const handleDeleteDriver = (id: string) => {
    if (!adminUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const target = drivers.find(d => d.id === id);
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    
    // Delete from Firestore Cloud
    deleteDriverFromCloud(id);

    // Write Audit Log
    addAuditLog(
      'DRIVER_DELETE',
      'Xóa tài xế',
      `Xóa hồ sơ tài xế ${target?.name || ''} (${target?.code || id}) khỏi danh sách`,
      target ? `${target.name} (${target.code})` : id,
      adminUser
    );
    reloadLogs();

    if (selectedDriver?.id === id) {
      setIsDetailModalOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDetailModalOpen(true);
  };

  const handleApproveDriver = (driver: Driver) => {
    if (!adminUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const approved: Driver = {
      ...driver,
      approvalStatus: 'approved',
      rejectionReason: undefined,
      updatedAt: new Date().toISOString()
    };

    setDrivers((prev) => prev.map((d) => (d.id === approved.id ? approved : d)));
    saveDriverToCloud(approved);

    addAuditLog(
      'DRIVER_UPDATE',
      'Phê duyệt tài xế',
      `Phê duyệt chính thức hồ sơ tài xế ${driver.name} (${driver.code}) từ danh sách chờ/dự bị`,
      `${driver.name} (${driver.code})`,
      adminUser
    );
    reloadLogs();

    if (selectedDriver && selectedDriver.id === approved.id) {
      setSelectedDriver(approved);
    }
  };

  // EXPENSE ACTIONS (SUPER ADMIN ONLY)
  const handleOpenNewExpense = () => {
    if (!requireSuperAdmin('Ghi nhận khoản chi tiêu nội bộ')) return;
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (item: ExpenseItem) => {
    if (!requireSuperAdmin('Chỉnh sửa khoản chi tiêu nội bộ')) return;
    setExpenseToEdit(item);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (savedExpense: ExpenseItem) => {
    const isNew = !expenses.some((e) => e.id === savedExpense.id);

    setExpenses((prev) => {
      if (!isNew) {
        return prev.map((e) => (e.id === savedExpense.id ? savedExpense : e));
      }
      return [savedExpense, ...prev];
    });

    // Save to Firestore Cloud
    saveExpenseToCloud(savedExpense);

    // Write Audit Log
    if (isNew) {
      addAuditLog(
        'EXPENSE_CREATE',
        'Thêm khoản chi mới',
        `Lập phiếu chi: "${savedExpense.title}" - Số tiền: ${savedExpense.amount.toLocaleString('vi-VN')}đ - Phân loại: ${savedExpense.category}${savedExpense.receiptImageUrl ? ' (Kèm ảnh bill)' : ''}`,
        savedExpense.title,
        adminUser
      );
    } else {
      addAuditLog(
        'EXPENSE_UPDATE',
        'Sửa khoản chi tiêu',
        `Cập nhật phiếu chi "${savedExpense.title}" - Số tiền: ${savedExpense.amount.toLocaleString('vi-VN')}đ`,
        savedExpense.title,
        adminUser
      );
    }
    reloadLogs();

    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleDeleteExpense = (id: string) => {
    if (!requireSuperAdmin('Xóa khoản chi tiêu')) return;
    const target = expenses.find(e => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    // Delete from Firestore Cloud
    deleteExpenseFromCloud(id);

    // Write Audit Log
    addAuditLog(
      'EXPENSE_DELETE',
      'Xóa phiếu chi',
      `Xóa phiếu chi: "${target?.title || id}" - Số tiền: ${target?.amount.toLocaleString('vi-VN') || 0}đ`,
      target?.title || id,
      adminUser
    );
    reloadLogs();
  };

  // RESTORE BACKUP (SUPER ADMIN ONLY)
  const handleRestoreData = (newDrivers: Driver[], newExpenses: ExpenseItem[]) => {
    setDrivers(newDrivers);
    setExpenses(newExpenses);

    // Overwrite Cloud Firestore
    restoreDatabaseToCloud(newDrivers, newExpenses);

    addAuditLog(
      'BACKUP_RESTORE',
      'Khôi phục dữ liệu sao lưu',
      `Admin Tổng khôi phục cơ sở dữ liệu: ${newDrivers.length} tài xế và ${newExpenses.length} khoản chi tiêu`,
      'Hệ thống sao lưu',
      adminUser
    );
    reloadLogs();
  };

  const handleOpenBackupModal = () => {
    if (!requireSuperAdmin('Sao lưu & Khôi phục dữ liệu')) return;
    setIsBackupModalOpen(true);
  };

  // ATTENDANCE & DISPATCH ACTIONS
  const handleDriverLogin = (driver: Driver) => {
    const newSession: DriverSession = {
      driverId: driver.id,
      driverCode: driver.code,
      driverName: driver.name,
      phone: driver.phone,
      workingType: driver.workingType || 'fulltime',
      loginAt: new Date().toISOString(),
    };
    setDriverSession(newSession);
    saveStoredDriverSession(newSession);
  };

  const handleDriverLogout = () => {
    setDriverSession(null);
    saveStoredDriverSession(null);
  };

  const handleSubmitAttendance = (attendanceData: Omit<DriverAttendance, 'id' | 'updatedAt'>) => {
    const existingIndex = attendanceList.findIndex(
      (a) => a.driverId === attendanceData.driverId && a.date === attendanceData.date && a.shift === attendanceData.shift
    );

    let updatedRecord: DriverAttendance;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      updatedRecord = {
        ...attendanceList[existingIndex],
        ...attendanceData,
        updatedAt: now,
      };
      setAttendanceList((prev) => prev.map((item, idx) => (idx === existingIndex ? updatedRecord : item)));
    } else {
      updatedRecord = {
        ...attendanceData,
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        updatedAt: now,
      };
      setAttendanceList((prev) => [updatedRecord, ...prev]);
    }

    // Save to Firestore Cloud
    saveAttendanceToCloud(updatedRecord);

    // Audit log
    addAuditLog(
      'ATTENDANCE_UPDATE',
      'Điểm danh ca trực',
      `Tài xế ${updatedRecord.driverName} (${updatedRecord.driverCode}) cập nhật ca: ${updatedRecord.shift}, trạng thái: ${updatedRecord.status}${updatedRecord.standbyZone ? `, Trạm: ${updatedRecord.standbyZone}` : ''}${updatedRecord.note ? `, Ghi chú: ${updatedRecord.note}` : ''}`,
      `${updatedRecord.driverName} (${updatedRecord.driverCode})`,
      adminUser
    );
    reloadLogs();
  };

  const handleUpdateAttendanceStatus = (
    attendance: DriverAttendance, 
    newStatus: DriverShiftStatus, 
    note?: string
  ) => {
    const now = new Date().toISOString();
    const updated: DriverAttendance = {
      ...attendance,
      status: newStatus,
      checkOutTime: newStatus === 'off_duty' ? now : attendance.checkOutTime,
      note: note ? (attendance.note ? `${attendance.note} | ${note}` : note) : attendance.note,
      updatedAt: now,
    };

    setAttendanceList((prev) => prev.map((item) => (item.id === attendance.id ? updated : item)));
    saveAttendanceToCloud(updated);

    addAuditLog(
      'ATTENDANCE_UPDATE',
      'Điều phối ca trực',
      `Điều phối viên cập nhật trạng thái của ${updated.driverName} (${updated.driverCode}) thành "${newStatus}"`,
      `${updated.driverName} (${updated.driverCode})`,
      adminUser
    );
    reloadLogs();
  };

  const handleAdminCheckInDriver = (
    driver: Driver, 
    shift: AttendanceShift, 
    status: DriverShiftStatus, 
    zone?: string, 
    note?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const newAttendance: DriverAttendance = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      driverId: driver.id,
      driverCode: driver.code,
      driverName: driver.name,
      driverPhone: driver.phone,
      licensePlate: driver.licensePlate,
      workingType: driver.workingType || 'fulltime',
      date: today,
      shift,
      status,
      checkInTime: now,
      checkOutTime: status === 'off_duty' ? now : undefined,
      standbyZone: zone || 'Quận 1 - Bến Thành',
      note,
      updatedAt: now,
    };

    setAttendanceList((prev) => [newAttendance, ...prev]);
    saveAttendanceToCloud(newAttendance);

    addAuditLog(
      'ATTENDANCE_CHECKIN',
      'Điểm danh hộ tài xế',
      `Điều phối viên điểm danh cho ${driver.name} (${driver.code}) - Ca: ${shift}, Trạng thái: ${status}, Trạm: ${zone || 'Quận 1'}`,
      `${driver.name} (${driver.code})`,
      adminUser
    );
    reloadLogs();
  };

  // EXPORT CSV
  const handleExportCSV = () => {
    if (activeTab === 'expenses') {
      const rows: (string | number)[][] = [
        ['Mã', 'Ngày Chi', 'Tên Khoản Chi', 'Phân Loại', 'Số Tiền (VND)', 'Người Nhận', 'Ghi Chú Nội Bộ', 'Có Ảnh Bill'],
        ...expenses.map((e) => [
          e.id,
          formatDate(e.date),
          e.title,
          e.category,
          e.amount,
          e.recipient || '',
          e.internalNote || '',
          e.receiptImageUrl ? 'Có' : 'Không',
        ]),
      ];
      downloadCSV(`so-chi-tieu-noi-bo-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    } else {
      const rows: (string | number)[][] = [
        [
          'Mã TX',
          'Họ Và Tên',
          'Số Điện Thoại',
          'Biển Số Xe',
          'Hình Thức Làm Việc',
          'Trạng Thái Hồ Sơ',
          'Lý Do Chờ Duyệt / Dự Bị',
          'Ngày Vào Làm',
          'Đã Cấp Mũ',
          'SL Mũ',
          'Đã Cấp Áo',
          'Size Áo',
          'SL Áo',
          'Phụ Kiện Khác',
          'Trạng Thái Tiền',
          'Tiền Phải Thu',
          'Tiền Đã Thu',
          'Còn Nợ',
          'Phương Thức',
          'Ghi Chú Thu Tiền',
          'Bị Thu Hồi Vi Phạm',
          'Lý Do Thu Hồi',
          'Chi Tiết Vi Phạm',
          'Đã Trả Mũ',
          'Đã Trả Áo',
          'Tình Trạng Hoàn Tiền',
          'Số Tiền Hoàn (VND)',
          'Ngày Hoàn Tiền',
          'Ghi Chú Hoàn Tiền',
          'Ghi Chú Chung',
        ],
        ...drivers.map((d) => [
          d.code,
          d.name,
          d.phone,
          d.licensePlate || '',
          d.workingType === 'parttime' ? 'Part-time' : 'Full-time',
          d.approvalStatus === 'pending' ? 'Chờ duyệt (Dự bị)' : 'Đã duyệt chính thức',
          d.rejectionReason || '',
          d.joinDate ? formatDate(d.joinDate) : '',
          d.hasHelmet ? 'Có' : 'Chưa',
          d.helmetQuantity || 0,
          d.hasShirt ? 'Có' : 'Chưa',
          d.shirtSize || '',
          d.shirtQuantity || 0,
          d.otherItems || '',
          d.paymentStatus,
          d.uniformFeeRequired,
          d.uniformFeePaid,
          Math.max(0, d.uniformFeeRequired - d.uniformFeePaid),
          d.paymentMethod || '',
          d.paymentNote || '',
          d.isRevoked ? 'Có' : 'Không',
          d.revocationReason || '',
          d.revocationReasonDetail || '',
          d.revokedHelmet ? 'Có' : 'Chưa',
          d.revokedShirt ? 'Có' : 'Chưa',
          d.refundStatus || '',
          d.refundAmount || 0,
          d.refundDate ? formatDate(d.refundDate) : '',
          d.refundNote || '',
          d.generalNote || '',
        ]),
      ];
      downloadCSV(`danh-sach-dong-phuc-tai-xe-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    }

    addAuditLog(
      'EXPORT_DATA',
      'Xuất file Excel/CSV',
      `${adminUser?.displayName || 'Người dùng'} xuất dữ liệu mục ${activeTab === 'expenses' ? 'Chi tiêu nội bộ' : 'Danh sách tài xế'} ra file CSV`,
      activeTab,
      adminUser
    );
    reloadLogs();
  };

  // MANDATORY LOGIN: User MUST log in before viewing data!
  if (!adminUser) {
    return (
      <AdminLockScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const revokedCount = drivers.filter((d) => d.isRevoked).length;
  const isSuperAdmin = adminUser.role === 'super_admin';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        driverCount={drivers.length}
        attendanceOnDutyCount={attendanceList.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'on_duty').length}
        expenseCount={expenses.length}
        revokedCount={revokedCount}
        logCount={logs.length}
        adminUser={adminUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLockApp={handleLockApp}
        onOpenDriverModal={handleOpenNewDriver}
        onOpenExpenseModal={handleOpenNewExpense}
        onOpenDriverPortal={() => setIsDriverPortalOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenBackupModal={handleOpenBackupModal}
      />

      {/* Cloud Status Indicator */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Cơ sở dữ liệu Đám Mây Firestore:
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Đang đồng bộ trực tiếp thời gian thực (Realtime Multi-device)
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            Dữ liệu trên máy tính, điện thoại, máy khác sẽ luôn giống nhau 100%
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 pb-24 sm:pb-10">
        
        {/* KPI Dashboard Cards (Only show on Drivers, Expenses, or Summary tab) */}
        {(activeTab === 'drivers' || activeTab === 'expenses' || activeTab === 'summary') && (
          <StatsCards drivers={drivers} expenses={expenses} attendanceList={attendanceList} />
        )}

        {/* Tab 1: Driver List (Available to both Super Admin and Subordinates) */}
        {activeTab === 'drivers' && (
          <DriverList
            drivers={drivers}
            onEditDriver={handleEditDriver}
            onDeleteDriver={handleDeleteDriver}
            onViewDriver={handleViewDriver}
            onAddNewDriver={handleOpenNewDriver}
            onApproveDriver={handleApproveDriver}
          />
        )}

        {/* Tab: Dispatch and Realtime Attendance (Available to both Super Admin and Subordinates) */}
        {activeTab === 'dispatch' && (
          <DispatchDashboard
            drivers={drivers}
            attendanceList={attendanceList}
            onOpenDriverPortal={() => setIsDriverPortalOpen(true)}
            onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
            onAdminCheckInDriver={handleAdminCheckInDriver}
          />
        )}

        {/* Tab 2: Internal Expenses & Bill Receipts (Super Admin Only) */}
        {activeTab === 'expenses' && isSuperAdmin && (
          <ExpenseList
            expenses={expenses}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddNewExpense={handleOpenNewExpense}
            onViewImage={(url, title) => setPreviewImage({ url, title })}
          />
        )}

        {/* Tab 3: Summary & Cash Flow Insights (Super Admin Only) */}
        {activeTab === 'summary' && isSuperAdmin && (
          <SummaryDashboard
            drivers={drivers}
            expenses={expenses}
            onSelectDriver={(driver) => {
              setActiveTab('drivers');
              handleViewDriver(driver);
            }}
          />
        )}

        {/* Tab 4: Audit Logs (Super Admin Only) */}
        {activeTab === 'logs' && isSuperAdmin && (
          <AuditLogView
            logs={logs}
            currentUser={adminUser}
            onRefreshLogs={reloadLogs}
          />
        )}

        {/* Tab 5: Subordinate Accounts & Role Management (Super Admin Only) */}
        {activeTab === 'users' && isSuperAdmin && (
          <UserManagementView
            currentUser={adminUser}
            onRefreshSession={() => {
              const updated = getStoredAuthSession();
              if (updated) setAdminUser(updated);
            }}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-[70px] right-4 z-30">
        {activeTab === 'drivers' && (
          <button
            onClick={handleOpenNewDriver}
            className="h-13 w-13 rounded-2xl bg-amber-500 text-slate-950 shadow-2xl flex items-center justify-center font-bold active:scale-90 transition border-2 border-slate-950"
            aria-label="Thêm tài xế mới"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}
        {activeTab === 'expenses' && isSuperAdmin && (
          <button
            onClick={handleOpenNewExpense}
            className="h-13 w-13 rounded-2xl bg-emerald-500 text-slate-950 shadow-2xl flex items-center justify-center font-bold active:scale-90 transition border-2 border-slate-950"
            aria-label="Ghi khoản chi mới"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginPromptMessage(undefined);
        }}
        onLoginSuccess={handleLoginSuccess}
        customMessage={loginPromptMessage}
      />

      {/* Profile & Settings Modal */}
      {adminUser && (
        <AdminProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          adminUser={adminUser}
          authSettings={authSettings}
          onUpdateAuthSettings={setAuthSettings}
          onLogout={handleLogout}
          onUpdateAdminUser={setAdminUser}
        />
      )}

      {/* Driver Modals */}
      <DriverModal
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false);
          setDriverToEdit(null);
        }}
        onSave={handleSaveDriver}
        driverToEdit={driverToEdit}
        existingDriverCodes={drivers.map((d) => d.code)}
      />

      <DriverDetailModal
        driver={selectedDriver}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDriver(null);
        }}
        onEdit={(driver) => {
          setIsDetailModalOpen(false);
          handleEditDriver(driver);
        }}
        onApprove={handleApproveDriver}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage?.url || null}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />

      {/* Data Backup Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        drivers={drivers}
        expenses={expenses}
        onRestoreData={handleRestoreData}
      />

      {/* Driver Portal Attendance Modal */}
      <DriverPortalModal
        isOpen={isDriverPortalOpen}
        onClose={() => setIsDriverPortalOpen(false)}
        drivers={drivers}
        currentDriverSession={driverSession}
        onDriverLogin={handleDriverLogin}
        onDriverLogout={handleDriverLogout}
        todayAttendanceList={attendanceList}
        onSubmitAttendance={handleSubmitAttendance}
      />

    </div>
  );
}
