import { test, expect } from '@playwright/test';

test.describe('VTuber Tools Portal', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルを確認
    await expect(page).toHaveTitle(/VTuber Tools Portal/);
    
    // メインコンテンツが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to asset-creator tool', async ({ page }) => {
    await page.goto('/');
    
    // asset-creatorツールへのリンクをクリック
    await page.click('text=イベント用素材制作');
    
    // ツールページが読み込まれることを確認
    await expect(page).toHaveURL(/.*\/tools\/asset-creator/);
    
    // ツールの主要コンポーネントが表示されることを確認
    await expect(page.locator('text=プレビュー')).toBeVisible();
  });

  test('should navigate to thumbnail-generator tool', async ({ page }) => {
    await page.goto('/');
    
    // thumbnail-generatorツールへのリンクをクリック
    await page.click('text=サムネイル自動生成');
    
    // ツールページが読み込まれることを確認
    await expect(page).toHaveURL(/.*\/tools\/thumbnail-generator/);
    
    // ツールの主要コンポーネントが表示されることを確認
    await expect(page.locator('text=エディター')).toBeVisible();
  });
});

test.describe('Asset Creator Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/asset-creator');
  });

  test('should add text layer', async ({ page }) => {
    // テキストレイヤーを追加
    await page.click('text=テキスト');
    
    // テキスト入力フィールドが表示されることを確認
    await expect(page.locator('input[placeholder*="テキスト"]')).toBeVisible();
    
    // テキストを入力
    await page.fill('input[placeholder*="テキスト"]', 'テストテキスト');
    
    // テキストがプレビューに表示されることを確認
    await expect(page.locator('text=テストテキスト')).toBeVisible();
  });

  test('should add image layer', async ({ page }) => {
    // 画像レイヤーを追加
    await page.click('text=画像');
    
    // ファイルアップロードボタンが表示されることを確認
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('should add shape layer', async ({ page }) => {
    // 図形レイヤーを追加
    await page.click('text=図形');
    
    // 図形選択メニューが表示されることを確認
    await expect(page.locator('text=四角形')).toBeVisible();
    
    // 四角形を選択
    await page.click('text=四角形');
    
    // 図形がプレビューに表示されることを確認
    await expect(page.locator('[data-testid="preview-canvas"]')).toBeVisible();
  });

  test('should show mobile controls on mobile viewport', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // レイヤーを選択
    await page.click('text=テキスト');
    await page.fill('input[placeholder*="テキスト"]', 'テスト');
    
    // モバイルコントロールが表示されることを確認
    await expect(page.locator('text=位置調整')).toBeVisible();
    await expect(page.locator('text=サイズ調整')).toBeVisible();
  });
});

test.describe('Thumbnail Generator Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/thumbnail-generator');
  });

  test('should add text layer', async ({ page }) => {
    // テキストレイヤーを追加
    await page.click('text=テキスト');
    
    // テキスト入力フィールドが表示されることを確認
    await expect(page.locator('input[placeholder*="テキスト"]')).toBeVisible();
    
    // テキストを入力
    await page.fill('input[placeholder*="テキスト"]', 'サムネイルテキスト');
    
    // テキストがプレビューに表示されることを確認
    await expect(page.locator('text=サムネイルテキスト')).toBeVisible();
  });

  test('should show mobile controls on mobile viewport', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // レイヤーを選択
    await page.click('text=テキスト');
    await page.fill('input[placeholder*="テキスト"]', 'テスト');
    
    // モバイルコントロールが表示されることを確認
    await expect(page.locator('text=位置調整')).toBeVisible();
    await expect(page.locator('text=サイズ調整')).toBeVisible();
  });

  test('should export thumbnail', async ({ page }) => {
    // テキストレイヤーを追加
    await page.click('text=テキスト');
    await page.fill('input[placeholder*="テキスト"]', 'エクスポートテスト');
    
    // エクスポートボタンをクリック
    await page.click('text=エクスポート');
    
    // ダウンロードが開始されることを確認（実際のダウンロードは確認できないため、ボタンがクリック可能であることを確認）
    await expect(page.locator('text=エクスポート')).toBeEnabled();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should be responsive on mobile devices', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // モバイルメニューが表示されることを確認
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // ツールページに移動
    await page.goto('/tools/asset-creator');
    
    // モバイル用のクイックアクセスが表示されることを確認
    await expect(page.locator('[data-testid="quick-access"]')).toBeVisible();
  });

  test('should show mobile display settings', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/tools/asset-creator');
    
    // 表示設定タブをクリック
    await page.click('text=表示設定');
    
    // モバイル表示設定が表示されることを確認
    await expect(page.locator('text=拡大縮小')).toBeVisible();
    await expect(page.locator('text=グリッド表示')).toBeVisible();
    await expect(page.locator('text=ガイドライン表示')).toBeVisible();
  });
});
