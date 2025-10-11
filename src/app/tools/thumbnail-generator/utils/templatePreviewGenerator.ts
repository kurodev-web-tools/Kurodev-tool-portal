import { ThumbnailTemplate } from '@/types/template';

/**
 * テンプレートのプレビュー画像を生成するユーティリティ
 */
export class TemplatePreviewGenerator {
  /**
   * テンプレートからプレビュー画像を生成
   */
  static async generatePreview(template: ThumbnailTemplate): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // プレビューサイズ（小さいサイズで生成）
    const previewWidth = 200;
    const previewHeight = 150;
    
    canvas.width = previewWidth;
    canvas.height = previewHeight;

    // 背景を描画
    this.drawBackground(ctx, template.layout.background, previewWidth, previewHeight);

    // オブジェクトを描画
    for (const obj of template.layout.objects) {
      this.drawObject(ctx, obj, template, previewWidth, previewHeight);
    }

    return canvas.toDataURL('image/png');
  }

  /**
   * 背景を描画
   */
  private static drawBackground(
    ctx: CanvasRenderingContext2D, 
    background: any, 
    width: number, 
    height: number
  ) {
    if (background.type === 'color') {
      ctx.fillStyle = background.value;
      ctx.fillRect(0, 0, width, height);
    } else if (background.type === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, background.value.start);
      gradient.addColorStop(1, background.value.end);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * オブジェクトを描画
   */
  private static drawObject(
    ctx: CanvasRenderingContext2D, 
    obj: any, 
    template: ThumbnailTemplate, 
    canvasWidth: number, 
    canvasHeight: number
  ) {
    // オブジェクトの位置とサイズをプレビューサイズにスケール
    const scaleX = canvasWidth / 1000; // 仮想的なキャンバスサイズ
    const scaleY = canvasHeight / 750;
    
    const x = obj.position.x * scaleX;
    const y = obj.position.y * scaleY;
    const width = obj.position.width * scaleX;
    const height = obj.position.height * scaleY;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((obj.position.rotation || 0) * Math.PI / 180);

    if (obj.type === 'text' && obj.content) {
      this.drawText(ctx, obj.content, template, width, height);
    } else if (obj.type === 'shape' && obj.content) {
      this.drawShape(ctx, obj.content, width, height);
    } else if (obj.type === 'image' && obj.content) {
      this.drawImagePlaceholder(ctx, width, height);
    }

    ctx.restore();
  }

  /**
   * テキストを描画
   */
  private static drawText(
    ctx: CanvasRenderingContext2D, 
    content: any, 
    template: ThumbnailTemplate, 
    width: number, 
    height: number
  ) {
    ctx.fillStyle = content.color || template.colorPalette.text;
    ctx.font = `${content.fontSize || template.fontSettings.size} ${content.fontFamily || template.fontSettings.family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // テキストを中央に配置
    const text = content.text || 'テキスト';
    ctx.fillText(text, 0, 0);
  }

  /**
   * 図形を描画
   */
  private static drawShape(
    ctx: CanvasRenderingContext2D, 
    content: any, 
    width: number, 
    height: number
  ) {
    ctx.fillStyle = content.backgroundColor || '#cccccc';
    ctx.strokeStyle = content.borderColor || '#000000';
    ctx.lineWidth = content.borderWidth || 2;

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (content.shapeType) {
      case 'rectangle':
        ctx.fillRect(-halfWidth, -halfHeight, width, height);
        ctx.strokeRect(-halfWidth, -halfHeight, width, height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(halfWidth, halfHeight), 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -halfHeight);
        ctx.lineTo(-halfWidth, halfHeight);
        ctx.lineTo(halfWidth, halfHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'star':
        this.drawStar(ctx, 0, 0, Math.min(halfWidth, halfHeight), 5);
        break;
      case 'heart':
        this.drawHeart(ctx, 0, 0, Math.min(halfWidth, halfHeight));
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -halfHeight);
        ctx.lineTo(halfWidth, 0);
        ctx.lineTo(0, halfHeight);
        ctx.lineTo(-halfWidth, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      default:
        // デフォルトは矩形
        ctx.fillRect(-halfWidth, -halfHeight, width, height);
        ctx.strokeRect(-halfWidth, -halfHeight, width, height);
    }
  }

  /**
   * 星形を描画
   */
  private static drawStar(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    radius: number, 
    points: number
  ) {
    const outerRadius = radius;
    const innerRadius = radius * 0.5;
    
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * ハート形を描画
   */
  private static drawHeart(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    size: number
  ) {
    const scale = size / 20;
    ctx.beginPath();
    ctx.moveTo(x, y + 5 * scale);
    ctx.bezierCurveTo(x, y, x - 5 * scale, y, x - 5 * scale, y + 5 * scale);
    ctx.bezierCurveTo(x - 5 * scale, y + 10 * scale, x, y + 10 * scale, x, y + 15 * scale);
    ctx.bezierCurveTo(x, y + 10 * scale, x + 5 * scale, y + 10 * scale, x + 5 * scale, y + 5 * scale);
    ctx.bezierCurveTo(x + 5 * scale, y, x, y, x, y + 5 * scale);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 画像プレースホルダーを描画
   */
  private static drawImagePlaceholder(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ) {
    // 画像プレースホルダー（グレーの矩形）
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // 枠線
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    // 画像アイコン（簡易版）
    ctx.fillStyle = '#999999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', 0, 0);
  }
}


