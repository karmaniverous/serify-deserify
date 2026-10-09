/**
 * Rollup build config: ESM bundle plus bundled type definitions, written to
 * `dist/`.
 *
 * @module
 */
import { createRequire } from 'node:module';

import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescriptPlugin from '@rollup/plugin-typescript';
import type { InputOptions, RollupOptions } from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
type Package = Record<string, Record<string, string> | undefined>;
const pkg = require('./package.json') as Package;

const outputPath = `dist`;

// Rollup writes bundle outputs; the TS plugin should only transpile.
// - outputToFilesystem=false avoids outDir/dir validation errors for multi-output builds.
// - incremental=false avoids TS build-info state referencing transient Rollup config artifacts.
const typescript = typescriptPlugin({
  tsconfig: './tsconfig.json',
  outputToFilesystem: false,
  // Only compile bundled sources; prevents transient Rollup config artifacts
  // (e.g. rollup.config-*.mjs) from being pulled into the TS program.
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', 'src/test/**'],

  // Override repo tsconfig settings for bundling.
  noEmit: false,
  declaration: false,
  declarationMap: false,
  incremental: false,
  allowJs: false,
  checkJs: false,
});

/**
 * Common input options for library builds. Runtime dependencies and peers
 * are externalized.
 */
const commonInputOptions: InputOptions = {
  input: 'src/index.ts',
  external: [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    'tslib',
  ],
  plugins: [commonjsPlugin(), jsonPlugin(), nodeResolve(), typescript],
};

/** Assemble complete config: library & type definition outputs. */
const config: RollupOptions[] = [
  // Library output (ESM).
  {
    ...commonInputOptions,
    output: [{ dir: outputPath, extend: true, format: 'esm' }],
  },

  // Type definitions output (single .d.ts).
  {
    input: 'src/index.ts',
    output: [{ file: `${outputPath}/index.d.ts`, format: 'esm' }],
    plugins: [dtsPlugin()],
  },
];

export default config;
