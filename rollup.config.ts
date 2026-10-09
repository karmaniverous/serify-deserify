/**
 * Rollup build config: ESM, CommonJS & IIFE bundles plus bundled type
 * definitions, written to `dist/`.
 *
 * @module
 */
import { createRequire } from 'node:module';

import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terserPlugin from '@rollup/plugin-terser';
import typescriptPlugin from '@rollup/plugin-typescript';
import type { InputOptions, OutputOptions, RollupOptions } from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

import { packageName } from './src/util/packageName';

const require = createRequire(import.meta.url);
type Package = Record<string, Record<string, string> | undefined>;
const pkg = require('./package.json') as Package;

const outputPath = `dist/index`;

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

const commonPlugins = [
  commonjsPlugin(),
  jsonPlugin(),
  nodeResolve(),
  typescript,
];

/**
 * Common input options for all bundle builds.
 *
 * Runtime dependencies are bundled rather than externalized: `is-what` is
 * ESM-only, so externalizing it would break the CommonJS & IIFE outputs.
 * Peer dependencies are externalized.
 */
const commonInputOptions: InputOptions = {
  input: 'src/index.ts',
  external: Object.keys(pkg.peerDependencies ?? {}),
  plugins: commonPlugins,
};

/** Common output options for the IIFE build. */
const iifeCommonOutputOptions: OutputOptions = {
  extend: true,
  format: 'iife',
  name: packageName ?? 'index',
};

/** Assemble complete config: module, IIFE & type definition outputs. */
const config: RollupOptions[] = [
  // ESM & CommonJS output.
  {
    ...commonInputOptions,
    output: [
      { extend: true, file: `${outputPath}.mjs`, format: 'esm' },
      { extend: true, file: `${outputPath}.cjs`, format: 'cjs' },
    ],
  },

  // IIFE output (plain & minified).
  {
    ...commonInputOptions,
    output: [
      { ...iifeCommonOutputOptions, file: `${outputPath}.iife.js` },
      {
        ...iifeCommonOutputOptions,
        file: `${outputPath}.iife.min.js`,
        plugins: [terserPlugin()],
      },
    ],
  },

  // Type definitions output.
  {
    input: 'src/index.ts',
    plugins: [dtsPlugin()],
    output: [
      { extend: true, file: `${outputPath}.d.ts`, format: 'esm' },
      { extend: true, file: `${outputPath}.d.mts`, format: 'esm' },
      { extend: true, file: `${outputPath}.d.cts`, format: 'cjs' },
    ],
  },
];

export default config;
