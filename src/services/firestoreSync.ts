import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDoc,
  getDocFromServer,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Driver, 
  ExpenseItem, 
  SystemUser, 
  AuditLogItem, 
  EquipmentCategory, 
  ExpenseCategoryConfig, 
  SystemFeeSettings,
  AuthSettings,
  DriverAttendance,
  DriverAttendanceEvent,
  AttendanceSettings,
  DriverLiveStatus,
  DriverRoutePoint
} from '../types';
import { DEFAULT_SUPER_ADMIN, DEFAULT_STAFF_USER, DEFAULT_AUTH_SETTINGS } from '../utils/auth';
import { 
  DEFAULT_EQUIPMENT_CATEGORIES, 
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_SYSTEM_FEE_SETTINGS,
  DEFAULT_DRIVER_WORKFLOW_SETTINGS,
  DEFAULT_ATTENDANCE_SETTINGS
} from '../utils/categories';

// Collection references
const DRIVERS_COLLECTION = 'drivers';
const EXPENSES_COLLECTION = 'expenses';
const ATTENDANCE_COLLECTION = 'driver_attendance';
const ATTENDANCE_EVENTS_COLLECTION = 'driver_attendance_events';
const DRIVER_LIVE_STATUS_COLLECTION = 'driver_live_status';
const DRIVER_LIVE_ROUTES_COLLECTION = 'driver_live_routes';
const USERS_COLLECTION = 'system_users';
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const EQUIPMENT_COLLECTION = 'equipment_categories';
const EXPENSE_CATEGORIES_COLLECTION = 'expense_categories';
const SETTINGS_COLLECTION = 'system_settings';
const FEE_SETTINGS_DOC = 'fee_policy';
const DRIVER_WORKFLOW_DOC = 'driver_workflow';
const AUTH_SETTINGS_DOC = 'auth_policy';
const ATTENDANCE_SETTINGS_DOC = 'attendance_configuration';
const META_DOC_COLLECTION = 'system_meta';
const META_DOC_ID = 'state';

/**
 * Test real live server connection to Firestore
 */
export async function testFirestoreConnection(): Promise<{ 
  connected: boolean; 
  latencyMs: number; 
  driversCount: number;
  expensesCount: number;
  error?: string 
}> {
  const start = performance.now();
  try {
    // 1. Probe database with getDocFromServer
    await getDocFromServer(doc(db, META_DOC_COLLECTION, META_DOC_ID));
    
    // 2. Check counts
    const driversSnap = await getDocs(collection(db, DRIVERS_COLLECTION));
    const expSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
    const latencyMs = Math.round(performance.now() - start);

    return {
      connected: true,
      latencyMs,
      driversCount: driversSnap.size,
      expensesCount: expSnap.size,
    };
  } catch (error: any) {
    console.warn('Firestore server probe notice:', error);
    try {
      // Fallback check
      const driversSnap = await getDocs(collection(db, DRIVERS_COLLECTION));
      const expSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
      const latencyMs = Math.round(performance.now() - start);
      return {
        connected: true,
        latencyMs,
        driversCount: driversSnap.size,
        expensesCount: expSnap.size,
      };
    } catch (fallbackError: any) {
      return {
        connected: false,
        latencyMs: Math.round(performance.now() - start),
        driversCount: 0,
        expensesCount: 0,
        error: fallbackError?.message || String(fallbackError),
      };
    }
  }
}

/**
 * Check and initialize cloud data if the Firestore database is completely fresh
 */
