export interface TitleGenerationRequest {
  videoTheme: string;
  keywords?: string;
  targetAudience?: string;
  mood?: string;
  baseTitle?: string;
  hashtags?: string[];
}

export interface TitleSuggestion {
  id: string;
  text: string;
  emphasis?: 'low' | 'medium' | 'high';
}

export interface TitleGenerationResponse {
  suggestions: TitleSuggestion[];
  recommendedHashtags: string[];
  insights?: string[];
}

