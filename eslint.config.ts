import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import vitestPlugin from '@vitest/eslint-plugin';
import type { ESLint, Linter } from 'eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));
// Extract strict type-checked rules into a single rules object.
const strictConfigs = tseslint.configs
  .strictTypeChecked as unknown as Array<unknown>;
const strictTypeCheckedRules = strictConfigs.reduce<Record<string, unknown>>(
  (acc, cfg) => {
    const rules = (cfg as { rules?: Record<string, unknown> }).rules;
    if (rules) Object.assign(acc, rules);
    return acc;
  },
  {},
);

// Cast Vitest plugin to ESLint's Plugin type to satisfy TS.
const vitest = vitestPlugin as unknown as ESLint.Plugin;

// Vitest recommended rules (flat config)
const vitestRecommendedRules: Linter.RulesRecord =
  (
    vitestPlugin as unknown as {
      configs?: { recommended?: { rules?: Linter.RulesRecord } };
    }
  ).configs?.recommended?.rules ?? {};

export default [
  {
    ignores: [
      '.rollup.cache/**/*',
      'assets/**/*',
      'coverage/**/*',
      'dist/**/*',
      'docs/**/*',
      'node_modules/**/*',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      tsdoc: tsdocPlugin,
    },
    rules: {
      ...strictTypeCheckedRules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'tsdoc/syntax': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir,
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitestRecommendedRules,
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
];
