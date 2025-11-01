import { Layer } from '@/types/layers';

/**
 * プロジェクトデータの型定義
 */
export interface ThumbnailProject {
  id: string;
  name: string;
  layers: Layer[];
  selectedLayerId: string | null;
  templateId: string | null;
  aspectRatio: string;
  thumbnail: string | null; // サムネイル画像（DataURL）
  createdAt: number;
  updatedAt: number;
  isAutoSave?: boolean; // 自動保存フラグ
}

/**
 * localStorage用のプロジェクトリスト
 */
export interface ProjectList {
  projects: ThumbnailProject[];
  lastSavedProjectId: string | null; // 最後に保存したプロジェクトID
}

