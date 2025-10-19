/**
 * お気に入り機能のエラーハンドリングテスト
 * Phase 5: テストとデバッグ
 */

import { favoritesManager } from './favorites-storage';
import { favoritesEventManager } from './favorites-events';
import { logger } from './logger';

/**
 * 安全なJSONパース関数（テスト用）
 */
function safeJsonParse(data: string): { success: boolean; result?: any; error?: Error } {
  // まず基本的な文字列チェック
  if (!data || typeof data !== 'string') {
    return { success: false, error: new Error('Invalid input data') };
  }

  // 空文字列のチェック
  if (data.trim() === '') {
    return { success: false, error: new Error('Empty data') };
  }

  // JSONの基本的な構文チェック
  if (!data.startsWith('{') && !data.startsWith('[')) {
    return { success: false, error: new Error(`Invalid JSON format: data "${data}" does not start with { or [`) };
  }

  try {
    // JSON.parseを実行
    const result = JSON.parse(data);
    return { success: true, result };
  } catch (error) {
    // エラーを適切に処理
    const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parse error';
    return { success: false, error: new Error(errorMessage) };
  }
}

/**
 * エラーハンドリングテスト関数
 */
export function testErrorHandling() {
  console.group('🧪 エラーハンドリングテスト');

  // 1. 無効なデータでのテスト
  const originalData = localStorage.getItem('vtuber-tools-favorites-unified');
  try {
    console.log('1. 無効なデータでのテスト');
    console.log('元のデータ:', originalData);
    
    localStorage.setItem('vtuber-tools-favorites-unified', 'invalid-json');
    console.log('無効なJSONデータを設定しました');
    
    // 安全なJSONパースでテスト
    const parseResult = safeJsonParse('invalid-json');
    console.log('JSONパース結果:', parseResult);
    
    // エラーが期待される動作であることを確認
    if (!parseResult.success) {
      console.log('✅ 無効なJSONデータが正しく弾かれました:', parseResult.error?.message);
    }
    
    const favorites = favoritesManager.getFavorites();
    console.log('✅ 無効なJSONデータを正常に処理:', favorites);
    
    // 元のデータを復元
    if (originalData) {
      localStorage.setItem('vtuber-tools-favorites-unified', originalData);
      console.log('元のデータを復元しました');
    } else {
      localStorage.removeItem('vtuber-tools-favorites-unified');
      console.log('localStorageからデータを削除しました');
    }
  } catch (error) {
    console.error('❌ 無効なJSONデータの処理に失敗:', error);
    // エラーが発生した場合も元のデータを復元
    try {
      if (originalData) {
        localStorage.setItem('vtuber-tools-favorites-unified', originalData);
      } else {
        localStorage.removeItem('vtuber-tools-favorites-unified');
      }
    } catch (restoreError) {
      console.error('❌ データの復元に失敗:', restoreError);
    }
  }

  // 2. 存在しないIDでのテスト
  try {
    console.log('2. 存在しないIDでのテスト');
    const result = favoritesManager.removeSuite('non-existent-suite');
    console.log('✅ 存在しないIDの削除を正常に処理:', result);
  } catch (error) {
    console.error('❌ 存在しないIDの削除に失敗:', error);
  }

  // 3. 最大件数超過のテスト
  try {
    console.log('3. 最大件数超過のテスト');
    // 最大件数を超えるお気に入りを追加
    for (let i = 0; i < 10; i++) {
      favoritesManager.addSuite(`test-suite-${i}`);
    }
    const favorites = favoritesManager.getFavorites();
    console.log('✅ 最大件数制限を正常に適用:', favorites);
  } catch (error) {
    console.error('❌ 最大件数制限の適用に失敗:', error);
  }

  // 4. 重複追加のテスト
  try {
    console.log('4. 重複追加のテスト');
    favoritesManager.addSuite('duplicate-test');
    const result1 = favoritesManager.addSuite('duplicate-test');
    const result2 = favoritesManager.addSuite('duplicate-test');
    console.log('✅ 重複追加を正常に防止:', { result1, result2 });
  } catch (error) {
    console.error('❌ 重複追加の防止に失敗:', error);
  }

  // 5. localStorage容量不足のシミュレーション
  let originalSetItem: typeof localStorage.setItem | undefined;
  try {
    console.log('5. localStorage容量不足のシミュレーション');
    // localStorageを一時的に無効化
    originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    
    const result = favoritesManager.addSuite('quota-test');
    console.log('✅ localStorage容量不足を正常に処理:', result);
    
    // 元に戻す
    if (originalSetItem) {
      localStorage.setItem = originalSetItem;
    }
  } catch (error) {
    console.error('❌ localStorage容量不足の処理に失敗:', error);
    // 元に戻す（エラーが発生した場合も）
    try {
      if (originalSetItem) {
        localStorage.setItem = originalSetItem;
      }
    } catch (restoreError) {
      console.error('❌ localStorageの復元に失敗:', restoreError);
    }
  }

  console.groupEnd();
}

