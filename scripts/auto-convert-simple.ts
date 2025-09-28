import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

interface ConversionOptions {
  inputDir: string;
  outputDir: string;
  quality?: number;
}

class SimpleAutoConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions) {
    this.options = {
      quality: 85,
      ...options
    };
  }

  async convertAllImages(): Promise<void> {
    const { inputDir, outputDir } = this.options;
    
    console.log(`🔄 Converting all images from: ${inputDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });
    
    // ディレクトリを再帰的に探索
    await this.processDirectory(inputDir, outputDir);
    
    console.log('✅ Conversion completed!');
  }

  private async processDirectory(inputDir: string, outputDir: string): Promise<void> {
    const entries = await fs.readdir(inputDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const inputPath = path.join(inputDir, entry.name);
      const relativePath = path.relative(this.options.inputDir, inputPath);
      const outputPath = path.join(outputDir, relativePath);
      
      if (entry.isDirectory()) {
        // サブディレクトリを再帰的に処理
        await this.processDirectory(inputPath, outputPath);
      } else if (this.isImageFile(entry.name)) {
        // 画像ファイルを変換
        await this.convertImage(inputPath, outputPath);
      } else {
        // その他のファイルをコピー
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.copyFile(inputPath, outputPath);
      }
    }
  }

  private async convertImage(inputPath: string, outputPath: string): Promise<void> {
    try {
      const ext = path.extname(inputPath).toLowerCase();
      const nameWithoutExt = path.basename(inputPath, ext);
      const webpPath = path.join(path.dirname(outputPath), `${nameWithoutExt}.webp`);
      
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

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }
}

// メイン実行
async function main() {
  const templatesDir = path.resolve('public', 'templates');
  const outputDir = path.resolve('public', 'templates-webp');
  
  const converter = new SimpleAutoConverter({
    inputDir: templatesDir,
    outputDir: outputDir,
    quality: 85
  });
  
  await converter.convertAllImages();
}

// スクリプト実行
main().catch(console.error);

export { SimpleAutoConverter };