export async function initializeCloudDatabaseIfNeeded(
  initialDrivers: Driver[] = [],
  initialExpenses: ExpenseItem[] = []
): Promise<boolean> {
  try {
    const metaRef = doc(db, META_DOC_COLLECTION, META_DOC_ID);
    const metaSnap = await getDoc(metaRef);

    // A database may have been initialized before this browser had local data.
    // In that case the old meta-only check prevented the first local dataset
    // from ever reaching Firestore. Seed only empty collections, never replace
    // cloud data that already exists.
    const [existingDrivers, existingExpenses] = await Promise.all([
      getDocs(collection(db, DRIVERS_COLLECTION)),
      getDocs(collection(db, EXPENSES_COLLECTION)),
    ]);
    const localMigrationCompleted = Boolean(metaSnap.data()?.localDataMigrationCompletedAt);
    if (!localMigrationCompleted && existingDrivers.empty && initialDrivers.length > 0) {
      await Promise.all(initialDrivers.map((driver) => setDoc(
        doc(db, DRIVERS_COLLECTION, driver.id),
        { ...driver, approvalStatus: driver.approvalStatus || 'approved', updatedAt: driver.updatedAt || new Date().toISOString() }
      )));
    }
    if (!localMigrationCompleted && existingExpenses.empty && initialExpenses.length > 0) {
      await Promise.all(initialExpenses.map((expense) => setDoc(doc(db, EXPENSES_COLLECTION, expense.id), expense)));
    }

    if (!metaSnap.exists()) {
      // First time initialization in Cloud Firestore!
      // Check if drivers collection has anything
      const driversSnap = await getDocs(collection(db, DRIVERS_COLLECTION));
      if (driversSnap.empty && initialDrivers.length > 0) {
        // Seed initial drivers
        for (const driver of initialDrivers) {
          const normalized: Driver = {
            ...driver,
            approvalStatus: driver.approvalStatus || 'approved',
            updatedAt: driver.updatedAt || new Date().toISOString()
          };
          await setDoc(doc(db, DRIVERS_COLLECTION, driver.id), normalized);
        }
      }

      // Check if expenses has anything
      const expSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
      if (expSnap.empty && initialExpenses.length > 0) {
        for (const exp of initialExpenses) {
          await setDoc(doc(db, EXPENSES_COLLECTION, exp.id), exp);
        }
      }

      // Seed default users if empty
      const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
      if (usersSnap.empty) {
        await setDoc(doc(db, USERS_COLLECTION, DEFAULT_SUPER_ADMIN.id), DEFAULT_SUPER_ADMIN);
        await setDoc(doc(db, USERS_COLLECTION, DEFAULT_STAFF_USER.id), DEFAULT_STAFF_USER);
      }

      // Seed equipment categories if empty
      const equipSnap = await getDocs(collection(db, EQUIPMENT_COLLECTION));
      if (equipSnap.empty) {
        for (const eq of DEFAULT_EQUIPMENT_CATEGORIES) {
          await setDoc(doc(db, EQUIPMENT_COLLECTION, eq.id), eq);
        }
      }

      // Seed expense categories if empty
      const expCatSnap = await getDocs(collection(db, EXPENSE_CATEGORIES_COLLECTION));
      if (expCatSnap.empty) {
        for (const ec of DEFAULT_EXPENSE_CATEGORIES) {
          await setDoc(doc(db, EXPENSE_CATEGORIES_COLLECTION, ec.id), ec);
        }
      }

      // Seed fee settings if empty
      const feeSnap = await getDoc(doc(db, SETTINGS_COLLECTION, FEE_SETTINGS_DOC));
      if (!feeSnap.exists()) {
        await setDoc(doc(db, SETTINGS_COLLECTION, FEE_SETTINGS_DOC), DEFAULT_SYSTEM_FEE_SETTINGS);
      }

      const workflowSnap = await getDoc(doc(db, SETTINGS_COLLECTION, DRIVER_WORKFLOW_DOC));
      if (!workflowSnap.exists()) {
        await setDoc(doc(db, SETTINGS_COLLECTION, DRIVER_WORKFLOW_DOC), DEFAULT_DRIVER_WORKFLOW_SETTINGS);
      }

      const authSettingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, AUTH_SETTINGS_DOC));
      if (!authSettingsSnap.exists()) {
        await setDoc(doc(db, SETTINGS_COLLECTION, AUTH_SETTINGS_DOC), DEFAULT_AUTH_SETTINGS);
      }

      const attendanceSettingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, ATTENDANCE_SETTINGS_DOC));
      if (!attendanceSettingsSnap.exists()) {
        await setDoc(doc(db, SETTINGS_COLLECTION, ATTENDANCE_SETTINGS_DOC), DEFAULT_ATTENDANCE_SETTINGS);
      }

    }

    // Browser-only data is migrated at most once. Afterwards, an empty
    // collection is intentional and must not resurrect stale local records.
    await setDoc(metaRef, {
      initialized: true,
      createdAt: metaSnap.data()?.createdAt || new Date().toISOString(),
      localDataMigrationCompletedAt: metaSnap.data()?.localDataMigrationCompletedAt || new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error initializing cloud database:', error);
    return false;
  }
}

