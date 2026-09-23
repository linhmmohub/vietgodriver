import React, { useState, useEffect } from 'react';
import { 
  getStoredDrivers, 
  saveStoredDrivers, 
  getStoredExpenses, 
  saveStoredExpenses,
  clearStoredDriverSession,
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
  subscribeCloudAttendance,
  subscribeCloudDriverLiveStatus,
  subscribeCloudUsers, 
  subscribeCloudLogs,
  subscribeCloudEquipmentCategories,
  subscribeCloudExpenseCategories,
  subscribeCloudFeeSettings,
  subscribeCloudDriverWorkflow,
  subscribeCloudAuthSettings,
  subscribeCloudAttendanceSettings,
  saveDriverToCloud,
  deleteDriverFromCloud,
  saveExpenseToCloud,
  saveAttendanceToCloud,
  saveDriverLiveStatusToCloud,
  saveDriverRoutePointToCloud,
  deleteExpenseFromCloud,
  saveEquipmentCategoryToCloud,
  deleteEquipmentCategoryFromCloud,
  saveExpenseCategoryToCloud,
  deleteExpenseCategoryFromCloud,
  saveFeeSettingsToCloud,
  saveDriverWorkflowToCloud,
  saveAuthSettingsToCloud,
  saveAttendanceSettingsToCloud,
  restoreDatabaseToCloud,
  initializeCloudDatabaseIfNeeded,
  initializeDriverWorkflowIfNeeded,
  initializeAuthSettingsIfNeeded,
  initializeAttendanceSettingsIfNeeded,
  testFirestoreConnection
} from './services/firestoreSync';
import { 
  getStoredEquipmentCategories, 
  saveStoredEquipmentCategories, 
  getStoredExpenseCategories, 
  saveStoredExpenseCategories, 
  getStoredFeeSettings, 
  saveStoredFeeSettings,
  DEFAULT_EQUIPMENT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_SYSTEM_FEE_SETTINGS,
  getStoredDriverWorkflowSettings,
  saveStoredDriverWorkflowSettings,
  DEFAULT_DRIVER_WORKFLOW_SETTINGS,
  getStoredAttendanceSettings,
  saveStoredAttendanceSettings,
  DEFAULT_ATTENDANCE_SETTINGS
} from './utils/categories';
import { 
  Driver, 
  ExpenseItem, 
  ActiveTab, 
  AuthSession, 
  AuthSettings, 
  AuditLogItem,
  EquipmentCategory,
  ExpenseCategoryConfig,
  SystemFeeSettings,
  DriverWorkflowSettings,
  AttendanceSettings,
  DriverAttendance,
  DriverSession,
  AttendanceShift,
  DriverShiftStatus,
  DriverLiveStatus,
  DriverRoutePoint
} from './types';
import { downloadCSV, formatDate, getTodayDateString } from './utils/formatters';
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
import { UniformInventoryView } from './components/UniformInventoryView';
import { CategoryManagementView } from './components/CategoryManagementView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { AdminLockScreen } from './components/AdminLockScreen';
import { DriverWorkflowManagementView } from './components/DriverWorkflowManagementView';
import { AttendanceSettingsManagementView } from './components/AttendanceSettingsManagementView';
import { DispatchDashboard } from './components/DispatchDashboard';
import { DriverPortalModal } from './components/DriverPortalModal';
import { Plus } from 'lucide-react';

