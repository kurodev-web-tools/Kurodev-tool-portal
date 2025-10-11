import { Template } from '@/hooks/useTemplateManagement';
import templateData from '../data/templates.json';
import { logger } from './logger';

interface TemplateData {
  templates: Template[];
  metadata: {
    generatedAt: string;
    totalTemplates: number;
    invalidTemplates: number;
    duplicates: number;
    missingFiles: number;
  };
}

/**
 * テンプレートを同期的に読み込む
 * 
 * 静的importを使用することで、ビルド時にバンドルされ、
 * 開発環境でも本番環境でも高速に読み込めます。
 */
export const loadTemplates = (): Template[] => {
  try {
    const data = templateData as TemplateData;
    logger.debug('テンプレート読み込み完了', { 
      count: data.templates.length 
    }, 'templateLoader');
    return data.templates;
  } catch (error) {
    logger.error('テンプレート読み込み失敗', error, 'templateLoader');
    return [];
  }
};