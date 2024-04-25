import eslint from '@eslint/js';
import prettierPlugin from 'eslint-config-prettier';
import mochaPlugin from 'eslint-plugin-mocha';
// @ts-expect-error: could not find a type declaration file
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  mochaPlugin.configs.flat.recommended,
  {
    extends: [prettierPlugin],
    ignores: ['coverage/**/*', 'dist/**/*'],

    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    plugins: { 'simple-import-sort': simpleImportSortPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'mocha/no-skipped-tests': 'off',
      'mocha/no-top-level-hooks': 'off',
      'no-unused-vars': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
);