// Supports existing databases created before driver workflow settings were introduced.
export async function initializeDriverWorkflowIfNeeded() {
  try {
    const workflowRef = doc(db, SETTINGS_COLLECTION, DRIVER_WORKFLOW_DOC);
    if (!(await getDoc(workflowRef)).exists()) {
      await setDoc(workflowRef, DEFAULT_DRIVER_WORKFLOW_SETTINGS);
    }
  } catch (error) {
    console.error('Error initializing driver workflow settings:', error);
  }
}

export async function initializeAuthSettingsIfNeeded() {
  try {
    const authRef = doc(db, SETTINGS_COLLECTION, AUTH_SETTINGS_DOC);
    if (!(await getDoc(authRef)).exists()) await setDoc(authRef, DEFAULT_AUTH_SETTINGS);
  } catch (error) {
    console.error('Error initializing auth settings:', error);
  }
}

export async function initializeAttendanceSettingsIfNeeded() {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, ATTENDANCE_SETTINGS_DOC);
    if (!(await getDoc(settingsRef)).exists()) await setDoc(settingsRef, DEFAULT_ATTENDANCE_SETTINGS);
  } catch (error) {
    console.error('Error initializing attendance settings:', error);
  }
}

// -------------------------------------------------------------
// REAL-TIME LISTENERS (Đồng bộ tức thì mọi máy khi có thay đổi)
// -------------------------------------------------------------

export function subscribeCloudDrivers(callback: (drivers: Driver[]) => void) {
  const colRef = collection(db, DRIVERS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: Driver[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Driver;
      const normalized: Driver = {
        ...data,
        id: docSnap.id,
        approvalStatus: data.approvalStatus || 'approved',
      };
      list.push(normalized);
    });
    // Sort by updatedAt descending
    list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    callback(list);
  }, (error) => {
    console.error('Cloud drivers sync error:', error);
  });
}

export function subscribeCloudExpenses(callback: (expenses: ExpenseItem[]) => void) {
  const colRef = collection(db, EXPENSES_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: ExpenseItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ExpenseItem;
      list.push({ ...data, id: docSnap.id });
    });
    // Sort by date descending
    list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    callback(list);
  }, (error) => {
    console.error('Cloud expenses sync error:', error);
  });
}

export function subscribeCloudAttendance(callback: (attendance: DriverAttendance[]) => void) {
  return onSnapshot(collection(db, ATTENDANCE_COLLECTION), (snapshot) => {
    const list = snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as DriverAttendance));
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    callback(list);
  }, (error) => console.error('Cloud attendance sync error:', error));
}

export function subscribeCloudAttendanceEvents(callback: (events: DriverAttendanceEvent[]) => void) {
  return onSnapshot(collection(db, ATTENDANCE_EVENTS_COLLECTION), (snapshot) => {
    const list = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as DriverAttendanceEvent));
    list.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    callback(list);
  }, (error) => console.error('Cloud attendance-event sync error:', error));
}

/** Live presence is intentionally a separate collection from attendance. */
export function subscribeCloudDriverLiveStatus(callback: (statuses: DriverLiveStatus[]) => void) {
  return onSnapshot(collection(db, DRIVER_LIVE_STATUS_COLLECTION), (snapshot) => {
    const list = snapshot.docs.map((docSnap) => ({ ...docSnap.data(), driverId: docSnap.id } as DriverLiveStatus));
    list.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
    callback(list);
  }, (error) => console.error('Cloud live-driver sync error:', error));
}

