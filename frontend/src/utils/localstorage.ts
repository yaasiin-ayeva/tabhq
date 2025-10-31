export const APP_NAMESPACE = 'tabhq_';

export interface UserInfo {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'merchant' | 'developer' | 'user';
  country?: string;
  currency?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StorageValue<T> = {
  value: T;
  expiry?: number;
};

/* ---------------------------------------------
 * Core Helpers
 * -------------------------------------------*/

const buildKey = (key: string): string => `${APP_NAMESPACE}${key}`;

export const setItem = <T>(key: string, value: T, ttl?: number): void => {
  try {
    const item: StorageValue<T> = {
      value,
      ...(ttl ? { expiry: Date.now() + ttl } : {}),
    };
    localStorage.setItem(buildKey(key), JSON.stringify(item));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

export const getItem = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(buildKey(key));
    if (!raw) return null;

    const item: StorageValue<T> = JSON.parse(raw);
    if (item.expiry && Date.now() > item.expiry) {
      localStorage.removeItem(buildKey(key));
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(buildKey(key));
  } catch (error) {
    console.error(`Error removing ${key} from localStorage`, error);
  }
};

export const clearAppStorage = (): void => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(APP_NAMESPACE))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing app localStorage', error);
  }
};

export const hasItem = (key: string): boolean =>
  localStorage.getItem(buildKey(key)) !== null;

export const getAllKeys = (): string[] =>
  Object.keys(localStorage)
    .filter((key) => key.startsWith(APP_NAMESPACE))
    .map((key) => key.replace(APP_NAMESPACE, ''));

export const debugStorage = (): void => {
  console.group('🧠 TabHQ LocalStorage Debug');
  getAllKeys().forEach((key) => {
    console.log(`${key}:`, getItem(key));
  });
  console.groupEnd();
};

/* ---------------------------------------------
 * Storage Keys
 * -------------------------------------------*/

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_info',
  THEME: 'ui_theme',
  PAYMENT_PROVIDER: 'selected_provider',
  SETTINGS: 'app_settings',
  DASHBOARD_STATE: 'dashboard_state',
};

/* ---------------------------------------------
 * User Info Utilities
 * -------------------------------------------*/

/**
 * Save full user info
 */
export const setUserInfo = (user: UserInfo): void => {
  setItem<UserInfo>(STORAGE_KEYS.USER, user);
};

/**
 * Retrieve user info (returns null if not found)
 */
export const getUserInfo = (): UserInfo | null => {
  return getItem<UserInfo>(STORAGE_KEYS.USER);
};

/**
 * Update part of user info (merge)
 */
export const updateUserInfo = (updates: Partial<UserInfo>): void => {
  const existing = getUserInfo() || {};
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  setUserInfo(updated);
};

/**
 * Get full name (for display)
 */
export const getUserFullName = (): string => {
  const user = getUserInfo();
  if (!user) return '';
  return `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim();
};

/**
 * Clear user data (for logout)
 */
export const clearUserInfo = (): void => {
  removeItem(STORAGE_KEYS.USER);
  removeItem(STORAGE_KEYS.TOKEN);
};

/* ---------------------------------------------
 * Token Utilities
 * -------------------------------------------*/

/**
 * Save authentication token
 */
export const setToken = (token: string): void => {
  setItem<string>(STORAGE_KEYS.TOKEN, token);
};

/**
 * Retrieve authentication token
 */
export const getToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.TOKEN);
};

/**
 * Clear authentication token
 */
export const clearToken = (): void => {
  removeItem(STORAGE_KEYS.TOKEN);
};
