import type { TitleSuggestion } from '@/types/ai';

export interface SavedPrompt {
  id: string;
  prompt: string;
  negativePrompt?: string;
  createdAt: number;
}

export interface TitleOption extends TitleSuggestion {
  isFavorite: boolean;
}

export interface GenerationHistoryEntry {
  id: string;
  timestamp: number;
  titles: TitleOption[];
  description: string;
  inputData: {
    videoTheme: string;
    keywords: string;
    targetAudience: string;
    videoMood: string;
  };
}

