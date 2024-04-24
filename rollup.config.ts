import terserPlugin from '@rollup/plugin-terser';
import typescriptPlugin from '@rollup/plugin-typescript';
import type { InputOptions, OutputOptions, RollupOptions } from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

import { packageName } from './src/util/packageName';

const outputPath = `dist/index`;

const commonInputOptions: InputOptions = {
  input: 'src/index.ts',
  plugins: [typescriptPlugin()],
};

const iifeCommonOutputOptions: OutputOptions = {
  name: packageName ?? 'index',
};

const config: RollupOptions[] = [
  // ESM output.
  {
    ...commonInputOptions,
    output: [{ extend: true, file: `${outputPath}.mjs`, format: 'esm' }],
  },

  // IIFE output.
  {
    ...commonInputOptions,
    output: [
      {
        ...iifeCommonOutputOptions,
        extend: true,
        file: `${outputPath}.iife.js`,
        format: 'iife',
      },

      // Minified IIFE output.
      {
        ...iifeCommonOutputOptions,
        extend: true,
        file: `${outputPath}.iife.min.js`,
        format: 'iife',
        plugins: [terserPlugin()],
      },
    ],
  },

  // CommonJS output.
  {
    ...commonInputOptions,
    output: [
      {
        extend: true,
        file: `${outputPath}.cjs`,
        format: 'cjs',
      },
    ],
  },

  // Type definitions output.
  {
    ...commonInputOptions,
    plugins: [commonInputOptions.plugins, dtsPlugin()],
    output: [
      {
        extend: true,
        file: `${outputPath}.d.ts`,
        format: 'esm',
      },
      {
        extend: true,
        file: `${outputPath}.d.mts`,
        format: 'esm',
      },
      {
        extend: true,
        file: `${outputPath}.d.cts`,
        format: 'cjs',
      },
    ],
  },
];

export default config;
