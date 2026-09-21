import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Driver, ExpenseItem, SystemUser, AuditLogItem, DriverAttendance } from '../types';
import { DEFAULT_SUPER_ADMIN, DEFAULT_STAFF_USER } from '../utils/auth';

// Collection references
const DRIVERS_COLLECTION = 'drivers';
const EXPENSES_COLLECTION = 'expenses';
const USERS_COLLECTION = 'system_users';
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const ATTENDANCE_COLLECTION = 'attendance';
const META_DOC = 'system_meta/state';

/**
 * Check and initialize cloud data if the Firestore database is completely fresh
 */
export async function initializeCloudDatabaseIfNeeded(
  initialDrivers: Driver[],
  initialExpenses: ExpenseItem[]
) {
  try {
    const metaRef = doc(db, 'system_meta', 'state');
    const metaSnap = await getDoc(metaRef);

    if (!metaSnap.exists()) {
      // First time initialization in Cloud Firestore!
      // Check if drivers collection has anything
      const driversSnap = await getDocs(collection(db, DRIVERS_COLLECTION));
      if (driversSnap.empty) {
        // Seed initial drivers
        for (const driver of initialDrivers) {
          await setDoc(doc(db, DRIVERS_COLLECTION, driver.id), driver);
        }
      }

      // Check if expenses has anything
      const expSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
      if (expSnap.empty) {
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

      await setDoc(metaRef, {
        initialized: true,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error initializing cloud database:', error);
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
      list.push({ ...data, id: docSnap.id });
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

export function subscribeCloudAttendance(callback: (attendanceList: DriverAttendance[]) => void) {
  const colRef = collection(db, ATTENDANCE_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: DriverAttendance[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DriverAttendance;
      list.push({ ...data, id: docSnap.id });
    });
    // Sort by checkInTime descending
    list.sort((a, b) => new Date(b.checkInTime || b.updatedAt || 0).getTime() - new Date(a.checkInTime || a.updatedAt || 0).getTime());
    callback(list);
  }, (error) => {
    console.error('Cloud attendance sync error:', error);
  });
}

// -------------------------------------------------------------
// CLOUD WRITE MUTATIONS
// -------------------------------------------------------------

export async function saveDriverToCloud(driver: Driver) {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driver.id);
    await setDoc(docRef, driver, { merge: true });
  } catch (err) {
    console.error('Error saving driver to cloud:', err);
  }
}

export async function deleteDriverFromCloud(driverId: string) {
  try {
    const docRef = doc(db, DRIVERS_COLLECTION, driverId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting driver from cloud:', err);
  }
}

export async function saveExpenseToCloud(expense: ExpenseItem) {
  try {
    const docRef = doc(db, EXPENSES_COLLECTION, expense.id);
    await setDoc(docRef, expense, { merge: true });
  } catch (err) {
    console.error('Error saving expense to cloud:', err);
  }
}

export async function deleteExpenseFromCloud(expenseId: string) {
  try {
    const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting expense from cloud:', err);
  }
}

export async function saveUserToCloud(user: SystemUser) {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (err) {
    console.error('Error saving user to cloud:', err);
  }
}

export async function deleteUserFromCloud(userId: string) {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting user from cloud:', err);
  }
}

export async function addLogToCloud(log: AuditLogItem) {
  try {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);
    await setDoc(docRef, log);
  } catch (err) {
    console.error('Error adding log to cloud:', err);
  }
}

export async function saveAttendanceToCloud(attendance: DriverAttendance) {
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, attendance.id);
    await setDoc(docRef, attendance, { merge: true });
  } catch (err) {
    console.error('Error saving attendance to cloud:', err);
  }
}

export async function deleteAttendanceFromCloud(attendanceId: string) {
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting attendance from cloud:', err);
  }
}

export async function restoreDatabaseToCloud(drivers: Driver[], expenses: ExpenseItem[]) {
  try {
    // Overwrite/sync all drivers
    for (const d of drivers) {
      await setDoc(doc(db, DRIVERS_COLLECTION, d.id), d);
    }
    for (const e of expenses) {
      await setDoc(doc(db, EXPENSES_COLLECTION, e.id), e);
    }
  } catch (err) {
    console.error('Error restoring cloud database:', err);
  }
}