export default function App() {
  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredDrivers());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => getStoredExpenses());
  const [attendanceList, setAttendanceList] = useState<DriverAttendance[]>([]);
  const [liveDriverStatuses, setLiveDriverStatuses] = useState<DriverLiveStatus[]>([]);
  const [driverSession, setDriverSession] = useState<DriverSession | null>(() => getStoredDriverSession());
  const [isDriverPortalOpen, setIsDriverPortalOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLogItem[]>(() => getStoredAuditLogs());
  const [equipmentCategories, setEquipmentCategories] = useState<EquipmentCategory[]>(() => getStoredEquipmentCategories());
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryConfig[]>(() => getStoredExpenseCategories());
  const [systemFeeSettings, setSystemFeeSettings] = useState<SystemFeeSettings>(() => getStoredFeeSettings());
  const [driverWorkflowSettings, setDriverWorkflowSettings] = useState<DriverWorkflowSettings>(() => getStoredDriverWorkflowSettings());
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>(() => getStoredAttendanceSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('drivers');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Auth & Session state
  const [adminUser, setAdminUser] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [authSettings, setAuthSettings] = useState<AuthSettings>(() => getAuthSettings());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
    // Probe database connectivity and initialize if empty
    testFirestoreConnection().then(res => {
      console.log('Firebase Firestore live connection status:', res);
      if (res.connected) {
        setIsCloudSynced(true);
      }
    }).catch(err => {
      console.warn('Firestore probe warning:', err);
    });

    // Initialize local data into an empty cloud database before subscribing.
    // Firestore is the canonical source after this bootstrap completes.
    const cloudInitPromise = initializeCloudDatabaseIfNeeded(getStoredDrivers(), getStoredExpenses());
    initializeDriverWorkflowIfNeeded();
    initializeAuthSettingsIfNeeded();
    initializeAttendanceSettingsIfNeeded();

    let unsubDrivers = () => {};
    let unsubExpenses = () => {};
    let isDisposed = false;

    void (async () => {
      const initialized = await cloudInitPromise;
      if (!initialized || isDisposed) return;

      // A snapshot, including an empty one after a deletion, always replaces
      // the local cache. This prevents another browser from restoring deleted data.
      unsubDrivers = subscribeCloudDrivers((cloudDrivers) => {
        setDrivers(cloudDrivers);
        saveStoredDrivers(cloudDrivers);
        setIsCloudSynced(true);
      });

      unsubExpenses = subscribeCloudExpenses((cloudExpenses) => {
        setExpenses(cloudExpenses);
        saveStoredExpenses(cloudExpenses);
        setIsCloudSynced(true);
      });
    })();

    // 3. Listen for system users & roles in real time
    const unsubAttendance = subscribeCloudAttendance((attendance) => {
      setAttendanceList(attendance);
    });

    const unsubLiveDrivers = subscribeCloudDriverLiveStatus((statuses) => {
      setLiveDriverStatuses(statuses);
    });

    // 4. Listen for system users & roles in real time
    const unsubUsers = subscribeCloudUsers((cloudUsers) => {
      saveSystemUsers(cloudUsers);
    });

    // 4. Listen for audit logs in real time
    const unsubLogs = subscribeCloudLogs((cloudLogs) => {
      setLogs(cloudLogs);
      saveStoredAuditLogs(cloudLogs);
    });

    // 5. Listen for equipment categories in real time
    const unsubEquip = subscribeCloudEquipmentCategories((cats) => {
      if (cats && cats.length > 0) {
        setEquipmentCategories(cats);
        saveStoredEquipmentCategories(cats);
      }
    });

    // 6. Listen for expense categories in real time
    const unsubExpCats = subscribeCloudExpenseCategories((cats) => {
      if (cats && cats.length > 0) {
        setExpenseCategories(cats);
        saveStoredExpenseCategories(cats);
      }
    });

    // 7. Listen for system fee settings in real time
    const unsubFee = subscribeCloudFeeSettings((fees) => {
      if (fees) {
        setSystemFeeSettings(fees);
        saveStoredFeeSettings(fees);
      }
    });

    const unsubWorkflow = subscribeCloudDriverWorkflow((workflow) => {
      setDriverWorkflowSettings(workflow);
      saveStoredDriverWorkflowSettings(workflow);
    });

    const unsubAuthSettings = subscribeCloudAuthSettings((settings) => {
      setAuthSettings(settings);
      saveAuthSettings(settings);
    });

    const unsubAttendanceSettings = subscribeCloudAttendanceSettings((settings) => {
      setAttendanceSettings(settings);
      saveStoredAttendanceSettings(settings);
    });

    return () => {
      isDisposed = true;
      unsubDrivers();
      unsubExpenses();
      unsubAttendance();
      unsubLiveDrivers();
      unsubUsers();
      unsubLogs();
      unsubEquip();
      unsubExpCats();
      unsubFee();
      unsubWorkflow();
      unsubAuthSettings();
      unsubAttendanceSettings();
    };
  }, []);

  // Sync data to local storage as offline cache
  useEffect(() => {
    saveStoredDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  // A remembered device session must still belong to an active, approved driver.
  useEffect(() => {
    if (!driverSession) return;
    const driver = drivers.find(item => item.id === driverSession.driverId);
    const expired = !driverSession.expiresAt || new Date(driverSession.expiresAt).getTime() <= Date.now();
    if (!driver || driver.isRevoked || driver.approvalStatus === 'pending' || expired) {
      setDriverSession(null);
      clearStoredDriverSession();
    }
  }, [driverSession, drivers]);

  useEffect(() => {
    saveStoredEquipmentCategories(equipmentCategories);
  }, [equipmentCategories]);

  useEffect(() => {
    saveStoredExpenseCategories(expenseCategories);
  }, [expenseCategories]);

  useEffect(() => {
    saveStoredFeeSettings(systemFeeSettings);
  }, [systemFeeSettings]);

  useEffect(() => {
    saveStoredDriverWorkflowSettings(driverWorkflowSettings);
  }, [driverWorkflowSettings]);

  useEffect(() => {
    saveStoredAttendanceSettings(attendanceSettings);
  }, [attendanceSettings]);

  // Keep logs refreshed
  const reloadLogs = () => {
    setLogs(getStoredAuditLogs());
  };

  const isSuperAdmin = adminUser?.role === 'super_admin';
  const isOperationsManager = adminUser?.role === 'manager';
  const canManageDriverOperations = isSuperAdmin || isOperationsManager;

  // Keep every role inside the modules it has been granted.
  useEffect(() => {
    if (adminUser && adminUser.role === 'staff' && activeTab !== 'attendance') {
      setActiveTab('attendance');
    }
    if (adminUser && adminUser.role === 'manager' && !['drivers', 'inventory', 'attendance'].includes(activeTab)) {
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

  const handleUpdateAuthSettings = async (settings: AuthSettings) => {
    setAuthSettings(settings);
    saveAuthSettings(settings);
    if (!(await saveAuthSettingsToCloud(settings))) {
      alert('Không thể lưu thiết lập bảo mật lên Cloud. Vui lòng thử lại khi có kết nối.');
    }
  };

  // Helper for admin-only restriction
  const requireSuperAdmin = (featureName: string): boolean => {
    if (!adminUser) {
      setLoginPromptMessage('Vui lòng đăng nhập Admin Tổng để tiếp tục.');
      setIsLoginModalOpen(true);
      return false;
    }
    if (adminUser.role !== 'super_admin') {
      alert(`Tính năng "${featureName}" chỉ dành cho tài khoản Admin Tổng. Quản lý tài xế chỉ được xem ai đang trong ca trực.`);
      return false;
    }
    return true;
  };

  const requireDriverOperationsManager = (featureName: string): boolean => {
    if (!adminUser) {
      setLoginPromptMessage('Vui lòng đăng nhập để tiếp tục.');
      setIsLoginModalOpen(true);
      return false;
    }
    if (!canManageDriverOperations) {
      alert(`Tính năng "${featureName}" dành cho Admin hoặc Quản lý vận hành. Quản lý ca trực chỉ được xem tài xế đang trong ca.`);
      return false;
    }
    return true;
  };

  // DRIVER ACTIONS (ADMIN + OPERATIONS MANAGER)
  const handleOpenNewDriver = () => {
    if (!requireDriverOperationsManager('Tạo hồ sơ tài xế')) return;
    setDriverToEdit(null);
    setIsDriverModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    if (!requireDriverOperationsManager('Chỉnh sửa hồ sơ tài xế')) return;
    setDriverToEdit(driver);
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = async (savedDriver: Driver) => {
    if (!requireDriverOperationsManager('Lưu hồ sơ tài xế')) return;
    const isNew = !drivers.some((d) => d.id === savedDriver.id);

    setDrivers((prev) => {
      if (!isNew) {
        return prev.map((d) => (d.id === savedDriver.id ? savedDriver : d));
      }
      return [savedDriver, ...prev];
    });

    // Save to Firestore Cloud
    const wasSavedToCloud = await saveDriverToCloud(savedDriver);
    if (!wasSavedToCloud) {
      setIsCloudSynced(false);
      alert('Không thể lưu dữ liệu lên Cloud. Dữ liệu hiện chỉ nằm trên máy này; vui lòng kiểm tra kết nối và thử lại.');
    } else {
      setIsCloudSynced(true);
    }

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

  const handleDeleteDriver = async (id: string) => {
    if (!requireDriverOperationsManager('Xóa hồ sơ tài xế')) return;
    const target = drivers.find(d => d.id === id);
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    
    // Delete from Firestore Cloud
    const deletedFromCloud = await deleteDriverFromCloud(id);
    if (!deletedFromCloud) {
      setIsCloudSynced(false);
      alert('Không thể xóa tài xế trên Cloud. Vui lòng thử lại khi có kết nối.');
    }

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
    if (!requireDriverOperationsManager('Phê duyệt tài xế')) return;
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

  const handleDriverLogin = (driver: Driver) => {
    const sessionDays = Math.min(300, Math.max(1, Math.round(authSettings.driverSessionDays || 7)));
    const session: DriverSession = {
      driverId: driver.id,
      phone: driver.phone,
      loggedInAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString(),
    };
    setDriverSession(session);
    saveStoredDriverSession(session, sessionDays);
  };

  const handleDriverLogout = () => {
    setDriverSession(null);
    clearStoredDriverSession();
  };

  const handleUpdateDriverLiveStatus = async (status: DriverLiveStatus) => {
    // Optimistic update keeps the map responsive while Firestore confirms it.
    setLiveDriverStatuses((previous) => [status, ...previous.filter(item => item.driverId !== status.driverId)]);
    if (!(await saveDriverLiveStatusToCloud(status))) {
      throw new Error('Không thể gửi trạng thái trực tuyến lên Cloud.');
    }
  };

  const handleStopDriverLocationSharing = async (driverId: string) => {
    const current = liveDriverStatuses.find(item => item.driverId === driverId);
    if (!current) return;
    await handleUpdateDriverLiveStatus({ ...current, isSharingLocation: false, lastSeenAt: new Date().toISOString() });
  };

  const handleSaveDriverRoutePoint = async (point: DriverRoutePoint) => {
    if (!(await saveDriverRoutePointToCloud(point))) {
      throw new Error('Không thể lưu hành trình lên Cloud.');
    }
  };

  const handleSaveAttendance = async (data: Omit<DriverAttendance, 'id' | 'updatedAt'>) => {
    const id = `attendance_${data.date}_${data.driverId}`;
    const existing = attendanceList.find(item => item.id === id);
    const attendance: DriverAttendance = {
      ...existing,
      ...data,
      id,
      checkInTime: data.checkInTime ?? existing?.checkInTime ?? (
        data.date === getTodayDateString() && (data.status === 'on_duty' || data.status === 'standby')
          ? new Date().toISOString()
          : undefined
      ),
      updatedAt: new Date().toISOString(),
    };
    setAttendanceList(prev => existing ? prev.map(item => item.id === id ? attendance : item) : [attendance, ...prev]);
    if (!(await saveAttendanceToCloud(attendance))) {
      alert('Không thể lưu điểm danh lên Cloud. Vui lòng kiểm tra kết nối rồi thử lại.');
      return;
    }
    addAuditLog('DRIVER_UPDATE', 'Cập nhật điểm danh', `${attendance.driverName} cập nhật trạng thái ${attendance.status} ngày ${attendance.date}.`, attendance.driverName, adminUser);
  };

  const handleSaveAttendanceBatch = async (items: Array<Omit<DriverAttendance, 'id' | 'updatedAt'>>) => {
    await Promise.all(items.map(item => handleSaveAttendance(item)));
  };

  const handleUpdateAttendanceStatus = async (attendance: DriverAttendance, status: DriverShiftStatus, note?: string) => {
    if (!canManageDriverOperations) return;
    await handleSaveAttendance({
      ...attendance,
      status,
      note: note ?? attendance.note,
      checkOutTime: status === 'off_duty' || status === 'emergency_leave' ? new Date().toISOString() : attendance.checkOutTime,
    });
  };

  const handleAdminCheckInDriver = async (driver: Driver, shift: AttendanceShift, status: DriverShiftStatus, zone?: string, note?: string) => {
    if (!canManageDriverOperations) return;
    const date = getTodayDateString();
    const zones = zone?.split(',').map(value => value.trim()).filter(Boolean) || [];
    await handleSaveAttendance({
      driverId: driver.id,
      driverCode: driver.code,
      driverName: driver.name,
      driverPhone: driver.phone,
      licensePlate: driver.licensePlate,
      workingType: driver.workingType || 'fulltime',
      date,
      shift,
      status,
      checkInTime: new Date().toISOString(),
      checkOutTime: status === 'off_duty' ? new Date().toISOString() : undefined,
      standbyZone: zones[0],
      standbyZones: zones,
      note,
    });
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

  const handleSaveExpense = async (savedExpense: ExpenseItem) => {
    const isNew = !expenses.some((e) => e.id === savedExpense.id);

    setExpenses((prev) => {
      if (!isNew) {
        return prev.map((e) => (e.id === savedExpense.id ? savedExpense : e));
      }
      return [savedExpense, ...prev];
    });

    // Save to Firestore Cloud
    const wasSavedToCloud = await saveExpenseToCloud(savedExpense);
    if (!wasSavedToCloud) {
      setIsCloudSynced(false);
      alert('Không thể lưu khoản chi lên Cloud. Dữ liệu hiện chỉ nằm trên máy này; vui lòng kiểm tra kết nối và thử lại.');
    } else {
      setIsCloudSynced(true);
    }

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

  const handleDeleteExpense = async (id: string) => {
    if (!requireSuperAdmin('Xóa khoản chi tiêu')) return;
    const target = expenses.find(e => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    // Delete from Firestore Cloud
    const deletedFromCloud = await deleteExpenseFromCloud(id);
    if (!deletedFromCloud) {
      setIsCloudSynced(false);
      alert('Không thể xóa khoản chi trên Cloud. Vui lòng thử lại khi có kết nối.');
    }

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

  // ==========================================
  // CATEGORIES & SYSTEM FEE SETTINGS HANDLERS
  // ==========================================
  const handleSaveEquipmentCategory = (cat: EquipmentCategory) => {
    setEquipmentCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id);
      let updated: EquipmentCategory[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = cat;
      } else {
        updated = [...prev, cat];
      }
      saveStoredEquipmentCategories(updated);
      saveEquipmentCategoryToCloud(cat);
      return updated;
    });

    addAuditLog(
      'INVENTORY_UPDATE',
      'Cập nhật danh mục trang bị',
      `${adminUser?.displayName || 'Admin'} đã lưu danh mục trang bị: "${cat.name}" (Mã: ${cat.code}, Cọc: ${cat.defaultDeposit.toLocaleString('vi-VN')}đ)`,
      cat.name,
      adminUser
    );
    reloadLogs();
  };

  const handleDeleteEquipmentCategory = (id: string) => {
    const target = equipmentCategories.find(c => c.id === id);
    setEquipmentCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveStoredEquipmentCategories(updated);
      deleteEquipmentCategoryFromCloud(id);
      return updated;
    });

    addAuditLog(
      'INVENTORY_UPDATE',
      'Xóa danh mục trang bị',
      `${adminUser?.displayName || 'Admin'} đã xóa danh mục trang bị: "${target?.name || id}"`,
      target?.name,
      adminUser
    );
    reloadLogs();
  };

  const handleSaveExpenseCategory = (cat: ExpenseCategoryConfig) => {
    setExpenseCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id);
      let updated: ExpenseCategoryConfig[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = cat;
      } else {
        updated = [...prev, cat];
      }
      saveStoredExpenseCategories(updated);
      saveExpenseCategoryToCloud(cat);
      return updated;
    });

    addAuditLog(
      'EXPENSE_UPDATE',
      'Cập nhật danh mục chi tiêu',
      `${adminUser?.displayName || 'Admin'} đã lưu danh mục chi: "${cat.name}" (Mã: ${cat.code})`,
      cat.name,
      adminUser
    );
    reloadLogs();
  };

  const handleDeleteExpenseCategory = (id: string) => {
    const target = expenseCategories.find(c => c.id === id);
    setExpenseCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveStoredExpenseCategories(updated);
      deleteExpenseCategoryFromCloud(id);
      return updated;
    });

    addAuditLog(
      'EXPENSE_DELETE',
      'Xóa danh mục chi tiêu',
      `${adminUser?.displayName || 'Admin'} đã xóa danh mục chi: "${target?.name || id}"`,
      target?.name,
      adminUser
    );
    reloadLogs();
  };

  const handleSaveFeeSettings = (settings: SystemFeeSettings) => {
    setSystemFeeSettings(settings);
    saveStoredFeeSettings(settings);
    saveFeeSettingsToCloud(settings);

    addAuditLog(
      'INVENTORY_UPDATE',
      'Cập nhật chính sách cọc & hoàn trả',
      `${adminUser?.displayName || 'Admin'} đã cập nhật chính sách cọc mặc định: ${settings.defaultUniformDeposit.toLocaleString('vi-VN')}đ, hoàn trả: ${settings.defaultRefundPercentage}%`,
      'Chính sách cọc',
      adminUser
    );
    reloadLogs();
  };

  const handleSaveDriverWorkflow = (settings: DriverWorkflowSettings) => {
    setDriverWorkflowSettings(settings);
    saveStoredDriverWorkflowSettings(settings);
    saveDriverWorkflowToCloud(settings);
    addAuditLog(
      'INVENTORY_UPDATE',
      'Cập nhật danh mục vận hành tài xế',
      `${adminUser?.displayName || 'Admin'} đã cập nhật các trạng thái quản lý tài xế.`,
      'Danh mục vận hành tài xế',
      adminUser
    );
    reloadLogs();
  };

  const handleSaveAttendanceSettings = async (settings: AttendanceSettings) => {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    setAttendanceSettings(updated);
    saveStoredAttendanceSettings(updated);
    if (!(await saveAttendanceSettingsToCloud(updated))) {
      alert('Không thể lưu danh mục ca trực và khu vực lên Cloud. Vui lòng thử lại.');
      return;
    }
    addAuditLog('INVENTORY_UPDATE', 'Cập nhật danh mục điểm danh', 'Đã cập nhật khung giờ ca trực và trạm/khu vực trực.', 'Danh mục điểm danh', adminUser);
    reloadLogs();
  };

  const handleResetCategoriesToDefaults = () => {
    setEquipmentCategories(DEFAULT_EQUIPMENT_CATEGORIES);
    saveStoredEquipmentCategories(DEFAULT_EQUIPMENT_CATEGORIES);
    DEFAULT_EQUIPMENT_CATEGORIES.forEach(c => saveEquipmentCategoryToCloud(c));

    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    saveStoredExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    DEFAULT_EXPENSE_CATEGORIES.forEach(c => saveExpenseCategoryToCloud(c));

    setSystemFeeSettings(DEFAULT_SYSTEM_FEE_SETTINGS);
    saveStoredFeeSettings(DEFAULT_SYSTEM_FEE_SETTINGS);
    saveFeeSettingsToCloud(DEFAULT_SYSTEM_FEE_SETTINGS);

    setDriverWorkflowSettings(DEFAULT_DRIVER_WORKFLOW_SETTINGS);
    saveStoredDriverWorkflowSettings(DEFAULT_DRIVER_WORKFLOW_SETTINGS);
    saveDriverWorkflowToCloud(DEFAULT_DRIVER_WORKFLOW_SETTINGS);

    setAttendanceSettings(DEFAULT_ATTENDANCE_SETTINGS);
    saveStoredAttendanceSettings(DEFAULT_ATTENDANCE_SETTINGS);
    saveAttendanceSettingsToCloud(DEFAULT_ATTENDANCE_SETTINGS);

    addAuditLog(
      'BACKUP_RESTORE',
      'Khôi phục danh mục & chi phí chuẩn',
      `${adminUser?.displayName || 'Admin'} đã khôi phục toàn bộ danh mục trang bị, danh mục chi tiêu và chính sách cọc về mặc định ban đầu`,
      'Cấu hình danh mục',
      adminUser
    );
    reloadLogs();
  };

  // MANDATORY LOGIN
  if (!adminUser) {
    return (
      <>
        <AdminLockScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenDriverCheckin={() => setIsDriverPortalOpen(true)}
        />
        <DriverPortalModal
          isOpen={isDriverPortalOpen}
          onClose={() => setIsDriverPortalOpen(false)}
          drivers={drivers}
          currentDriverSession={driverSession}
          onDriverLogin={handleDriverLogin}
          onDriverLogout={handleDriverLogout}
          todayAttendanceList={attendanceList}
          attendanceSettings={attendanceSettings}
          onSubmitAttendance={handleSaveAttendanceBatch}
          liveStatus={liveDriverStatuses.find(item => item.driverId === driverSession?.driverId) || null}
          onUpdateLiveStatus={handleUpdateDriverLiveStatus}
          onStopLocationSharing={handleStopDriverLocationSharing}
          onSaveRoutePoint={handleSaveDriverRoutePoint}
          liveDriverStatuses={liveDriverStatuses}
        />
      </>
    );
  }

  const revokedCount = drivers.filter((d) => d.isRevoked).length;
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        driverCount={drivers.length}
        expenseCount={expenses.length}
        revokedCount={revokedCount}
        logCount={logs.length}
        adminUser={adminUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLockApp={handleLockApp}
        onOpenDriverModal={handleOpenNewDriver}
        onOpenExpenseModal={handleOpenNewExpense}
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
            Dữ liệu trên máy tính, điện thoại, máy khác luôn tự động đồng bộ
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mobile-safe-bottom max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 pb-24 sm:pb-10">
        
        {/* KPI Dashboard Cards (Only show on Drivers, Inventory, Expenses, or Summary tab) */}
        {isSuperAdmin && (activeTab === 'drivers' || activeTab === 'attendance' || activeTab === 'inventory' || activeTab === 'expenses' || activeTab === 'summary') && (
          <StatsCards drivers={drivers} expenses={expenses} />
        )}

        {/* Tab 1: Driver List (Admin + Operations Manager) */}
        {activeTab === 'drivers' && canManageDriverOperations && (
          <DriverList
            drivers={drivers}
            onEditDriver={handleEditDriver}
            onDeleteDriver={handleDeleteDriver}
            onViewDriver={handleViewDriver}
            onAddNewDriver={handleOpenNewDriver}
            onApproveDriver={handleApproveDriver}
            driverWorkflowSettings={driverWorkflowSettings}
          />
        )}

        {activeTab === 'attendance' && (
          <DispatchDashboard
            drivers={drivers}
            attendanceList={attendanceList}
            attendanceSettings={attendanceSettings}
            liveDriverStatuses={liveDriverStatuses}
            onOpenDriverPortal={() => setIsDriverPortalOpen(true)}
            onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
            onAdminCheckInDriver={handleAdminCheckInDriver}
            readOnly={!canManageDriverOperations}
          />
        )}

        {/* Tab 2: Uniform Stock & Size Breakdown (Admin + Operations Manager) */}
        {activeTab === 'inventory' && canManageDriverOperations && (
          <UniformInventoryView
            drivers={drivers}
            expenses={expenses}
            onSelectDriver={handleViewDriver}
            onOpenNewExpense={isSuperAdmin ? handleOpenNewExpense : undefined}
            onOpenNewDriver={handleOpenNewDriver}
          />
        )}

        {/* Tab 3: Internal Expenses & Bill Receipts (Super Admin Only) */}
        {activeTab === 'expenses' && isSuperAdmin && (
          <ExpenseList
            expenses={expenses}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddNewExpense={handleOpenNewExpense}
            onViewImage={(url, title) => setPreviewImage({ url, title })}
          />
        )}

        {/* Tab 4: Summary & Cash Flow Insights (Super Admin Only) */}
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

        {/* Tab 5: Audit Logs (Super Admin Only) */}
        {activeTab === 'logs' && isSuperAdmin && (
          <AuditLogView
            logs={logs}
            currentUser={adminUser}
            onRefreshLogs={reloadLogs}
          />
        )}

        {/* Tab 6: Subordinate Accounts & Role Management (Super Admin Only) */}
        {activeTab === 'users' && isSuperAdmin && (
          <UserManagementView
            currentUser={adminUser}
            onRefreshSession={() => {
              const updated = getStoredAuthSession();
              if (updated) setAdminUser(updated);
            }}
          />
        )}

        {/* Tab 7: Category & Fee Custom Management (Super Admin Only) */}
        {activeTab === 'settings' && isSuperAdmin && (
          <div className="space-y-6">
          <DriverWorkflowManagementView
            settings={driverWorkflowSettings}
            onSave={handleSaveDriverWorkflow}
          />
          <AttendanceSettingsManagementView
            settings={attendanceSettings}
            onSave={handleSaveAttendanceSettings}
          />
          <CategoryManagementView
            equipmentCategories={equipmentCategories}
            expenseCategories={expenseCategories}
            systemFeeSettings={systemFeeSettings}
            adminUser={adminUser}
            onSaveEquipmentCategory={handleSaveEquipmentCategory}
            onDeleteEquipmentCategory={handleDeleteEquipmentCategory}
            onSaveExpenseCategory={handleSaveExpenseCategory}
            onDeleteExpenseCategory={handleDeleteExpenseCategory}
            onSaveFeeSettings={handleSaveFeeSettings}
            onResetToDefaults={handleResetCategoriesToDefaults}
          />
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-[70px] right-4 z-30">
        {activeTab === 'drivers' && canManageDriverOperations && (
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
          onUpdateAuthSettings={handleUpdateAuthSettings}
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
        equipmentCategories={equipmentCategories}
        systemFeeSettings={systemFeeSettings}
        driverWorkflowSettings={driverWorkflowSettings}
      />

      <DriverPortalModal
        isOpen={isDriverPortalOpen}
        onClose={() => setIsDriverPortalOpen(false)}
        drivers={drivers}
        currentDriverSession={driverSession}
        onDriverLogin={handleDriverLogin}
        onDriverLogout={handleDriverLogout}
        todayAttendanceList={attendanceList}
        attendanceSettings={attendanceSettings}
        onSubmitAttendance={handleSaveAttendanceBatch}
        liveStatus={liveDriverStatuses.find(item => item.driverId === driverSession?.driverId) || null}
        onUpdateLiveStatus={handleUpdateDriverLiveStatus}
        onStopLocationSharing={handleStopDriverLocationSharing}
        onSaveRoutePoint={handleSaveDriverRoutePoint}
        liveDriverStatuses={liveDriverStatuses}
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
        expenseCategories={expenseCategories}
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

    </div>
  );
}
