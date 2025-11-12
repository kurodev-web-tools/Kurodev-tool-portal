import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { readStorage, removeStorage, writeStorage } from '@/lib/browser-storage';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

interface PersistedPayload<T> {
  version: number;
  value: T;
}

export interface UsePersistentStateOptions<T> {
  /**
   * ストレージキーの名前空間。`namespace:key` の形式で保存される
   */
  namespace?: string;
  /**
   * 値を保存するストレージ。デフォルトは `window.localStorage`
   */
  storage?: StorageLike;
  /**
   * データスキーマのバージョン
   */
  version?: number;
  /**
   * 旧バージョンから新バージョンへ変換するためのマイグレーション
   */
  migrate?: (persistedValue: unknown, persistedVersion: number | null) => T;
  /**
   * エラー発生時のハンドラ
   */
  onError?: (error: unknown) => void;
}

const isBrowser = () => typeof window !== 'undefined';

const defaultStorage: StorageLike | null = isBrowser() ? window.localStorage : null;

function buildStorageKey(key: string, namespace?: string) {
  return namespace ? `${namespace}:${key}` : key;
}

function resolveDefaultValue<T>(defaultValue: T | (() => T)): T {
  return typeof defaultValue === 'function'
    ? (defaultValue as () => T)()
    : defaultValue;
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T | (() => T),
  options: UsePersistentStateOptions<T> = {},
) {
  const {
    namespace,
    storage = defaultStorage ?? undefined,
    version = 1,
    migrate,
    onError,
  } = options;

  const storageKey = useMemo(() => buildStorageKey(key, namespace), [key, namespace]);
  const isHydratedRef = useRef(false);

  const readInitialValue = useCallback((): T => {
    if (!isBrowser() || !storage) {
      return resolveDefaultValue(defaultValue);
    }

    try {
      const persisted = readStorage<PersistedPayload<T> | T>(storageKey);

      if (!persisted) {
        return resolveDefaultValue(defaultValue);
      }

      if (
        typeof persisted === 'object' &&
        persisted !== null &&
        'value' in persisted &&
        'version' in persisted
      ) {
        const payload = persisted as PersistedPayload<T>;
        if (payload.version === version) {
          return payload.value;
        }

        if (migrate) {
          return migrate(payload.value, payload.version);
        }

        logger.warn(
          `usePersistentState: version mismatch for key "${storageKey}". Expected v${version}, received v${payload.version}. Falling back to default.`,
          undefined,
          'usePersistentState',
        );
        return resolveDefaultValue(defaultValue);
      }

      // レガシーデータ（バージョン情報なし）に対応
      if (migrate) {
        return migrate(persisted, null);
      }

      return persisted as T;
    } catch (error) {
      logger.error(
        `usePersistentState: failed to read persisted value for key "${storageKey}"`,
        error,
        'usePersistentState',
      );
      onError?.(error);
      return resolveDefaultValue(defaultValue);
    }
  }, [defaultValue, migrate, onError, storage, storageKey, version]);

  const [state, setState] = useState<T>(readInitialValue);

  useEffect(() => {
    isHydratedRef.current = true;
  }, []);

  const persistValue = useCallback(
    (value: T) => {
      if (!isBrowser() || !storage) return;
      try {
        const payload: PersistedPayload<T> = { version, value };
        writeStorage(storageKey, payload);
      } catch (error) {
        logger.error(
          `usePersistentState: failed to persist key "${storageKey}"`,
          error,
          'usePersistentState',
        );
        onError?.(error);
      }
    },
    [onError, storage, storageKey, version],
  );

  const setPersistentState = useCallback(
    (valueOrUpdater: T | ((value: T) => T)) => {
      setState(prev => {
        const nextValue =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (value: T) => T)(prev)
            : valueOrUpdater;

        persistValue(nextValue);
        return nextValue;
      });
    },
    [persistValue],
  );

  const reset = useCallback(() => {
    const resolvedDefault = resolveDefaultValue(defaultValue);
    setState(resolvedDefault);
    if (!isBrowser() || !storage) return;
    try {
      removeStorage(storageKey);
    } catch (error) {
      logger.error(
        `usePersistentState: failed to remove key "${storageKey}"`,
        error,
        'usePersistentState',
      );
      onError?.(error);
    }
  }, [defaultValue, onError, storageKey]);

  return [
    state,
    setPersistentState,
    {
      reset,
      isHydrated: isHydratedRef.current,
    },
  ] as const;
}

