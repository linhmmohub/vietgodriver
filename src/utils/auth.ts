import { SystemUser, AuthSession, UserRole, AuditLogItem, AuditActionType, AuthSettings } from '../types';
import { saveUserToCloud, deleteUserFromCloud, addLogToCloud } from '../services/firestoreSync';

const SYSTEM_USERS_KEY = 'uniform_system_users_v2';
const AUTH_SESSION_KEY = 'uniform_auth_session_v2';
const AUDIT_LOGS_KEY = 'uniform_audit_logs_v1';
const AUTH_SETTINGS_KEY = 'uniform_auth_settings_v2';

export const DEFAULT_SUPER_ADMIN: SystemUser = {
  id: 'usr-admin-root',
  username: 'admin',
  displayName: 'Admin Tổng (Toàn quyền)',
  role: 'super_admin',
  passwordHash: btoa('admin123'),
  isActive: true,
  notes: 'Tài khoản quản trị viên tối cao, toàn quyền hệ thống và phân quyền.',
  createdAt: new Date('2025-01-01').toISOString(),
};

export const DEFAULT_STAFF_USER: SystemUser = {
  id: 'usr-staff-driver',
  username: 'nhanvien',
  displayName: 'Nhân Viên Điều Hành (Cấp dưới)',
  role: 'staff',
  passwordHash: btoa('nv123'),
  isActive: true,
  notes: 'Tài khoản cấp dưới: Chỉ được xem và thao tác hồ sơ tài xế & cấp phát đồng phục.',
  createdAt: new Date('2025-01-02').toISOString(),
};

export const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  requireLoginToView: true,
  allowDemoQuickLogin: true,
};

// USER STORAGE
export function getSystemUsers(): SystemUser[] {
  try {
    const raw = localStorage.getItem(SYSTEM_USERS_KEY);
    if (!raw) {
      const initialUsers = [DEFAULT_SUPER_ADMIN, DEFAULT_STAFF_USER];
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    const parsed = JSON.parse(raw) as SystemUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [DEFAULT_SUPER_ADMIN, DEFAULT_STAFF_USER];
    }
    const hasAdmin = parsed.some(u => u.role === 'super_admin');
    if (!hasAdmin) {
      parsed.unshift(DEFAULT_SUPER_ADMIN);
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Error loading system users:', e);
    return [DEFAULT_SUPER_ADMIN, DEFAULT_STAFF_USER];
  }
}

export function saveSystemUsers(users: SystemUser[]): void {
  try {
    localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving system users:', e);
  }
}

// SESSION STORAGE
export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch (e) {
    console.error('Error reading auth session:', e);
    return null;
  }
}

export function saveStoredAuthSession(session: AuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error saving auth session:', e);
  }
}

// AUTH SETTINGS
export function getAuthSettings(): AuthSettings {
  try {
    const raw = localStorage.getItem(AUTH_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(DEFAULT_AUTH_SETTINGS));
      return DEFAULT_AUTH_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_AUTH_SETTINGS;
  }
}

export function saveAuthSettings(settings: AuthSettings): void {
  try {
    localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving auth settings:', e);
  }
}

// AUDIT LOGS STORAGE & DISPATCH
export function getStoredAuditLogs(): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading audit logs:', e);
    return [];
  }
}

export function saveStoredAuditLogs(logs: AuditLogItem[]): void {
  try {
    const trimmed = logs.slice(0, 600);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving audit logs:', e);
  }
}

export function addAuditLog(
  actionType: AuditActionType,
  actionLabel: string,
  description: string,
  targetName?: string,
  userOverride?: AuthSession | null
): AuditLogItem {
  const currentUser = userOverride !== undefined ? userOverride : getStoredAuthSession();
  
  const newLog: AuditLogItem = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    username: currentUser ? currentUser.username : 'he_thong',
    displayName: currentUser ? currentUser.displayName : 'Hệ Thống Tự Động',
    role: currentUser ? currentUser.role : 'super_admin',
    actionType,
    actionLabel,
    description,
    targetName,
  };

  try {
    const currentLogs = getStoredAuditLogs();
    const updated = [newLog, ...currentLogs];
    saveStoredAuditLogs(updated);
    // Also save directly to Cloud Firestore
    addLogToCloud(newLog).catch(console.error);
  } catch (err) {
    console.error('Error logging audit event:', err);
  }

  return newLog;
}