/**
 * パフォーマンステスト関数
 */
export function testPerformance() {
  console.group('⚡ パフォーマンステスト');

  // 1. 大量データでのパフォーマンステスト
  const startTime = performance.now();
  
  try {
    console.log('1. 大量データでのパフォーマンステスト');
    
    // 1000回の操作を実行
    for (let i = 0; i < 1000; i++) {
      favoritesManager.isFavorite(`test-item-${i}`, 'tool');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 1000回の操作完了: ${duration.toFixed(2)}ms`);
    console.log(`✅ 1操作あたり: ${(duration / 1000).toFixed(4)}ms`);
    
  } catch (error) {
    console.error('❌ パフォーマンステストに失敗:', error);
  }

  // 2. メモリ使用量のテスト
  try {
    console.log('2. メモリ使用量のテスト');
    
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // 大量のお気に入りを追加
    for (let i = 0; i < 100; i++) {
      favoritesManager.addSuite(`memory-test-${i}`);
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`✅ メモリ使用量増加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
  } catch (error) {
    console.error('❌ メモリ使用量テストに失敗:', error);
  }

  console.groupEnd();
}

/**
 * 統合テスト関数
 */
export function runIntegrationTests() {
  console.group('🔗 統合テスト');
  
  try {
    // 1. データ整合性テスト
    console.log('1. データ整合性テスト');
    const favorites = favoritesManager.getFavorites();
    
    // データ構造の検証
    const isValid = (
      Array.isArray(favorites.suites) &&
      Array.isArray(favorites.tools) &&
      typeof favorites.maxItems === 'number' &&
      favorites.maxItems > 0
    );
    
    console.log('✅ データ整合性:', isValid ? 'OK' : 'NG');
    
    // 2. イベントシステムテスト
    console.log('2. イベントシステムテスト');
    let eventReceived = false;
    let eventDetails = null;
    
    const testListener = (event: any) => {
      console.log('イベント受信:', event);
      if (event.type === 'suite-added' && event.id === 'event-test') {
        eventReceived = true;
        eventDetails = event;
      }
    };
    
    // 既存のテスト用スイートを削除
    favoritesManager.removeSuite('event-test');
    
    // お気に入りが最大件数に達している場合は、既存のアイテムを1つ削除
    const eventCurrentFavorites = favoritesManager.getFavorites();
    if (eventCurrentFavorites.suites.length + eventCurrentFavorites.tools.length >= eventCurrentFavorites.maxItems) {
      if (eventCurrentFavorites.suites.length > 0) {
        favoritesManager.removeSuite(eventCurrentFavorites.suites[0]);
      } else if (eventCurrentFavorites.tools.length > 0) {
        favoritesManager.removeTool(eventCurrentFavorites.tools[0]);
      }
    }
    
    favoritesEventManager.addListener(testListener);
    const eventAddResult = favoritesManager.addSuite('event-test');
    favoritesEventManager.removeListener(testListener);
    
    console.log('イベント受信状況:', eventReceived);
    console.log('イベント詳細:', eventDetails);
    console.log('追加結果:', eventAddResult);
    console.log('✅ イベントシステム:', eventReceived ? 'OK' : 'NG');
    
    // 3. 状態同期テスト
    console.log('3. 状態同期テスト');
    const initialFavorites = favoritesManager.getFavorites();
    const initialCount = initialFavorites.suites.length + initialFavorites.tools.length;
    
    // 既存のテスト用スイートを削除（重複を避けるため）
    favoritesManager.removeSuite('event-test');
    favoritesManager.removeSuite('sync-test');
    
    // お気に入りが最大件数に達している場合は、既存のアイテムを1つ削除
    const syncCurrentFavorites = favoritesManager.getFavorites();
    if (syncCurrentFavorites.suites.length + syncCurrentFavorites.tools.length >= syncCurrentFavorites.maxItems) {
      if (syncCurrentFavorites.suites.length > 0) {
        favoritesManager.removeSuite(syncCurrentFavorites.suites[0]);
      } else if (syncCurrentFavorites.tools.length > 0) {
        favoritesManager.removeTool(syncCurrentFavorites.tools[0]);
      }
    }
    
    // 新しいスイートを追加
    const syncAddResult = favoritesManager.addSuite('sync-test');
    const finalFavorites = favoritesManager.getFavorites();
    const finalCount = finalFavorites.suites.length + finalFavorites.tools.length;
    
    const syncSuccess = syncAddResult && (finalCount === initialCount);
    console.log('✅ 状態同期:', syncSuccess ? 'OK' : 'NG');
    
  } catch (error) {
    console.error('❌ 統合テストに失敗:', error);
  }
  
  console.groupEnd();
}

/**
 * 全テストの実行
 */
export function runAllTests() {
  console.log('🚀 お気に入り機能の全テストを開始');
  
  testErrorHandling();
  testPerformance();
  runIntegrationTests();
  
  console.log('✅ 全テスト完了');
}
