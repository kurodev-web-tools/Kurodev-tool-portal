/**
 * アクセシビリティ向上用のユーティリティ関数
 */

/**
 * ARIA属性の生成
 */
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-owns'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-level'?: number;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-colcount'?: number;
  'aria-rowcount'?: number;
  'aria-colindex'?: number;
  'aria-rowindex'?: number;
  'aria-colspan'?: number;
  'aria-rowspan'?: number;
  'aria-activedescendant'?: string;
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-multiline'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-readonly'?: boolean;
  'aria-placeholder'?: string;
  'aria-pressed'?: boolean;
  'aria-secret'?: boolean;
  'aria-grabbed'?: boolean;
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
  'aria-flowto'?: string;
  'aria-modal'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  'aria-roledescription'?: string;
  'aria-keyshortcuts'?: string;
  'aria-details'?: string;
  'aria-errormessage'?: string;
}

/**
 * ロール属性の生成
 */
export type RoleAttribute = 
  | 'button'
  | 'link'
  | 'textbox'
  | 'checkbox'
  | 'radio'
  | 'slider'
  | 'progressbar'
  | 'status'
  | 'alert'
  | 'alertdialog'
  | 'dialog'
  | 'menu'
  | 'menuitem'
  | 'menubar'
  | 'tab'
  | 'tablist'
  | 'tabpanel'
  | 'tree'
  | 'treeitem'
  | 'grid'
  | 'gridcell'
  | 'columnheader'
  | 'rowheader'
  | 'table'
  | 'row'
  | 'cell'
  | 'banner'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'search'
  | 'region'
  | 'article'
  | 'section'
  | 'heading'
  | 'list'
  | 'listitem'
  | 'img'
  | 'presentation'
  | 'none';

/**
 * アクセシビリティ属性の生成
 */
export function createAccessibilityAttributes(
  role?: RoleAttribute,
  aria?: Partial<AriaAttributes>,
  additional?: Record<string, any>
): Record<string, any> {
  const attrs: Record<string, any> = {};

  if (role) {
    attrs.role = role;
  }

  if (aria) {
    Object.entries(aria).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        attrs[key] = value;
      }
    });
  }

  if (additional) {
    Object.assign(attrs, additional);
  }

  return attrs;
}

/**
 * キーボードナビゲーション用のイベントハンドラー
 */
export function createKeyboardHandler(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
  onHome?: () => void,
  onEnd?: () => void
) {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case 'Home':
        if (onHome) {
          event.preventDefault();
          onHome();
        }
        break;
      case 'End':
        if (onEnd) {
          event.preventDefault();
          onEnd();
        }
        break;
    }
  };
}

/**
 * フォーカス管理
 */
export class FocusManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;

  constructor(container?: HTMLElement) {
    if (container) {
      this.updateFocusableElements(container);
    }
  }

  updateFocusableElements(container: HTMLElement): void {
    this.focusableElements = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
  }

  focusNext(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  focusPrevious(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentIndex = this.currentIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentIndex - 1;
    this.focusableElements[this.currentIndex]?.focus();
  }

  focusFirst(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentIndex = 0;
    this.focusableElements[0]?.focus();
  }

  focusLast(): void {
    if (this.focusableElements.length === 0) return;
    
    this.currentIndex = this.focusableElements.length - 1;
    this.focusableElements[this.currentIndex]?.focus();
  }

  getCurrentElement(): HTMLElement | null {
    return this.focusableElements[this.currentIndex] || null;
  }
}

/**
 * スクリーンリーダー用のアナウンス
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // アナウンス後に要素を削除
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * カラーコントラストの計算
 */
export function calculateContrast(color1: string, color2: string): number {
  // 簡易的なコントラスト計算（実際の実装ではより詳細な計算が必要）
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * アクセシビリティチェック
 */
export function checkAccessibility(element: HTMLElement): {
  hasLabel: boolean;
  hasRole: boolean;
  hasKeyboardSupport: boolean;
  hasColorContrast: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // ラベルのチェック
  const hasLabel = !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.querySelector('label') ||
    element.textContent?.trim()
  );
  
  if (!hasLabel) {
    issues.push('要素にラベルがありません');
  }
  
  // ロールのチェック
  const hasRole = !!element.getAttribute('role');
  
  // キーボードサポートのチェック
  const hasKeyboardSupport = !!(
    element.getAttribute('tabindex') !== '-1' ||
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT'
  );
  
  if (!hasKeyboardSupport) {
    issues.push('キーボードでアクセスできません');
  }
  
  // カラーコントラストのチェック（簡易版）
  const hasColorContrast = true; // 実際の実装では詳細なチェックが必要
  
  return {
    hasLabel,
    hasRole,
    hasKeyboardSupport,
    hasColorContrast,
    issues,
  };
}