// LOGIN & LOGOUT
export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; session?: AuthSession; error?: string } {
  const trimmedUser = usernameInput.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  if (!trimmedUser || !trimmedPass) {
    return { success: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' };
  }

  const users = getSystemUsers();
  const foundUser = users.find(u => u.username.toLowerCase() === trimmedUser);

  if (!foundUser) {
    return { success: false, error: 'Tài khoản không tồn tại trên hệ thống!' };
  }

  if (!foundUser.isActive) {
    return { success: false, error: 'Tài khoản này đã bị tạm khóa. Vui lòng liên hệ Admin Tổng!' };
  }

  const hashInput = btoa(trimmedPass);
  if (hashInput !== foundUser.passwordHash) {
    return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại!' };
  }

  const now = new Date().toISOString();
  foundUser.lastLogin = now;
  saveSystemUsers(users);
  saveUserToCloud(foundUser).catch(console.error);

  const session: AuthSession = {
    id: foundUser.id,
    username: foundUser.username,
    displayName: foundUser.displayName,
    role: foundUser.role,
    lastLogin: now,
  };

  saveStoredAuthSession(session);

  addAuditLog(
    'LOGIN',
    foundUser.role === 'super_admin' ? 'Admin Tổng đăng nhập' : 'Cấp dưới đăng nhập',
    `${foundUser.displayName} (${foundUser.username}) đăng nhập thành công vào hệ thống. Quyền: ${foundUser.role === 'super_admin' ? 'Admin Tổng (Toàn quyền)' : 'Cấp dưới (Chỉ mục Tài xế)'}`,
    foundUser.username,
    session
  );

  return { success: true, session };
}

export function logoutActiveUser(): void {
  const session = getStoredAuthSession();
  if (session) {
    addAuditLog(
      'LOGOUT',
      'Đăng xuất khỏi hệ thống',
      `${session.displayName} (${session.username}) đã đăng xuất khỏi phiên làm việc.`,
      session.username,
      session
    );
  }
  saveStoredAuthSession(null);
}

// USER CRUD (SUPER ADMIN ONLY)
export function createSubordinateUser(
  currentUser: AuthSession,
  data: {
    username: string;
    password: string;
    displayName: string;
    role: UserRole;
    notes?: string;
  }
): { success: boolean; error?: string; newUser?: SystemUser } {
  if (currentUser.role !== 'super_admin') {
    return { success: false, error: 'Chỉ có Admin Tổng mới có quyền tạo tài khoản cấp dưới!' };
  }

  const username = data.username.trim().toLowerCase();
  if (!username || username.length < 3) {
    return { success: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự (không dấu, viết liền)!' };
  }

  if (!data.password || data.password.trim().length < 4) {
    return { success: false, error: 'Mật khẩu phải có tối thiểu 4 ký tự!' };
  }

  const users = getSystemUsers();
  if (users.some(u => u.username.toLowerCase() === username)) {
    return { success: false, error: `Tài khoản "${username}" đã tồn tại trên hệ thống!` };
  }

  const newUser: SystemUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    username,
    displayName: data.displayName.trim() || username,
    role: data.role,
    passwordHash: btoa(data.password.trim()),
    isActive: true,
    notes: data.notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveSystemUsers(updatedUsers);
  saveUserToCloud(newUser).catch(console.error);

  addAuditLog(
    'USER_CREATE',
    'Tạo tài khoản cấp dưới',
    `Admin Tổng tạo tài khoản mới: ${newUser.displayName} (${newUser.username}) - Quyền: ${newUser.role === 'super_admin' ? 'Admin Tổng' : 'Cấp dưới (Chỉ mục Tài xế)'}`,
    newUser.username,
    currentUser
  );

  return { success: true, newUser };
}

export function updateSubordinateUser(
  currentUser: AuthSession,
  userId: string,
  data: {
    displayName?: string;
    newPassword?: string;
    role?: UserRole;
    notes?: string;
    isActive?: boolean;
  }
): { success: boolean; error?: string } {
  if (currentUser.role !== 'super_admin' && currentUser.id !== userId) {
    return { success: false, error: 'Bạn không có quyền chỉnh sửa tài khoản này!' };
  }

  const users = getSystemUsers();
  const targetIndex = users.findIndex(u => u.id === userId);
  if (targetIndex === -1) {
    return { success: false, error: 'Không tìm thấy tài khoản!' };
  }

  const target = users[targetIndex];

  if (target.role === 'super_admin' && data.role === 'staff') {
    const adminCount = users.filter(u => u.role === 'super_admin').length;
    if (adminCount <= 1) {
      return { success: false, error: 'Hệ thống phải có ít nhất 1 tài khoản Admin Tổng!' };
    }
  }

  if (data.displayName !== undefined) target.displayName = data.displayName.trim();
  if (data.newPassword && data.newPassword.trim().length >= 4) {
    target.passwordHash = btoa(data.newPassword.trim());
  }
  if (data.role !== undefined && currentUser.role === 'super_admin') {
    target.role = data.role;
  }
  if (data.notes !== undefined) target.notes = data.notes;
  if (data.isActive !== undefined && currentUser.role === 'super_admin') {
    target.isActive = data.isActive;
  }

  saveSystemUsers(users);
  saveUserToCloud(target).catch(console.error);

  if (currentUser.id === userId && data.displayName) {
    const updatedSession = { ...currentUser, displayName: data.displayName };
    saveStoredAuthSession(updatedSession);
  }

  addAuditLog(
    'USER_UPDATE',
    'Cập nhật tài khoản',
    `Cập nhật thông tin tài khoản ${target.displayName} (${target.username}) ${data.newPassword ? '[Đã đổi mật khẩu]' : ''} ${data.isActive !== undefined ? `[Trạng thái: ${target.isActive ? 'Hoạt động' : 'Đã khóa'}]` : ''}`,
    target.username,
    currentUser
  );

  return { success: true };
}

export function deleteSubordinateUser(
  currentUser: AuthSession,
  userId: string
): { success: boolean; error?: string } {
  if (currentUser.role !== 'super_admin') {
    return { success: false, error: 'Chỉ có Admin Tổng mới có quyền xóa tài khoản!' };
  }

  const users = getSystemUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, error: 'Không tìm thấy tài khoản để xóa!' };
  }

  if (target.id === currentUser.id || target.username === 'admin') {
    return { success: false, error: 'Không thể xóa tài khoản Admin Tổng đang đăng nhập!' };
  }

  const updatedUsers = users.filter(u => u.id !== userId);
  saveSystemUsers(updatedUsers);
  deleteUserFromCloud(userId).catch(console.error);

  addAuditLog(
    'USER_DELETE',
    'Xóa tài khoản',
    `Admin Tổng xóa tài khoản cấp dưới: ${target.displayName} (${target.username})`,
    target.username,
    currentUser
  );

  return { success: true };
}

export function clearAllAuditLogs(currentUser: AuthSession): { success: boolean; error?: string } {
  if (currentUser.role !== 'super_admin') {
    return { success: false, error: 'Chỉ Admin Tổng mới có quyền xóa nhật ký!' };
  }

  saveStoredAuditLogs([]);
  addAuditLog(
    'BACKUP_RESTORE',
    'Dọn dẹp nhật ký hệ thống',
    'Admin Tổng đã làm sạch toàn bộ dữ liệu nhật ký thao tác trước đó.',
    undefined,
    currentUser
  );
  return { success: true };
}
