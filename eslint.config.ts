/**
 * ESLint flat config: strict type-checked TypeScript rules, TSDoc syntax,
 * import sorting & Prettier for all TS files; Vitest rules for tests.
 *
 * @module
 */
import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

export default defineConfig(
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
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      tsdoc: tsdocPlugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'tsdoc/syntax': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    extends: [vitest.configs.recommended],
  },
  prettierConfig,
);
