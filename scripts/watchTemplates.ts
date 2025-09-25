#!/usr/bin/env tsx

import chokidar from 'chokidar';
import { generateTemplates } from './generateTemplates.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, '..', 'public', 'templates', 'asset-creator');

console.log('🔍 テンプレート監視を開始します...');
console.log(`監視ディレクトリ: ${TEMPLATE_DIR}`);

// テンプレート生成関数
const regenerateTemplates = async () => {
  try {
    console.log('📝 テンプレートを再生成中...');
    await generateTemplates();
    console.log('✅ テンプレートの再生成が完了しました');
  } catch (error) {
    console.error('❌ テンプレートの再生成に失敗しました:', error);
  }
};

// 初回生成
regenerateTemplates();

// ファイル監視を開始
const watcher = chokidar.watch(TEMPLATE_DIR, {
  ignored: /(^|[\/\\])\../, // 隠しファイルを無視
  persistent: true,
  ignoreInitial: true, // 初回スキャンを無視（既に実行済み）
});

watcher
  .on('add', (filePath) => {
    console.log(`➕ ファイルが追加されました: ${path.relative(TEMPLATE_DIR, filePath)}`);
    regenerateTemplates();
  })
  .on('unlink', (filePath) => {
    console.log(`➖ ファイルが削除されました: ${path.relative(TEMPLATE_DIR, filePath)}`);
    regenerateTemplates();
  })
  .on('addDir', (dirPath) => {
    console.log(`📁 ディレクトリが追加されました: ${path.relative(TEMPLATE_DIR, dirPath)}`);
    regenerateTemplates();
  })
  .on('unlinkDir', (dirPath) => {
    console.log(`🗑️ ディレクトリが削除されました: ${path.relative(TEMPLATE_DIR, dirPath)}`);
    regenerateTemplates();
  })
  .on('error', (error) => {
    console.error('❌ 監視エラー:', error);
  });

console.log('👀 テンプレートディレクトリの変更を監視中...');
console.log('終了するには Ctrl+C を押してください');

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  console.log('\n🛑 監視を停止します...');
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 監視を停止します...');
  watcher.close();
  process.exit(0);
});
