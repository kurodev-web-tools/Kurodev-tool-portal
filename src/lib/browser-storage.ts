import { logger } from '@/lib/logger';

const isBrowserEnvironment = () => typeof window !== 'undefined';

export const readStorage = <T,>(key: string): T | null => {
  if (!isBrowserEnvironment()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn(`Failed to parse storage key "${key}"`, error, 'browser-storage');
    window.localStorage.removeItem(key);
    return null;
  }
};

export const writeStorage = (key: string, value: unknown) => {
  if (!isBrowserEnvironment()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`Failed to persist storage key "${key}"`, error, 'browser-storage');
    throw error;
  }
};

export const removeStorage = (key: string) => {
  if (!isBrowserEnvironment()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    logger.error(`Failed to remove storage key "${key}"`, error, 'browser-storage');
  }
};

