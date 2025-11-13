import type {
  GenerationHistory,
  SavedScript,
  ScriptTemplate,
  Persona,
} from '../types';

/**
 * ストレージのバージョン管理
 * 将来のschema変更に対応するため、バージョン番号を管理
 */
export const STORAGE_VERSIONS = {
  FAVORITES: 1,
  HISTORY: 1,
  SAVED_SCRIPTS: 1,
  PERSONAS: 1,
  CUSTOM_TEMPLATES: 1,
} as const;

/**
 * ストレージキー
 */
export const STORAGE_KEYS = {
  IDEAS_ORDER: 'script-generator-ideas-order',
  FAVORITES: 'script-generator-favorites',
  HISTORY: 'script-generator-history',
  SAVED_SCRIPTS: 'script-generator-saved-scripts',
  CUSTOM_TEMPLATES: 'script-generator-custom-templates',
  PERSONAS: 'script-generator-personas',
  DEFAULT_PERSONA: 'script-generator-default-persona',
} as const;

/**
 * お気に入りストレージ形式
 */
export interface FavoritesStorage {
  version: number;
  favoriteIds: number[];
}

/**
 * 履歴ストレージ形式
 */
export interface HistoryStorage {
  version: number;
  history: GenerationHistory[];
}

/**
 * 保存済み台本ストレージ形式
 */
export interface SavedScriptsStorage {
  version: number;
  scripts: SavedScript[];
}

/**
 * カスタムテンプレートストレージ形式
 */
export interface CustomTemplatesStorage {
  version: number;
  templates: ScriptTemplate[];
}

/**
 * ペルソナストレージ形式
 */
export interface PersonasStorage {
  version: number;
  personas: Persona[];
  defaultPersonaId: string | null;
}

/**
 * ストレージからお気に入りを読み込む
 */
export function loadFavoritesFromStorage(key: string): Set<number> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    
    const data = JSON.parse(raw) as FavoritesStorage | number[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return new Set(data);
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.FAVORITES) {
      return new Set(data.favoriteIds);
    }
    
    // バージョン不一致の場合は空セットを返す
    return new Set();
  } catch (error) {
    console.warn(`Failed to load favorites from storage: ${key}`, error);
    return new Set();
  }
}

/**
 * ストレージにお気に入りを保存する
 */
export function saveFavoritesToStorage(key: string, favoriteIds: Set<number>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: FavoritesStorage = {
      version: STORAGE_VERSIONS.FAVORITES,
      favoriteIds: Array.from(favoriteIds),
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save favorites to storage: ${key}`, error);
  }
}

/**
 * ストレージから履歴を読み込む
 */
export function loadHistoryFromStorage(key: string): GenerationHistory[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    
    const data = JSON.parse(raw) as HistoryStorage | GenerationHistory[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return data;
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.HISTORY) {
      return data.history;
    }
    
    // バージョン不一致の場合は空配列を返す
    return [];
  } catch (error) {
    console.warn(`Failed to load history from storage: ${key}`, error);
    return [];
  }
}

/**
 * ストレージに履歴を保存する
 */
export function saveHistoryToStorage(key: string, history: GenerationHistory[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: HistoryStorage = {
      version: STORAGE_VERSIONS.HISTORY,
      history,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save history to storage: ${key}`, error);
  }
}

/**
 * ストレージから保存済み台本を読み込む
 */
export function loadSavedScriptsFromStorage(key: string): SavedScript[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    
    const data = JSON.parse(raw) as SavedScriptsStorage | SavedScript[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return data;
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.SAVED_SCRIPTS) {
      return data.scripts;
    }
    
    // バージョン不一致の場合は空配列を返す
    return [];
  } catch (error) {
    console.warn(`Failed to load saved scripts from storage: ${key}`, error);
    return [];
  }
}

/**
 * ストレージに保存済み台本を保存する
 */
export function saveSavedScriptsToStorage(key: string, scripts: SavedScript[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: SavedScriptsStorage = {
      version: STORAGE_VERSIONS.SAVED_SCRIPTS,
      scripts,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save saved scripts to storage: ${key}`, error);
  }
}

/**
 * ストレージからカスタムテンプレートを読み込む
 */
export function loadCustomTemplatesFromStorage(key: string): ScriptTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    
    const data = JSON.parse(raw) as CustomTemplatesStorage | ScriptTemplate[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return data;
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.CUSTOM_TEMPLATES) {
      return data.templates;
    }
    
    // バージョン不一致の場合は空配列を返す
    return [];
  } catch (error) {
    console.warn(`Failed to load custom templates from storage: ${key}`, error);
    return [];
  }
}

/**
 * ストレージにカスタムテンプレートを保存する
 */
export function saveCustomTemplatesToStorage(key: string, templates: ScriptTemplate[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: CustomTemplatesStorage = {
      version: STORAGE_VERSIONS.CUSTOM_TEMPLATES,
      templates,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save custom templates to storage: ${key}`, error);
  }
}

/**
 * ストレージからペルソナを読み込む
 */
export function loadPersonasFromStorage(
  key: string,
  defaultKey: string,
): { personas: Persona[]; defaultPersonaId: string | null } {
  if (typeof window === 'undefined') {
    return { personas: [], defaultPersonaId: null };
  }
  
  try {
    const raw = window.localStorage.getItem(key);
    const fallback = { personas: [], defaultPersonaId: null };
    
    if (!raw) {
      // レガシー形式のデフォルトペルソナIDを確認
      const legacyDefault = window.localStorage.getItem(defaultKey);
      return {
        ...fallback,
        defaultPersonaId: legacyDefault ? legacyDefault : null,
      };
    }
    
    const data = JSON.parse(raw) as PersonasStorage;
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.PERSONAS) {
      // レガシー形式のデフォルトペルソナIDを削除
      window.localStorage.removeItem(defaultKey);
      return {
        personas: data.personas,
        defaultPersonaId: data.defaultPersonaId,
      };
    }
    
    // バージョン不一致の場合は空配列を返す
    return fallback;
  } catch (error) {
    console.warn(`Failed to load personas from storage: ${key}`, error);
    return { personas: [], defaultPersonaId: null };
  }
}

/**
 * ストレージにペルソナを保存する
 */
export function savePersonasToStorage(
  key: string,
  defaultKey: string,
  personas: Persona[],
  defaultPersonaId: string | null,
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: PersonasStorage = {
      version: STORAGE_VERSIONS.PERSONAS,
      personas,
      defaultPersonaId,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
    
    // レガシー形式のデフォルトペルソナIDを削除
    window.localStorage.removeItem(defaultKey);
  } catch (error) {
    console.error(`Failed to save personas to storage: ${key}`, error);
  }
}

