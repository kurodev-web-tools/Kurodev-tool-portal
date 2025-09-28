/**
 * テスト用ユーティリティ
 * React Testing Library と Jest の設定
 */

// テストライブラリがインストールされていないため一時的に無効化
/*
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers';
import { AuthProvider } from '@/contexts/AuthContext';
import { DebugPanelProvider } from '@/components/dev/debug-panel-provider';

// テスト用のプロバイダー
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <DebugPanelProvider>
          {children}
        </DebugPanelProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// カスタムレンダー関数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// モックデータ
export const mockData = {
  // ツールアイテムのモック
  toolItem: {
    id: 'test-tool-1',
    title: 'テストツール',
    description: 'テスト用のツールです',
    status: 'released' as const,
    category: 'planning' as const,
    href: '/tools/test-tool',
    icon: 'test-icon',
    tags: ['テスト', 'デモ'],
    usageCount: 10,
    rating: 4.5,
    lastUsed: '2025-01-28T00:00:00Z',
    isFavorite: false,
  },
  
  // スイートアイテムのモック
  suiteItem: {
    id: 'test-suite-1',
    title: 'テストスイート',
    description: 'テスト用のスイートです',
    status: 'released' as const,
    category: 'planning' as const,
    href: '/suites/test-suite',
    icon: 'test-suite-icon',
    tags: ['テスト', 'スイート'],
    usageCount: 5,
    rating: 4.0,
    lastUsed: '2025-01-28T00:00:00Z',
    isFavorite: true,
    tools: [],
    progress: 75,
    totalTools: 4,
    completedTools: 3,
  },
  
  // ユーザー設定のモック
  userSettings: {
    theme: 'dark' as const,
    language: 'ja' as const,
    notifications: {
      email: true,
      push: false,
      updates: true,
    },
    preferences: {
      defaultView: 'grid' as const,
      itemsPerPage: 12,
      showFavorites: true,
    },
  },
  
  // 統計データのモック
  statsData: {
    totalTools: 15,
    totalSuites: 4,
    releasedTools: 10,
    betaTools: 3,
    developmentTools: 2,
    totalUsage: 150,
    averageRating: 4.2,
  },
};

// テスト用のヘルパー関数
export const testHelpers = {
  // 非同期処理の待機
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // モック関数の作成
  createMockFunction: <T extends (...args: any[]) => any>(fn?: T) => {
    const mockFn = jest.fn(fn);
    return mockFn;
  },
  
  // ローカルストレージのモック
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          Object.keys(store).forEach(key => delete store[key]);
        }),
      },
      writable: true,
    });
  },
  
  // セッションストレージのモック
  mockSessionStorage: () => {
    const store: Record<string, string> = {};
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          Object.keys(store).forEach(key => delete store[key]);
        }),
      },
      writable: true,
    });
  },
  
  // fetch のモック
  mockFetch: (response: any, status: number = 200) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      })
    ) as jest.Mock;
  },
  
  // エラーレスポンスのモック
  mockFetchError: (message: string = 'Network Error') => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error(message))
    ) as jest.Mock;
  },
  
  // ファイルのモック
  createMockFile: (name: string, type: string, size: number = 1024) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },
  
  // イベントのモック
  createMockEvent: (type: string, properties: Record<string, any> = {}) => {
    const event = new Event(type);
    Object.assign(event, properties);
    return event;
  },
  
  // キーボードイベントのモック
  createMockKeyboardEvent: (key: string, properties: Record<string, any> = {}) => {
    const event = new KeyboardEvent('keydown', { key });
    Object.assign(event, properties);
    return event;
  },
  
  // マウスイベントのモック
  createMockMouseEvent: (type: string, properties: Record<string, any> = {}) => {
    const event = new MouseEvent(type);
    Object.assign(event, properties);
    return event;
  },
};

// テスト用のカスタムフック
export const testHooks = {
  // カスタムフックのテスト用ラッパー
  renderHook: <T,>(hook: () => T) => {
    const TestComponent = () => {
      const result = hook();
      return <div data-testid="hook-result">{JSON.stringify(result)}</div>;
    };
    
    const { getByTestId } = customRender(<TestComponent />);
    const result = JSON.parse(getByTestId('hook-result').textContent || '{}');
    return { result };
  },
};

// アサーション用のヘルパー
export const assertions = {
  // 要素の存在確認
  expectElementToExist: (container: HTMLElement, testId: string) => {
    expect(container.querySelector(`[data-testid="${testId}"]`)).toBeInTheDocument();
  },
  
  // 要素の不在確認
  expectElementNotToExist: (container: HTMLElement, testId: string) => {
    expect(container.querySelector(`[data-testid="${testId}"]`)).not.toBeInTheDocument();
  },
  
  // テキストの存在確認
  expectTextToExist: (container: HTMLElement, text: string) => {
    expect(container).toHaveTextContent(text);
  },
  
  // クラスの存在確認
  expectClassToExist: (element: HTMLElement, className: string) => {
    expect(element).toHaveClass(className);
  },
  
  // 属性の存在確認
  expectAttributeToExist: (element: HTMLElement, attribute: string, value?: string) => {
    if (value) {
      expect(element).toHaveAttribute(attribute, value);
    } else {
      expect(element).toHaveAttribute(attribute);
    }
  },
};

// テスト用の定数
export const testConstants = {
  // タイムアウト
  TIMEOUT: {
    SHORT: 100,
    MEDIUM: 500,
    LONG: 1000,
  },
  
  // テストID
  TEST_IDS: {
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    BUTTON: 'button',
    INPUT: 'input',
    FORM: 'form',
    MODAL: 'modal',
    CARD: 'card',
    LIST: 'list',
    GRID: 'grid',
  },
  
  // テスト用のクラス名
  CLASS_NAMES: {
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    DISABLED: 'disabled',
    ACTIVE: 'active',
    HIDDEN: 'hidden',
  },
};

// エクスポート
export * from '@testing-library/react';
export { customRender as render };
export { AllTheProviders };
*/
