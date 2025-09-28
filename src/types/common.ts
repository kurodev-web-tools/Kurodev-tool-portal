/**
 * 共通の型定義
 * アプリケーション全体で使用される基本的な型を定義
 */

// 基本的なステータス型
export type Status = 'released' | 'beta' | 'development';

// ツールカテゴリ型
export type ToolCategory = 'planning' | 'production' | 'branding' | 'collaboration';

// ツールアイテムの基本型
export interface BaseToolItem {
  id: string;
  title: string;
  description: string;
  status: Status;
  category: ToolCategory;
  href: string;
  icon?: string;
  tags?: string[];
  usageCount?: number;
  rating?: number;
  lastUsed?: string;
  isFavorite?: boolean;
}

// スイートアイテムの型
export interface SuiteItem extends BaseToolItem {
  tools: BaseToolItem[];
  progress: number;
  totalTools: number;
  completedTools: number;
}

// API レスポンスの基本型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション型
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 検索・フィルター型
export interface SearchParams {
  query?: string;
  category?: ToolCategory;
  status?: Status;
  tags?: string[];
  sortBy?: 'name' | 'status' | 'usage' | 'rating' | 'lastUsed';
  sortOrder?: 'asc' | 'desc';
}

// ユーザー設定型
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
  preferences: {
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    showFavorites: boolean;
  };
}

// 統計情報型
export interface StatsData {
  totalTools: number;
  totalSuites: number;
  releasedTools: number;
  betaTools: number;
  developmentTools: number;
  totalUsage: number;
  averageRating: number;
}

// 進捗情報型
export interface ProgressData {
  suiteId: string;
  suiteName: string;
  completed: number;
  total: number;
  percentage: number;
  lastUpdated: string;
}

// エラー型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
}

// ログエントリ型（logger.ts と重複する場合は統合）
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
  userId?: string;
}

// フォーム関連の型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// 通知型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// メタデータ型
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

// コンポーネントプロパティの基本型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// ボタン型
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// カード型
export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  image?: string;
  actions?: React.ReactNode;
  hover?: boolean;
}

// モーダル型
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

// テーブル型
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
}

// ユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// イベント型
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

// ストレージ型
export interface StorageItem<T> {
  key: string;
  value: T;
  expires?: number;
  createdAt: number;
}

// キャッシュ型
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 設定型
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxFileSize: number;
    maxUploads: number;
    rateLimit: number;
  };
}
