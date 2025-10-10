import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
});

// Jestの設定
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  // モジュールパスのエイリアス（tsconfig.jsonと一致）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // カバレッジの設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/app/layout.tsx', // レイアウトは除外
    '!src/middleware.ts',
  ],
  
  // 除外するパターン
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  
  // モジュール変換の除外
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // カバレッジの閾値（徐々に上げていく）
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

// Next.js設定を適用
export default createJestConfig(config);