/** Subscribes to one driver's route for a day; route points stay partitioned by date. */
export function subscribeCloudDriverRoute(driverId: string, date: string, callback: (points: DriverRoutePoint[]) => void) {
  const routeRef = collection(db, DRIVER_LIVE_ROUTES_COLLECTION, driverId, 'days', date, 'points');
  return onSnapshot(query(routeRef, orderBy('recordedAt', 'asc'), limit(720)), (snapshot) => {
    callback(snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id } as DriverRoutePoint)));
  }, (error) => console.error('Cloud driver-route sync error:', error));
}

export function subscribeCloudUsers(callback: (users: SystemUser[]) => void) {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: SystemUser[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as SystemUser;
      list.push({ ...data, id: docSnap.id });
    });
    if (list.length > 0) {
      callback(list);
    }
  }, (error) => {
    console.error('Cloud users sync error:', error);
  });
}

export function subscribeCloudLogs(callback: (logs: AuditLogItem[]) => void) {
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: AuditLogItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as AuditLogItem;
      list.push({ ...data, id: docSnap.id });
    });
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(list);
  }, (error) => {
    console.error('Cloud logs sync error:', error);
  });
}

export function subscribeCloudEquipmentCategories(callback: (categories: EquipmentCategory[]) => void) {
  const colRef = collection(db, EQUIPMENT_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: EquipmentCategory[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as EquipmentCategory;
      list.push({ ...data, id: docSnap.id });
    });
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    if (list.length > 0) {
      callback(list);
    }
  }, (error) => {
    console.error('Cloud equipment categories sync error:', error);
  });
}

export function subscribeCloudExpenseCategories(callback: (categories: ExpenseCategoryConfig[]) => void) {
  const colRef = collection(db, EXPENSE_CATEGORIES_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: ExpenseCategoryConfig[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ExpenseCategoryConfig;
      list.push({ ...data, id: docSnap.id });
    });
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    if (list.length > 0) {
      callback(list);
    }
  }, (error) => {
    console.error('Cloud expense categories sync error:', error);
  });
}

export function subscribeCloudFeeSettings(callback: (settings: SystemFeeSettings) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, FEE_SETTINGS_DOC);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as SystemFeeSettings);
    }
  }, (error) => {
    console.error('Cloud fee settings sync error:', error);
  });
}

export function subscribeCloudDriverWorkflow(callback: (settings: import('../types').DriverWorkflowSettings) => void) {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, DRIVER_WORKFLOW_DOC), (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data() as import('../types').DriverWorkflowSettings);
  }, (error) => console.error('Cloud driver workflow sync error:', error));
}

export function subscribeCloudAuthSettings(callback: (settings: AuthSettings) => void) {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, AUTH_SETTINGS_DOC), (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data() as AuthSettings);
  }, (error) => console.error('Cloud auth settings sync error:', error));
}

export function subscribeCloudAttendanceSettings(callback: (settings: AttendanceSettings) => void) {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, ATTENDANCE_SETTINGS_DOC), (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data() as AttendanceSettings);
  }, (error) => console.error('Cloud attendance settings sync error:', error));
}

// -------------------------------------------------------------
// CLOUD WRITE MUTATIONS
// -------------------------------------------------------------

export async function saveDriverToCloud(driver: Driver): Promise<boolean> {
  try {
    const normalized: Driver = {
      ...driver,
      approvalStatus: driver.approvalStatus || 'approved',
      updatedAt: driver.updatedAt || new Date().toISOString()
    };
    const docRef = doc(db, DRIVERS_COLLECTION, driver.id);
    await setDoc(docRef, normalized, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving driver to cloud:', err);
    return false;
  }
}

export async function deleteDriverFromCloud(driverId: string): Promise<boolean> {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driverId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting driver from cloud:', err);
    return false;
  }
}

