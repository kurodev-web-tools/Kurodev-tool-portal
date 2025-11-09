import type { ComponentType } from 'react';

export type IdeaCategory =
  | 'gaming'
  | 'singing'
  | 'talk'
  | 'collaboration'
  | 'event'
  | 'other';

export type IdeaDifficulty = 'easy' | 'medium' | 'hard';

export interface GenerationStep {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

export type GenerationType = 'ideas' | 'script';

export interface GenerationSettings {
  keywords: string;
  direction: string;
  duration: number;
  speakingStyle: string[];
  includeElements: string[];
  customPrompt: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  points: string[];
  category: IdeaCategory;
  estimatedDuration: number;
  difficulty?: IdeaDifficulty;
  thumbnail?: string;
  isFavorite?: boolean;
  order?: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  speakingStyle?: string[];
  traits?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ScriptSection {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  order: number;
  color: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: IdeaCategory;
  sections: ScriptSection[];
  isCustom?: boolean;
}

export interface Script {
  ideaId: number;
  content: string;
  introduction: string;
  body: string;
  conclusion: string;
  templateId?: string;
  sections?: Record<string, string>;
}

export interface ScriptHistoryItem {
  introduction: string;
  body: string;
  conclusion: string;
  timestamp: number;
}

export interface GenerationHistory {
  id: string;
  timestamp: number;
  ideas: Idea[];
  keywords?: string;
  direction?: string;
  createdAt: string;
}

export interface SavedScript {
  id: string;
  scriptId: number;
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  versionName?: string;
  templateId?: string;
  sections?: Record<string, string>;
}

