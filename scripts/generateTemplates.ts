import fs from 'fs';
import path from 'path';
import { ThumbnailTemplate } from '../src/types/template';
import { scanTemplates } from '../src/lib/templateScanner';

const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'templates.json');
const TEMPLATES_BASE_DIR = path.join(process.cwd(), 'public', 'templates', 'asset-creator');

// 既存のハードコードされたテンプレートデータを解析
const analyzeExistingTemplates = (): { [key: string]: ThumbnailTemplate } => {
  const existingTemplates: { [key: string]: ThumbnailTemplate } = {};
  
  // TemplateSelector.tsxから既存のテンプレートデータを読み込み
  try {
    const templateSelectorPath = path.join(process.cwd(), 'src', 'app', 'tools', 'asset-creator', 'components', 'TemplateSelector.tsx');
    const content = fs.readFileSync(templateSelectorPath, 'utf-8');
    
    // templates配列の部分を抽出（簡易的な実装）
    const templatesMatch = content.match(/export const templates: ThumbnailTemplate\[\] = \[([\s\S]*?)\];/);
    if (templatesMatch) {
      console.log('Found existing hardcoded templates in TemplateSelector.tsx');
      // 実際の解析は複雑なので、ここでは基本的な情報のみ取得
    }
  } catch (error) {
    console.warn('Could not analyze existing templates:', error);
  }
  
  return existingTemplates;
};

// ファイルの存在確認と整合性チェック
const validateTemplates = (templates: ThumbnailTemplate[]): { valid: ThumbnailTemplate[], invalid: ThumbnailTemplate[] } => {
  const valid: ThumbnailTemplate[] = [];
  const invalid: ThumbnailTemplate[] = [];
  
  for (const template of templates) {
    // basePathを除いた実際のファイルパスで存在確認
    const actualImagePath = template.initialImageSrc.replace(/^\/Kurodev-tool-portal/, '');
    const imagePath = path.join(process.cwd(), 'public', actualImagePath);
    if (fs.existsSync(imagePath)) {
      valid.push(template);
    } else {
      console.warn(`Template image not found: ${template.initialImageSrc} (checked: ${imagePath})`);
      invalid.push(template);
    }
  }
  
  return { valid, invalid };
};

// 既存データとの整合性チェック
const checkDataConsistency = (scannedTemplates: ThumbnailTemplate[], existingTemplates: { [key: string]: ThumbnailTemplate }) => {
  console.log('\n=== Data Consistency Check ===');
  console.log(`Scanned templates: ${scannedTemplates.length}`);
  console.log(`Existing templates: ${Object.keys(existingTemplates).length}`);
  
  // 重複チェック
  const scannedIds = new Set(scannedTemplates.map(t => t.id));
  const existingIds = new Set(Object.keys(existingTemplates));
  
  const duplicates = [...scannedIds].filter(id => existingIds.has(id));
  if (duplicates.length > 0) {
    console.warn(`Found ${duplicates.length} duplicate template IDs:`, duplicates);
  }
  
  // 不足しているファイルの特定
  const missingFiles: string[] = [];
  for (const template of scannedTemplates) {
    // basePathを除いた実際のファイルパスで存在確認
    const actualImagePath = template.initialImageSrc.replace(/^\/Kurodev-tool-portal/, '');
    const imagePath = path.join(process.cwd(), 'public', actualImagePath);
    if (!fs.existsSync(imagePath)) {
      missingFiles.push(template.initialImageSrc);
    }
  }
  
  if (missingFiles.length > 0) {
    console.warn(`Found ${missingFiles.length} missing template images:`, missingFiles);
  }
  
  return { duplicates, missingFiles };
};

export const generateTemplates = async () => {
  console.log('Generating templates...');
  try {
    // 既存のテンプレートデータを解析
    const existingTemplates = analyzeExistingTemplates();
    
    // ファイルシステムからテンプレートをスキャン
    const scannedTemplates: ThumbnailTemplate[] = await scanTemplates();
    
    // 整合性チェック
    const consistency = checkDataConsistency(scannedTemplates, existingTemplates);
    
    // テンプレートの検証
    const validation = validateTemplates(scannedTemplates);
    
    console.log(`\n=== Validation Results ===`);
    console.log(`Valid templates: ${validation.valid.length}`);
    console.log(`Invalid templates: ${validation.invalid.length}`);
    
    if (validation.invalid.length > 0) {
      console.warn('Some templates have missing images and will be excluded from the output.');
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 有効なテンプレートのみを出力
    const outputData = {
      templates: validation.valid,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalTemplates: validation.valid.length,
        invalidTemplates: validation.invalid.length,
        duplicates: consistency.duplicates.length,
        missingFiles: consistency.missingFiles.length
      }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`\nSuccessfully generated ${validation.valid.length} templates to ${OUTPUT_FILE}`);
    
    if (validation.invalid.length > 0) {
      console.log(`\nExcluded ${validation.invalid.length} invalid templates (missing images)`);
    }
    
  } catch (error) {
    console.error('Failed to generate templates:', error);
    process.exit(1);
  }
};

generateTemplates();