export async function saveExpenseToCloud(expense: ExpenseItem): Promise<boolean> {
  try {
    const docRef = doc(db, EXPENSES_COLLECTION, expense.id);
    await setDoc(docRef, expense, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving expense to cloud:', err);
    return false;
  }
}

export async function saveAttendanceToCloud(attendance: DriverAttendance): Promise<boolean> {
  try {
    // A daily summary can be restarted after checkout, so overwrite stale
    // checkout fields instead of preserving them through a merge.
    await setDoc(doc(db, ATTENDANCE_COLLECTION, attendance.id), attendance);
    return true;
  } catch (err) {
    console.error('Error saving attendance to cloud:', err);
    return false;
  }
}

export async function saveAttendanceEventToCloud(event: DriverAttendanceEvent): Promise<boolean> {
  try {
    await setDoc(doc(db, ATTENDANCE_EVENTS_COLLECTION, event.id), event);
    return true;
  } catch (err) {
    console.error('Error saving attendance event to cloud:', err);
    return false;
  }
}

export async function saveDriverLiveStatusToCloud(status: DriverLiveStatus): Promise<boolean> {
  try {
    await setDoc(doc(db, DRIVER_LIVE_STATUS_COLLECTION, status.driverId), status, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving live driver status to cloud:', err);
    return false;
  }
}

export async function saveDriverRoutePointToCloud(point: DriverRoutePoint): Promise<boolean> {
  try {
    await setDoc(doc(db, DRIVER_LIVE_ROUTES_COLLECTION, point.driverId, 'days', point.date, 'points', point.id), point);
    return true;
  } catch (err) {
    console.error('Error saving driver route point to cloud:', err);
    return false;
  }
}

export async function deleteExpenseFromCloud(expenseId: string): Promise<boolean> {
  try {
    const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting expense from cloud:', err);
    return false;
  }
}

export async function saveEquipmentCategoryToCloud(category: EquipmentCategory): Promise<boolean> {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, category.id);
    await setDoc(docRef, category, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving equipment category to cloud:', err);
    return false;
  }
}

export async function deleteEquipmentCategoryFromCloud(categoryId: string): Promise<boolean> {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, categoryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting equipment category from cloud:', err);
    return false;
  }
}

export async function saveExpenseCategoryToCloud(category: ExpenseCategoryConfig): Promise<boolean> {
  try {
    const docRef = doc(db, EXPENSE_CATEGORIES_COLLECTION, category.id);
    await setDoc(docRef, category, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving expense category to cloud:', err);
    return false;
  }
}

export async function deleteExpenseCategoryFromCloud(categoryId: string): Promise<boolean> {
  try {
    const docRef = doc(db, EXPENSE_CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting expense category from cloud:', err);
    return false;
  }
}

export async function saveFeeSettingsToCloud(settings: SystemFeeSettings): Promise<boolean> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, FEE_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving fee settings to cloud:', err);
    return false;
  }
}

export async function saveDriverWorkflowToCloud(settings: import('../types').DriverWorkflowSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, DRIVER_WORKFLOW_DOC), settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving driver workflow settings to cloud:', err);
    return false;
  }
}

export async function saveAuthSettingsToCloud(settings: AuthSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, AUTH_SETTINGS_DOC), settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving auth settings to cloud:', err);
    return false;
  }
}

export async function saveAttendanceSettingsToCloud(settings: AttendanceSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, ATTENDANCE_SETTINGS_DOC), settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving attendance settings to cloud:', err);
    return false;
  }
}

export async function saveUserToCloud(user: SystemUser): Promise<boolean> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving user to cloud:', err);
    return false;
  }
}

export async function deleteUserFromCloud(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting user from cloud:', err);
    return false;
  }
}

export async function addLogToCloud(log: AuditLogItem): Promise<boolean> {
  try {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);
    await setDoc(docRef, log);
    return true;
  } catch (err) {
    console.error('Error adding log to cloud:', err);
    return false;
  }
}

export async function restoreDatabaseToCloud(drivers: Driver[], expenses: ExpenseItem[]): Promise<boolean> {
  try {
    // Overwrite/sync all drivers
    for (const d of drivers) {
      await setDoc(doc(db, DRIVERS_COLLECTION, d.id), d);
    }
    for (const e of expenses) {
      await setDoc(doc(db, EXPENSES_COLLECTION, e.id), e);
    }
    return true;
  } catch (err) {
    console.error('Error restoring cloud database:', err);
    return false;
  }
}
