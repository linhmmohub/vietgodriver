import React, { useState, useEffect } from 'react';
import { 
  getStoredDrivers, 
  saveStoredDrivers, 
  getStoredExpenses, 
  saveStoredExpenses 
} from './utils/storage';
import { 
  getStoredAuthSession, 
  saveStoredAuthSession, 
  logoutActiveUser,
  getStoredAuditLogs,
  addAuditLog,
  getAuthSettings,
  saveAuthSettings
} from './utils/auth';
import { Driver, ExpenseItem, ActiveTab, AuthSession, AuthSettings, AuditLogItem } from './types';
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
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { AdminLockScreen } from './components/AdminLockScreen';
import { Plus } from 'lucide-react';

export default function App() {
  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredDrivers());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => getStoredExpenses());
  const [logs, setLogs] = useState<AuditLogItem[]>(() => getStoredAuditLogs());
  const [activeTab, setActiveTab] = useState<ActiveTab>('drivers');

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

  // Sync data to local storage
  useEffect(() => {
    saveStoredDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  // Keep logs refreshed
  const reloadLogs = () => {
    setLogs(getStoredAuditLogs());
  };

  // Restrict staff tab access: Subordinates can ONLY access 'drivers'
  useEffect(() => {
    if (adminUser && adminUser.role === 'staff' && activeTab !== 'drivers') {
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-10">
        
        {/* KPI Dashboard Cards (Only show on Drivers, Expenses, or Summary tab) */}
        {(activeTab === 'drivers' || activeTab === 'expenses' || activeTab === 'summary') && (
          <StatsCards drivers={drivers} expenses={expenses} />
        )}

        {/* Tab 1: Driver List (Available to both Super Admin and Subordinates) */}
        {activeTab === 'drivers' && (
          <DriverList
            drivers={drivers}
            onEditDriver={handleEditDriver}
            onDeleteDriver={handleDeleteDriver}
            onViewDriver={handleViewDriver}
            onAddNewDriver={handleOpenNewDriver}
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
      <div className="sm:hidden fixed bottom-5 right-4 z-30">
        {activeTab === 'drivers' && (
          <button
            onClick={handleOpenNewDriver}
            className="h-14 w-14 rounded-full bg-amber-500 text-slate-950 shadow-xl flex items-center justify-center font-bold active:scale-90 transition"
            aria-label="Thêm tài xế mới"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}
        {activeTab === 'expenses' && isSuperAdmin && (
          <button
            onClick={handleOpenNewExpense}
            className="h-14 w-14 rounded-full bg-emerald-500 text-slate-950 shadow-xl flex items-center justify-center font-bold active:scale-90 transition"
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

    </div>
  );
}
