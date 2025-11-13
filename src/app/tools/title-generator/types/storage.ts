import type {
  GenerationHistoryEntry,
  TitleGenerationFormValues,
} from '@/types/title-generator';

/**
 * 概要欄テンプレートのセクション型
 */
export interface TemplateSection {
  type: 'summary' | 'timestamp' | 'related' | 'hashtag' | 'sns' | 'setlist' | 'guest' | 'custom';
  title?: string;
  content: string;
  enabled: boolean;
  order: number;
}

/**
 * 概要欄テンプレート型
 */
export interface DescriptionTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
  isCustom?: boolean;
}

/**
 * 入力ドラフトの型
 */
export interface InputDraft {
  videoTheme: string;
  keywords: string;
  targetAudience: string;
  videoMood: string;
  timestamp: number;
}

/**
 * ストレージのバージョン管理
 * 将来のschema変更に対応するため、バージョン番号を管理
 */
export const STORAGE_VERSIONS = {
  FAVORITES: 1,
  INPUT_DRAFT: 1,
  HASHTAG_FAVORITES: 1,
  DESCRIPTION_TEMPLATES: 1,
} as const;

/**
 * ストレージキー
 */
export const STORAGE_KEYS = {
  FAVORITES: 'title-generator-favorites',
  INPUT_DRAFT: 'title-generator-input-draft',
  HASHTAG_FAVORITES: 'title-generator-hashtag-favorites',
  DESCRIPTION_TEMPLATES: 'title-generator-description-templates',
} as const;

/**
 * お気に入りストレージ形式
 */
export interface FavoritesStorage {
  version: number;
  favoriteTitles: string[];
}

/**
 * 入力ドラフトストレージ形式
 */
export interface InputDraftStorage {
  version: number;
  draft: InputDraft;
}

/**
 * ハッシュタグお気に入りストレージ形式
 */
export interface HashtagFavoritesStorage {
  version: number;
  hashtags: string[];
}

/**
 * 概要欄テンプレートストレージ形式
 */
export interface DescriptionTemplatesStorage {
  version: number;
  templates: DescriptionTemplate[];
}

/**
 * ストレージからお気に入りを読み込む
 */
export function loadFavoritesFromStorage(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    
    const data = JSON.parse(raw) as FavoritesStorage | string[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return new Set(data);
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.FAVORITES) {
      return new Set(data.favoriteTitles);
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
export function saveFavoritesToStorage(key: string, favoriteTitles: Set<string>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: FavoritesStorage = {
      version: STORAGE_VERSIONS.FAVORITES,
      favoriteTitles: Array.from(favoriteTitles),
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save favorites to storage: ${key}`, error);
  }
}

/**
 * ストレージから入力ドラフトを読み込む
 */
export function loadInputDraftFromStorage(key: string): InputDraft | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    
    const data = JSON.parse(raw) as InputDraftStorage | InputDraft;
    
    // レガシー形式（InputDraft）のサポート
    if (!('version' in data)) {
      // 7日以上古い場合は無視
      if (data.timestamp && Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
        window.localStorage.removeItem(key);
        return null;
      }
      return data;
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.INPUT_DRAFT) {
      // 7日以上古い場合は無視
      if (data.draft.timestamp && Date.now() - data.draft.timestamp > 7 * 24 * 60 * 60 * 1000) {
        window.localStorage.removeItem(key);
        return null;
      }
      return data.draft;
    }
    
    // バージョン不一致の場合はnullを返す
    return null;
  } catch (error) {
    console.warn(`Failed to load input draft from storage: ${key}`, error);
    return null;
  }
}

/**
 * ストレージに入力ドラフトを保存する
 */
export function saveInputDraftToStorage(
  key: string,
  formValues: TitleGenerationFormValues,
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const draft: InputDraft = {
      ...formValues,
      timestamp: Date.now(),
    };
    const data: InputDraftStorage = {
      version: STORAGE_VERSIONS.INPUT_DRAFT,
      draft,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save input draft to storage: ${key}`, error);
  }
}

/**
 * ストレージからハッシュタグのお気に入りを読み込む
 */
export function loadHashtagFavoritesFromStorage(key: string): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    
    const data = JSON.parse(raw) as HashtagFavoritesStorage | string[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return data;
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.HASHTAG_FAVORITES) {
      return data.hashtags;
    }
    
    // バージョン不一致の場合は空配列を返す
    return [];
  } catch (error) {
    console.warn(`Failed to load hashtag favorites from storage: ${key}`, error);
    return [];
  }
}

/**
 * ストレージにハッシュタグのお気に入りを保存する
 */
export function saveHashtagFavoritesToStorage(key: string, hashtags: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: HashtagFavoritesStorage = {
      version: STORAGE_VERSIONS.HASHTAG_FAVORITES,
      hashtags,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save hashtag favorites to storage: ${key}`, error);
  }
}

/**
 * ストレージから概要欄テンプレートを読み込む
 */
export function loadDescriptionTemplatesFromStorage(key: string): DescriptionTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    
    const data = JSON.parse(raw) as DescriptionTemplatesStorage | DescriptionTemplate[];
    
    // レガシー形式（配列）のサポート
    if (Array.isArray(data)) {
      return data;
    }
    
    // バージョン管理形式
    if (data.version === STORAGE_VERSIONS.DESCRIPTION_TEMPLATES) {
      return data.templates;
    }
    
    // バージョン不一致の場合は空配列を返す
    return [];
  } catch (error) {
    console.warn(`Failed to load description templates from storage: ${key}`, error);
    return [];
  }
}

/**
 * ストレージに概要欄テンプレートを保存する
 */
export function saveDescriptionTemplatesToStorage(
  key: string,
  templates: DescriptionTemplate[],
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: DescriptionTemplatesStorage = {
      version: STORAGE_VERSIONS.DESCRIPTION_TEMPLATES,
      templates,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save description templates to storage: ${key}`, error);
  }
}
