// src/types/schedule.ts

export interface RecurringInfo {
  groupId: string; // 同じ繰り返しグループのID
  pattern: 'daily' | 'weekly' | 'monthly'; // 繰り返しパターン
}

export interface ScheduleItem {
  id: string; // UUID
  title?: string; // 予定のタイトル (任意に変更)
  date: string; // ISO 8601形式 (YYYY-MM-DD)
  time?: string; // HH:mm形式 または「未定」
  category?: string; // 「雑談」「ゲーム」など (任意に変更)
  platform?: string; // 「YouTube」「Twitch」など (任意に変更)
  notes?: string; // 備考 (任意に変更)
  duration?: number; // 予定時間（分）
  reminders?: string[]; // リマインダー設定
  isCompleted: boolean; // 完了フラグ
  recurringInfo?: RecurringInfo; // 繰り返し情報（表示用のみ）
}