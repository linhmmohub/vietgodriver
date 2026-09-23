import { Driver, DriverSession, ExpenseItem } from '../types';

const DRIVERS_STORAGE_KEY = 'driver_uniform_drivers_v1';
const EXPENSES_STORAGE_KEY = 'driver_uniform_expenses_v1';
const INVENTORY_SETTINGS_KEY = 'driver_uniform_inventory_v1';
const DRIVER_SESSION_COOKIE = 'vietgo_driver_session';
const DEFAULT_DRIVER_SESSION_DAYS = 7;

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

/**
 * Remember only a short-lived device session. The PIN is never stored in the
 * browser; logout or expiry removes this cookie.
 */
export function getStoredDriverSession(): DriverSession | null {
  try {
    const raw = document.cookie.split('; ').find(value => value.startsWith(`${DRIVER_SESSION_COOKIE}=`))?.split('=')[1];
    if (!raw) return null;
    const session = JSON.parse(decodeURIComponent(raw)) as DriverSession;
    if (!session.driverId || !session.expiresAt || new Date(session.expiresAt).getTime() <= Date.now()) {
      clearStoredDriverSession();
      return null;
    }
    return session;
  } catch {
    clearStoredDriverSession();
    return null;
  }
}

export function saveStoredDriverSession(session: DriverSession, sessionDays = DEFAULT_DRIVER_SESSION_DAYS) {
  const validDays = Math.min(300, Math.max(1, Math.round(sessionDays) || DEFAULT_DRIVER_SESSION_DAYS));
  const expiresAt = session.expiresAt || new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();
  const safeSession = { ...session, expiresAt };
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${DRIVER_SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(safeSession))}; expires=${new Date(expiresAt).toUTCString()}; path=/; SameSite=Strict${secure}`;
}

export function clearStoredDriverSession() {
  document.cookie = `${DRIVER_SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
}
