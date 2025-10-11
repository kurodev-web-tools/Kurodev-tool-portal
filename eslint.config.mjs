import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**", // ビルドスクリプトは除外
      "jest.setup.ts", // テスト設定ファイルは除外
      "jest.config.ts",
    ],
  },
  {
    rules: {
      // console.logの使用を禁止（本番環境のコンソール汚染防止）
      // logger.tsを使用すること
      "no-console": "warn",
    },
  },
  {
    // logger.ts内ではconsole.logの使用を許可（logger自身の実装のため）
    files: ["src/lib/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
