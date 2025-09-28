import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

interface ConversionOptions {
  inputDir: string;
  outputDir: string;
  quality?: number;
  deleteOriginals?: boolean;
}

class WebPConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions) {
    this.options = {
      quality: 80,
      deleteOriginals: false,
      ...options
    };
  }

  async convertDirectory(): Promise<void> {
    const { inputDir, outputDir, quality, deleteOriginals } = this.options;
    
    console.log(`🔄 Converting images in ${inputDir} to WebP...`);
    
    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });
    
    // ディレクトリを再帰的に探索
    await this.processDirectory(inputDir, outputDir, quality || 80, deleteOriginals || false);
    
    console.log('✅ WebP conversion completed!');
  }

  private async processDirectory(
    inputDir: string, 
    outputDir: string, 
    quality: number,
    deleteOriginals: boolean
  ): Promise<void> {
    const entries = await fs.readdir(inputDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const inputPath = path.join(inputDir, entry.name);
      const relativePath = path.relative(process.cwd(), inputPath);
      const outputPath = path.join(outputDir, entry.name);
      
      if (entry.isDirectory()) {
        // サブディレクトリを再帰的に処理
        await this.processDirectory(inputPath, outputPath, quality, deleteOriginals);
      } else if (this.isImageFile(entry.name)) {
        // 画像ファイルを変換
        await this.convertImage(inputPath, outputPath, quality, deleteOriginals);
      } else {
        // その他のファイルをコピー
        await fs.copyFile(inputPath, outputPath);
      }
    }
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  private async convertImage(
    inputPath: string, 
    outputPath: string, 
    quality: number,
    deleteOriginals: boolean
  ): Promise<void> {
    try {
      const ext = path.extname(inputPath).toLowerCase();
      const nameWithoutExt = path.basename(inputPath, ext);
      const webpPath = path.join(path.dirname(outputPath), `${nameWithoutExt}.webp`);
      
      // 出力ディレクトリを確実に作成
      await fs.mkdir(path.dirname(webpPath), { recursive: true });
      
      // 画像形式をチェック
      const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
      if (!supportedFormats.includes(ext)) {
        console.log(`⚠️  Skipping unsupported format: ${inputPath}`);
        return;
      }
      
      // WebPに変換
      await sharp(inputPath)
        .webp({ quality })
        .toFile(webpPath);
      
      console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(webpPath)}`);
      
      // 元ファイルを削除（オプション）
      if (deleteOriginals) {
        await fs.unlink(inputPath);
        console.log(`🗑️  Deleted original: ${path.basename(inputPath)}`);
      }
      
    } catch (error) {
      console.error(`❌ Error converting ${inputPath}:`, error);
    }
  }
}

// メイン実行
async function main() {
  const templatesDir = path.join(process.cwd(), 'public', 'templates');
  const outputDir = path.join(process.cwd(), 'public', 'templates-webp');
  
  const converter = new WebPConverter({
    inputDir: templatesDir,
    outputDir: outputDir,
    quality: 85, // 高品質を維持
    deleteOriginals: false // 安全のため元ファイルは保持
  });
  
  await converter.convertDirectory();
  
  console.log('\n📊 Conversion Summary:');
  console.log(`Input directory: ${templatesDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log('Quality: 85%');
  console.log('Original files: Preserved');
}

// スクリプト実行
main().catch(console.error);

export { WebPConverter };
