import { logger } from '@/lib/logger';
import type { TitleGenerationRequest, TitleGenerationResponse, TitleSuggestion } from '@/types/ai';

const MOCK_LATENCY_RANGE = [500, 900] as const;

const getRandomDelay = () => {
  const [min, max] = MOCK_LATENCY_RANGE;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createMockTitleSuggestions = (request: TitleGenerationRequest): TitleSuggestion[] => {
  const baseKeywords =
    request.keywords
      ?.split(/[,、，]/)
      .map(keyword => keyword.trim())
      .filter(Boolean) ?? [];

  const moodLabel = request.mood ? `【${request.mood}】` : '【実況】';
  const themeSnippet = request.videoTheme
    ? request.videoTheme.slice(0, 16)
    : '新作ゲームをプレイ';

  const baseTitle = request.baseTitle ?? `${moodLabel}${themeSnippet}`;

  const variations = [
    `${baseTitle}！${baseKeywords.slice(0, 2).join('×')}の魅力を徹底解説`,
    `${baseTitle} - ${request.targetAudience ?? 'みんな'} 必見の神回`,
    `${moodLabel}${themeSnippet}の裏話を暴露！${baseKeywords[0] ?? '初見'}のリアクションが話題`,
  ];

  return variations.map((text, index) => ({
    id: `title-${Date.now()}-${index}`,
    text,
  }));
};

const createMockHashtags = (request: TitleGenerationRequest): string[] => {
  const tags = new Set<string>();
  tags.add('VTuber');

  if (request.targetAudience) {
    tags.add(request.targetAudience.replace(/\s+/g, ''));
  }

  if (request.keywords) {
    request.keywords
      .split(/[,、，]/)
      .map(keyword => keyword.trim())
      .filter(Boolean)
      .slice(0, 3)
      .forEach(keyword => tags.add(keyword.replace(/\s+/g, '')));
  }

  if (request.mood) {
    tags.add(request.mood.replace(/\s+/g, ''));
  }

  return Array.from(tags).map(tag => tag.replace(/^#/, ''));
};

export async function generateTitleIdeas(
  request: TitleGenerationRequest,
): Promise<TitleGenerationResponse> {
  const mode = process.env.NEXT_PUBLIC_AI_MODE ?? 'mock';

  if (mode !== 'mock') {
    logger.warn(
      'AI client is set to non-mock mode, but no real backend implementation is provided. Falling back to mock.',
      undefined,
      'aiClient',
    );
  }

  await delay(getRandomDelay());

  const suggestions = createMockTitleSuggestions(request);
  const recommendedHashtags = createMockHashtags(request);

  return {
    suggestions,
    recommendedHashtags,
    insights: [
      '視聴者の注意を引くキーワードを冒頭に置いています。',
      'ハッシュタグを活用し、関連トレンドへ露出しやすい構成にしています。',
    ],
  };
}

