/**
 * 統一されたバリデーション関数
 * フォームやAPIの入力検証に使用
 */

import { z } from 'zod';

// 基本的なバリデーションスキーマ
export const commonSchemas = {
  // 文字列の基本検証
  string: z.string().min(1, '必須項目です'),
  
  // オプショナル文字列
  optionalString: z.string().optional(),
  
  // メールアドレス
  email: z.string().email('有効なメールアドレスを入力してください'),
  
  // パスワード（8文字以上、英数字含む）
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '英数字を含むパスワードを入力してください'),
  
  // 電話番号（日本の形式）
  phone: z.string()
    .regex(/^0\d{1,4}-\d{1,4}-\d{4}$/, '有効な電話番号を入力してください（例: 03-1234-5678）'),
  
  // URL
  url: z.string().url('有効なURLを入力してください'),
  
  // 数値
  number: z.number().min(0, '0以上の数値を入力してください'),
  
  // 正の整数
  positiveInteger: z.number().int().positive('正の整数を入力してください'),
  
  // 日付
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '有効な日付を入力してください（YYYY-MM-DD）'),
  
  // 日時
  datetime: z.string().datetime('有効な日時を入力してください'),
  
  // ファイル
  file: z.instanceof(File, { message: 'ファイルを選択してください' }),
  
  // 画像ファイル
  imageFile: z.instanceof(File)
    .refine((file) => file.type.startsWith('image/'), '画像ファイルを選択してください')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'ファイルサイズは5MB以下にしてください'),
};

// ツール関連のバリデーションスキーマ
export const toolSchemas = {
  // ツールID
  toolId: z.string().min(1, 'ツールIDは必須です'),
  
  // ツールタイトル
  toolTitle: z.string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  
  // ツール説明
  toolDescription: z.string()
    .min(1, '説明は必須です')
    .max(500, '説明は500文字以内で入力してください'),
  
  // ツールステータス
  toolStatus: z.enum(['released', 'beta', 'development'], {
    message: '有効なステータスを選択してください'
  }),
  
  // ツールカテゴリ
  toolCategory: z.enum(['planning', 'production', 'branding', 'collaboration'], {
    message: '有効なカテゴリを選択してください'
  }),
  
  // ツールURL
  toolUrl: z.string().url('有効なURLを入力してください'),
  
  // タグ
  tags: z.array(z.string().min(1, 'タグは空にできません')).optional(),
};

// ユーザー関連のバリデーションスキーマ
export const userSchemas = {
  // ユーザー名
  username: z.string()
    .min(2, 'ユーザー名は2文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_]+$/, 'ユーザー名は英数字とアンダースコアのみ使用できます'),
  
  // 表示名
  displayName: z.string()
    .min(1, '表示名は必須です')
    .max(50, '表示名は50文字以内で入力してください'),
  
  // プロフィール
  profile: z.string()
    .max(1000, 'プロフィールは1000文字以内で入力してください')
    .optional(),
};

// 検索・フィルター関連のバリデーションスキーマ
export const searchSchemas = {
  // 検索クエリ
  searchQuery: z.string()
    .min(1, '検索キーワードを入力してください')
    .max(100, '検索キーワードは100文字以内で入力してください'),
  
  // ページ番号
  page: z.number().int().min(1, 'ページ番号は1以上である必要があります'),
  
  // ページサイズ
  pageSize: z.number().int().min(1).max(100, 'ページサイズは1-100の範囲で設定してください'),
  
  // ソート順
  sortOrder: z.enum(['asc', 'desc'], {
    message: '有効なソート順を選択してください'
  }),
};

// フォーム関連のバリデーションスキーマ
export const formSchemas = {
  // ログインフォーム
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'パスワードは必須です'),
    remember: z.boolean().optional(),
  }),
  
  // 登録フォーム
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    username: userSchemas.username,
    displayName: userSchemas.displayName,
    agreeToTerms: z.boolean().refine(val => val === true, '利用規約に同意してください'),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  }),
  
  // プロフィール更新フォーム
  updateProfile: z.object({
    displayName: userSchemas.displayName,
    profile: userSchemas.profile,
    email: commonSchemas.email.optional(),
  }),
  
  // パスワード変更フォーム
  changePassword: z.object({
    currentPassword: z.string().min(1, '現在のパスワードは必須です'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: '新しいパスワードが一致しません',
    path: ['confirmPassword'],
  }),
};

// カスタムバリデーション関数
export const customValidators = {
  // ファイルサイズチェック
  fileSize: (maxSize: number) => (file: File) => {
    if (file.size > maxSize) {
      return `ファイルサイズは${Math.round(maxSize / 1024 / 1024)}MB以下にしてください`;
    }
    return true;
  },
  
  // ファイル形式チェック
  fileType: (allowedTypes: string[]) => (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      return `許可されたファイル形式: ${allowedTypes.join(', ')}`;
    }
    return true;
  },
  
  // 日付範囲チェック
  dateRange: (minDate: Date, maxDate: Date) => (date: Date) => {
    if (date < minDate || date > maxDate) {
      return `日付は${minDate.toLocaleDateString()}から${maxDate.toLocaleDateString()}の範囲で入力してください`;
    }
    return true;
  },
  
  // 数値範囲チェック
  numberRange: (min: number, max: number) => (value: number) => {
    if (value < min || value > max) {
      return `値は${min}から${max}の範囲で入力してください`;
    }
    return true;
  },
  
  // 文字数チェック
  textLength: (min: number, max: number) => (text: string) => {
    if (text.length < min || text.length > max) {
      return `文字数は${min}文字から${max}文字の範囲で入力してください`;
    }
    return true;
  },
  
  // 重複チェック
  unique: (existingValues: string[]) => (value: string) => {
    if (existingValues.includes(value)) {
      return 'この値は既に使用されています';
    }
    return true;
  },
};

// バリデーション結果の型
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// バリデーション実行関数
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'バリデーションエラーが発生しました' } };
  }
}

// 非同期バリデーション（サーバーサイド検証用）
export async function validateDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  asyncValidators?: Array<(data: T) => Promise<string | null>>
): Promise<ValidationResult> {
  const syncResult = validateData(schema, data);
  if (!syncResult.isValid) {
    return syncResult;
  }
  
  if (asyncValidators) {
    for (const validator of asyncValidators) {
      try {
        const error = await validator(data as T);
        if (error) {
          return { isValid: false, errors: { async: error } };
        }
      } catch (err) {
        return { isValid: false, errors: { async: '非同期バリデーションエラーが発生しました' } };
      }
    }
  }
  
  return { isValid: true, errors: {} };
}

// タイトル生成用のバリデーション関数
export const validateTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'タイトルを入力してください';
  }
  if (title.length > 100) {
    return 'タイトルは100文字以内で入力してください';
  }
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (!description || description.trim().length === 0) {
    return '説明を入力してください';
  }
  if (description.length > 500) {
    return '説明は500文字以内で入力してください';
  }
  return null;
};

// プロンプト用のバリデーション関数
export const validatePrompt = (prompt: string): string | null => {
  if (!prompt || prompt.trim().length === 0) {
    return 'プロンプトを入力してください';
  }
  if (prompt.length > 1000) {
    return 'プロンプトは1000文字以内で入力してください';
  }
  return null;
};