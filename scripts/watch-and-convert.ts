import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import * as chokidar from 'chokidar';

interface ConversionOptions {
  inputDir: string;
  outputDir: string;
  quality?: number;
}

class AutoWebPConverter {
  private options: ConversionOptions;
  private watcher: any | null = null;

  constructor(options: ConversionOptions) {
    this.options = {
      quality: 85,
      ...options
    };
  }

  async startWatching(): Promise<void> {
    const { inputDir, outputDir } = this.options;
    
    console.log(`🔍 Watching for changes in: ${inputDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📂 Input directory exists: ${await fs.access(inputDir).then(() => true).catch(() => false)}`);
    console.log(`📂 Output directory exists: ${await fs.access(outputDir).then(() => true).catch(() => false)}`);
    
    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });
    
    // ファイル監視を開始
    this.watcher = chokidar.watch(inputDir, {
      ignored: /(^|[\/\\])\../, // ドットファイルを無視
      persistent: true,
      ignoreInitial: false, // 初期スキャンも実行
      depth: 10, // 深いディレクトリも監視
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath: string) => {
        console.log(`📁 ADD event: ${filePath}`);
        this.handleFileChange(filePath, 'add');
      })
      .on('change', (filePath: string) => {
        console.log(`📁 CHANGE event: ${filePath}`);
        this.handleFileChange(filePath, 'change');
      })
      .on('unlink', (filePath: string) => {
        console.log(`📁 UNLINK event: ${filePath}`);
        this.handleFileRemoval(filePath);
      })
      .on('error', (error: any) => console.error('❌ Watcher error:', error))
      .on('ready', () => {
        console.log('✅ File watcher is ready');
        console.log('🔍 Watching for file changes...');
        console.log('💡 Try adding a new image file to test the conversion');
      });
  }

  private async handleFileChange(filePath: string, event: string): Promise<void> {
    try {
      console.log(`📁 ${event.toUpperCase()}: ${filePath}`);
      
      // ファイルが存在するかチェック
      await fs.access(filePath);
      
      // 画像ファイルかチェック
      if (!this.isImageFile(filePath)) {
        console.log(`⚠️  Skipping non-image file: ${filePath}`);
        return;
      }

      // WebPに変換
      await this.convertToWebP(filePath);
      
    } catch (error) {
      console.error(`❌ Error handling file change for ${filePath}:`, error);
    }
  }

  private async handleFileRemoval(filePath: string): Promise<void> {
    try {
      const relativePath = path.relative(this.options.inputDir, filePath);
      const webpPath = path.join(this.options.outputDir, relativePath).replace(/\.[^/.]+$/, '.webp');
      
      // 対応するWebPファイルを削除
      await fs.unlink(webpPath);
      console.log(`🗑️  Removed WebP: ${webpPath}`);
      
    } catch (error: any) {
      // ファイルが存在しない場合は無視
      if (error.code !== 'ENOENT') {
        console.error(`❌ Error removing WebP file:`, error);
      }
    }
  }

  private async convertToWebP(inputPath: string): Promise<void> {
    try {
      const relativePath = path.relative(this.options.inputDir, inputPath);
      const outputPath = path.join(this.options.outputDir, relativePath);
      const webpPath = outputPath.replace(/\.[^/.]+$/, '.webp');
      
      // 出力ディレクトリを作成
      await fs.mkdir(path.dirname(webpPath), { recursive: true });
      
      // WebPに変換
      await sharp(inputPath)
        .webp({ quality: this.options.quality })
        .toFile(webpPath);
      
      console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(webpPath)}`);
      
    } catch (error) {
      console.error(`❌ Error converting ${inputPath}:`, error);
    }
  }

  private isImageFile(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    const ext = path.extname(filePath).toLowerCase();
    return imageExtensions.includes(ext);
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      console.log('🛑 File watcher stopped');
    }
  }
}

// メイン実行
async function main() {
  const templatesDir = path.resolve('public', 'templates');
  const outputDir = path.resolve('public', 'templates-webp');
  
  const converter = new AutoWebPConverter({
    inputDir: templatesDir,
    outputDir: outputDir,
    quality: 85
  });
  
  // シグナルハンドリング
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping file watcher...');
    converter.stopWatching();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping file watcher...');
    converter.stopWatching();
    process.exit(0);
  });
  
  await converter.startWatching();
}

// スクリプト実行
main().catch(console.error);

export { AutoWebPConverter };
