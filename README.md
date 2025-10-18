# VTuber Tools Portal - README

## 概要

VTuber Tools Portalは、VTuberの活動を支援するWebツールスイートです。イベント用素材制作とサムネイル自動生成の2つの主要ツールを提供し、デスクトップとモバイルの両方で最適化されたユーザーエクスペリエンスを提供します。

## 主な機能

### 🎨 イベント用素材制作
- **レイヤーベース編集**: テキスト、画像、図形のレイヤーを自由に配置・編集
- **リアルタイムプレビュー**: 変更を即座に確認
- **高品質エクスポート**: PNG、JPEG、SVG形式での出力
- **モバイル最適化**: タッチ操作に最適化されたインターフェース

### 🖼️ サムネイル自動生成
- **テンプレートベース**: 事前定義されたテンプレートを使用
- **カスタマイズ可能**: テキスト、色、レイアウトを自由に調整
- **一括生成**: 複数のサムネイルを効率的に作成
- **プレビュー機能**: 生成前に結果を確認

### 📱 モバイル対応
- **レスポンシブデザイン**: あらゆるデバイスサイズに対応
- **タッチ操作**: 直感的なタッチインターフェース
- **クイックアクセス**: 頻繁に使用する機能への簡単アクセス
- **表示設定**: ズーム、グリッド、ガイドラインの調整

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **テスト**: Jest, React Testing Library, Playwright
- **開発ツール**: Storybook
- **パッケージマネージャー**: pnpm

## クイックスタート

### 前提条件

- Node.js 18.0以上
- pnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/vtuber-tools-portal.git

# ディレクトリに移動
cd vtuber-tools-portal

# 依存関係をインストール
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 利用可能なスクリプト

```bash
# 開発サーバーの起動
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバーの起動
pnpm start

# ユニットテストの実行
pnpm test

# E2Eテストの実行
pnpm test:e2e

# Storybookの起動
pnpm storybook

# リントの実行
pnpm lint
```

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

## 主要コンポーネント

### MobileControls
モバイル用のレイヤー操作コントロール

```typescript
<MobileControls
  selectedLayer={selectedLayer}
  onUpdateLayer={handleUpdateLayer}
/>
```

### MobileDisplaySettings
モバイル用の表示設定

```typescript
<MobileDisplaySettings
  zoom={zoom}
  onZoomChange={setZoom}
  showGrid={showGrid}
  onShowGridChange={setShowGrid}
/>
```

## テスト

### ユニットテスト
```bash
pnpm test
```

### E2Eテスト
```bash
pnpm test:e2e
```

### Storybook
```bash
pnpm storybook
```

## デプロイメント

### Vercel（推奨）

1. Vercelアカウントを作成
2. プロジェクトをインポート
3. 自動デプロイが設定されます

### その他のプラットフォーム

```bash
# ビルド
pnpm build

# 静的ファイルの生成
pnpm export
```

## 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## サポート

- **ドキュメント**: [docs/](docs/) ディレクトリを参照
- **問題報告**: [GitHub Issues](https://github.com/your-username/vtuber-tools-portal/issues)
- **機能要望**: [GitHub Discussions](https://github.com/your-username/vtuber-tools-portal/discussions)

## 更新履歴

### v1.3.0 (最新)
- モバイル表示設定の追加
- セーフエリア表示機能
- アスペクト比ガイド機能
- グリッドサイズ調整機能

### v1.2.0
- 表示設定機能の追加
- モバイルコントロールの改善
- タブレイアウトの最適化

### v1.1.0
- モバイルコントロールの追加
- レイヤー操作の改善
- ユーザビリティの向上

### v1.0.0
- 初回リリース
- 基本的なレイヤー操作
- エクスポート機能

## 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Playwright](https://playwright.dev/) - E2Eテスト
- [Storybook](https://storybook.js.org/) - コンポーネント開発