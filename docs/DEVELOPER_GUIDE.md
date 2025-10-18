# VTuber Tools Portal - 開発者ガイド

## プロジェクト概要

VTuber Tools Portalは、VTuberの活動を支援するWebツールスイートです。イベント用素材制作とサムネイル自動生成の2つの主要ツールを提供しています。

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **テスト**: Jest, React Testing Library, Playwright
- **開発ツール**: Storybook
- **パッケージマネージャー**: pnpm

## プロジェクト構造

```
vtuber-tools-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── tools/             # ツールページ
│   │   │   ├── asset-creator/ # イベント用素材制作
│   │   │   └── thumbnail-generator/ # サムネイル自動生成
│   │   └── globals.css        # グローバルスタイル
│   ├── components/            # コンポーネント
│   │   ├── shared/           # 共通コンポーネント
│   │   └── ui/               # UIコンポーネント
│   ├── hooks/                # カスタムフック
│   │   └── shared/           # 共通フック
│   ├── utils/                # ユーティリティ関数
│   ├── types/                # 型定義
│   └── lib/                  # ライブラリ設定
├── docs/                     # ドキュメント
├── e2e/                      # E2Eテスト
├── .storybook/              # Storybook設定
└── public/                  # 静的ファイル
```

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

### 3. テストの実行

```bash
# ユニットテスト
pnpm test

# E2Eテスト
pnpm test:e2e

# Storybook
pnpm storybook
```

## コーディング規約

### TypeScript

- 型定義は明確に記述する
- `any`型の使用を避ける
- インターフェースは`PascalCase`で命名
- 関数は`camelCase`で命名

### React

- 関数コンポーネントを使用
- カスタムフックでロジックを分離
- プロパティの型定義を明確にする
- メモ化を適切に使用

### CSS

- Tailwind CSSのユーティリティクラスを使用
- カスタムスタイルは最小限に
- レスポンシブデザインを考慮

## 共通コンポーネント

### MobileControls

モバイル用のレイヤー操作コントロールです。

**使用例**:
```typescript
<MobileControls
  selectedLayer={selectedLayer}
  onUpdateLayer={handleUpdateLayer}
/>
```

### MobileDisplaySettings

モバイル用の表示設定コンポーネントです。

**使用例**:
```typescript
<MobileDisplaySettings
  zoom={zoom}
  onZoomChange={setZoom}
  showGrid={showGrid}
  onShowGridChange={setShowGrid}
/>
```

## 共通フック

### useLayerOperations

レイヤー操作のためのカスタムフックです。

**使用例**:
```typescript
const {
  handleLayerPositionUpdate,
  handleLayerSizeUpdate,
  visibleLayers
} = useLayerOperations(layers, setLayers);
```

### useSelectedLayer

選択されたレイヤーの情報を取得するフックです。

**使用例**:
```typescript
const { selectedLayer, canEditSelectedLayer } = useSelectedLayer(layers, selectedLayerId);
```

## テスト戦略

### ユニットテスト

- フックの動作をテスト
- ユーティリティ関数のテスト
- エッジケースのテスト

### コンポーネントテスト

- レンダリングのテスト
- ユーザーインタラクションのテスト
- プロパティの変更のテスト

### E2Eテスト

- 主要なユーザーフローのテスト
- クロスブラウザテスト
- モバイルデバイステスト

## パフォーマンス最適化

### メモ化

```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const memoizedCallback = useCallback(() => {
  doSomething();
}, [dependency]);
```

### レイジーローディング

```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### 画像最適化

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={isAboveFold}
/>
```

## アクセシビリティ

### キーボードナビゲーション

- タブキーでの順序
- エンターキーでのアクション
- エスケープキーでのキャンセル

### スクリーンリーダー

- 適切な`aria-label`
- セマンティックHTML
- フォーカス管理

### 色のコントラスト

- WCAG 2.1 AA準拠
- 色だけに依存しない情報伝達

## デプロイメント

### Vercel

```bash
# 本番環境へのデプロイ
vercel --prod
```

### 環境変数

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

## トラブルシューティング

### よくある問題

1. **TypeScriptエラー**
   - 型定義を確認
   - インポートパスを確認

2. **スタイルが適用されない**
   - Tailwind CSSの設定を確認
   - クラス名のスペルを確認

3. **テストが失敗する**
   - モックの設定を確認
   - 非同期処理の待機を確認

### デバッグ

```typescript
// 開発環境でのログ
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## 貢献ガイド

### プルリクエスト

1. フィーチャーブランチを作成
2. 変更をコミット
3. テストを実行
4. プルリクエストを作成

### コミットメッセージ

```
feat: 新機能の追加
fix: バグの修正
docs: ドキュメントの更新
style: コードスタイルの変更
refactor: リファクタリング
test: テストの追加
chore: その他の変更
```

## ライセンス

MIT License

## 連絡先

- プロジェクトリーダー: [名前]
- メール: [email@example.com]
- GitHub: [github.com/username]
