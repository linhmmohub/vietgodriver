import { Driver, ExpenseItem, DriverAttendance, DriverSession } from '../types';

const DRIVERS_STORAGE_KEY = 'driver_uniform_drivers_v1';
const EXPENSES_STORAGE_KEY = 'driver_uniform_expenses_v1';
const ATTENDANCE_STORAGE_KEY = 'driver_uniform_attendance_v1';
const DRIVER_SESSION_KEY = 'driver_uniform_driver_session_v1';
const HAS_INITIALIZED_KEY = 'driver_uniform_db_initialized_flag';

// Empty default when clean database is expected
export const INITIAL_DRIVERS: Driver[] = [];
export const INITIAL_EXPENSES: ExpenseItem[] = [];

export function getStoredDrivers(): Driver[] {
  try {
    const raw = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading drivers from localStorage:', e);
    return [];
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
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses from localStorage:', e);
    return [];
  }
}

export function saveStoredExpenses(expenses: ExpenseItem[]) {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage:', e);
  }
}

export function getStoredAttendance(): DriverAttendance[] {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading attendance from localStorage:', e);
    return [];
  }
}

export function saveStoredAttendance(attendanceList: DriverAttendance[]) {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceList));
  } catch (e) {
    console.error('Error saving attendance to localStorage:', e);
  }
}

export function getStoredDriverSession(): DriverSession | null {
  try {
    const raw = localStorage.getItem(DRIVER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading driver session:', e);
    return null;
  }
}

export function saveStoredDriverSession(session: DriverSession | null) {
  try {
    if (session) {
      localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(DRIVER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error saving driver session:', e);
  }
}
