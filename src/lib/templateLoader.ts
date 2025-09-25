import { ThumbnailTemplate } from '../types/template';

interface TemplateData {
  templates: ThumbnailTemplate[];
  metadata: {
    generatedAt: string;
    totalTemplates: number;
    invalidTemplates: number;
    duplicates: number;
    missingFiles: number;
  };
}

export const loadTemplates = async (): Promise<ThumbnailTemplate[]> => {
  try {
    // まず生成されたJSONファイルから読み込みを試行
    try {
      const templateData = await import('../data/templates.json') as TemplateData;
      console.log(`Loaded ${templateData.templates.length} templates from generated JSON file`);
      return templateData.templates;
    } catch (jsonError) {
      console.warn('Could not load templates from JSON file:', jsonError);
      // クライアント環境ではファイルシステムスキャンが使えないため空配列を返す
      return [];
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
    throw new Error('Failed to load templates.');
  }
};