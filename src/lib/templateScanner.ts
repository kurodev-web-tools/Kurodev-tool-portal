import fs from 'fs';
import path from 'path';
import { Template } from '../hooks/useTemplateManagement';
import { logger } from './logger';

const TEMPLATES_BASE_DIR = path.join(process.cwd(), 'public', 'templates', 'asset-creator');

export const scanTemplates = async (): Promise<Template[]> => {
  const templates: Template[] = [];
  const aspectRatios = ['1x1', '4x3', '9x16', '16x9'];

  // basePathを環境変数から取得（本番環境では'/Kurodev-tool-portal'）
  const basePath = process.env.NODE_ENV === 'production' ? '/Kurodev-tool-portal' : '';

  // ジャンルディレクトリを動的に検出
  const genres = fs.readdirSync(TEMPLATES_BASE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  logger.debug('ジャンル検出完了', { genres: genres.join(', '), basePath }, 'templateScanner');

  for (const genre of genres) {
    for (const aspectRatio of aspectRatios) {
      const dirPath = path.join(TEMPLATES_BASE_DIR, genre, aspectRatio);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            const id = path.basename(file, ext);
            const name = `${genre} ${aspectRatio} ${id.split('_').pop()}`; // 例: simple 1x1 001
            const initialImageSrc = `${basePath}/templates/asset-creator/${genre}/${aspectRatio}/${file}`;

            templates.push({
              id,
              name,
              genre: genre, // 動的なジャンル
              initialText: 'テキスト', // デフォルト値
              initialTextColor: '#000000', // デフォルト値
              initialFontSize: '4rem', // デフォルト値
              initialImageSrc,
              supportedAspectRatios: [aspectRatio.replace('x', ':')], // '1x1' -> '1:1'
            });
          }
        }
      }
    }
  }
  return templates;
};