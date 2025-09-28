# 開発者向けドキュメント

## 📋 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [プロジェクト構造](#プロジェクト構造)
- [開発ガイドライン](#開発ガイドライン)
- [デバッグ機能](#デバッグ機能)
- [テスト](#テスト)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [デプロイメント](#デプロイメント)

## 🚀 開発環境のセットアップ

### 必要な環境

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上
- Git

### セットアップ手順

```bash
# リポジトリのクローン
git clone <repository-url>
cd vtuber-tools-portal

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# テストの実行
pnpm test
```

### 環境変数

`.env.local` ファイルを作成し、以下の変数を設定してください：

```env
# 開発環境
NODE_ENV=development

# API設定
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 認証設定
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# 外部サービス（必要に応じて）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── tools/             # ツールページ
│   └── api/               # API ルート
├── components/            # React コンポーネント
│   ├── ui/               # UI コンポーネント
│   ├── dev/              # 開発者向けコンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── lib/                  # ユーティリティ関数
│   ├── logger.ts         # ログシステム
│   ├── validation.ts     # バリデーション
│   └── test-utils.tsx    # テストユーティリティ
├── types/                # TypeScript 型定義
│   └── common.ts         # 共通型定義
├── hooks/                # カスタムフック
├── contexts/             # React Context
└── styles/               # スタイルファイル
    └── animations.css    # アニメーション
```

## 📝 開発ガイドライン

### コーディング規約

#### TypeScript

- 厳密な型定義を使用
- `any` 型の使用を避ける
- インターフェースとタイプエイリアスを適切に使い分ける
- ジェネリクスを活用する

```typescript
// ✅ 良い例
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser<T extends User>(id: string): Promise<T> {
  // 実装
}

// ❌ 悪い例
function getUser(id: any): Promise<any> {
  // 実装
}
```

#### React

- 関数コンポーネントを使用
- カスタムフックでロジックを分離
- 適切な依存関係配列を設定
- メモ化を適切に使用

```typescript
// ✅ 良い例
const MyComponent: React.FC<Props> = ({ data }) => {
  const [state, setState] = useState<State>(initialState);
  
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  const handleClick = useCallback(() => {
    // 処理
  }, []);
  
  return <div onClick={handleClick}>{memoizedValue}</div>;
};

// ❌ 悪い例
const MyComponent = ({ data }) => {
  const [state, setState] = useState();
  
  const value = expensiveCalculation(data); // 毎回実行される
  
  return <div>{value}</div>;
};
```

#### CSS / Styling

- Tailwind CSS のユーティリティクラスを優先
- カスタムCSS は最小限に
- レスポンシブデザインを考慮
- アクセシビリティを重視

```css
/* ✅ 良い例 */
.card {
  @apply bg-gray-900 border border-gray-800 rounded-lg p-4;
  @apply hover:bg-gray-800 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

/* ❌ 悪い例 */
.card {
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
}
```

### ファイル命名規則

- コンポーネント: `PascalCase` (例: `ToolCard.tsx`)
- フック: `camelCase` with `use` prefix (例: `useToolData.ts`)
- ユーティリティ: `camelCase` (例: `formatDate.ts`)
- 型定義: `camelCase` (例: `common.ts`)
- テスト: `*.test.ts` または `*.test.tsx`

### コミットメッセージ

```
<type>(<scope>): <description>

<body>

<footer>
```

例:
```
feat(tools): add new tool card component

- Implement responsive design
- Add accessibility features
- Include unit tests

Closes #123
```

## 🐛 デバッグ機能

### ログシステム

統一されたログシステムを使用してデバッグ情報を出力します。

```typescript
import { logger, useLogger } from '@/lib/logger';

// 基本的な使用方法
logger.debug('Debug message', { data: 'test' }, 'ComponentName');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// React コンポーネント内での使用
const MyComponent = () => {
  const log = useLogger('MyComponent');
  
  useEffect(() => {
    log.info('Component mounted');
  }, []);
  
  return <div>Content</div>;
};
```

### デバッグパネル

開発環境では、右下のバグアイコンをクリックしてデバッグパネルを開くことができます。

**機能:**
- ログの表示・フィルタリング
- メモリ使用量の監視
- パフォーマンス指標の表示
- ログのエクスポート・クリア

**キーボードショートカット:**
- `Ctrl + Shift + D`: デバッグパネルの切り替え

### パフォーマンス測定

```typescript
import { logger } from '@/lib/logger';

// 実行時間の測定
logger.time('operation');
// 処理
logger.timeEnd('operation');

// メモリ使用量の測定
logger.measureMemory('after-operation');
```

## 🧪 テスト

### テストの実行

```bash
# 全テストの実行
pnpm test

# ウォッチモード
pnpm test:watch

# カバレッジレポート
pnpm test:coverage

# 特定のファイルのテスト
pnpm test ToolCard.test.tsx
```

### テストの書き方

#### コンポーネントテスト

```typescript
import { render, screen, fireEvent } from '@/lib/test-utils';
import { ToolCard } from '../tool-card';
import { mockData } from '@/lib/test-utils';

describe('ToolCard', () => {
  it('ツールカードが正しくレンダリングされる', () => {
    render(<ToolCard {...mockData.toolItem} />);
    
    expect(screen.getByText(mockData.toolItem.title)).toBeInTheDocument();
  });
  
  it('クリック時にonClickが呼ばれる', () => {
    const mockOnClick = jest.fn();
    render(<ToolCard {...mockData.toolItem} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockData.toolItem);
  });
});
```

#### フックテスト

```typescript
import { renderHook } from '@/lib/test-utils';
import { useToolData } from '../use-tool-data';

describe('useToolData', () => {
  it('ツールデータを正しく取得する', () => {
    const { result } = renderHook(() => useToolData('tool-id'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
```

#### ユーティリティ関数テスト

```typescript
import { formatDate } from '../format-date';

describe('formatDate', () => {
  it('日付を正しい形式でフォーマットする', () => {
    const date = new Date('2025-01-28T00:00:00Z');
    const formatted = formatDate(date);
    
    expect(formatted).toBe('2025年1月28日');
  });
});
```

### テストのベストプラクティス

1. **AAA パターン**: Arrange, Act, Assert
2. **テストの独立性**: 各テストは独立して実行可能
3. **モックの適切な使用**: 外部依存関係をモック
4. **意味のあるアサーション**: 何をテストしているかを明確に
5. **エッジケースのテスト**: 境界値やエラーケースもテスト

## ⚡ パフォーマンス最適化

### 画像最適化

```typescript
import { OptimizedImage } from '@/components/ui/optimized-image';

// WebP 形式への自動変換
<OptimizedImage
  src="/images/example.jpg"
  alt="Example image"
  width={800}
  height={600}
  priority={false}
/>
```

### アニメーション最適化

```css
/* GPU 加速を使用 */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 軽量なアニメーション */
.light-animation {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### バンドルサイズの最適化

```typescript
// 動的インポート
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});

// ツリーシェイキング
import { specificFunction } from 'large-library';
// 全体をインポートしない
```

## 🚀 デプロイメント

### 本番環境のビルド

```bash
# 本番用ビルド
pnpm build

# ビルドの確認
pnpm start
```

### 環境変数の設定

本番環境では以下の環境変数を設定してください：

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

### パフォーマンス監視

本番環境では以下の指標を監視してください：

- **Core Web Vitals**: LCP, FID, CLS
- **バンドルサイズ**: 各ページの JavaScript サイズ
- **画像最適化**: WebP 変換の効果
- **エラー率**: クライアント・サーバーエラー

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)

## 🤝 コントリビューション

1. イシューを作成または既存のイシューを確認
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成
5. コードレビューを受ける
6. マージ

### プルリクエストのテンプレート

```markdown
## 変更内容
- 

## テスト
- [ ] 単体テストを追加/更新
- [ ] 統合テストを実行
- [ ] 手動テストを実行

## チェックリスト
- [ ] コードレビューを完了
- [ ] ドキュメントを更新
- [ ] 破壊的変更がないことを確認
```

---

*最終更新: 2025年1月28日*
