import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

const globals = {
  'react/jsx-runtime': 'jsxRuntime',
  'pixi.js': 'PIXI',
  '@pixi/core': 'PIXI',
  '@pixi/settings': 'PIXI',
  '@pixi/math': 'PIXI',
  '@pixi/utils': 'PIXI.utils',
  '@pixi/filter-alpha': 'PIXI.filters',
  '@pixi/filter-blur': 'PIXI.filters',
  '@pixi/constants': 'PIXI',
  '@pixi/display': 'PIXI',
  '@pixi/runner': 'PIXI',
  '@pixi/gif': 'PIXI',
  '@pixi/filter-shockwave': 'PIXI',
  '@pixi/picture': 'PIXI',
  'lit/directives/ref.js': 'lit',
  'lit/decorators.js': 'lit',
  'gsap': 'gsap',
  'gsap/all': 'gsap',
  'gsap/PixiPlugin': 'gsap'
};

const bundled = [
  'lit/directives/ref.js',
  'lit/decorators.js',
  'lit',
  'gsap',
  'gsap/PixiPlugin',
  'lottie-web',
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: '../../packages/gu-animator/index.js',
        format: 'esm',
        // sourcemap: true,
        globals
      },
      {
        file: '../../packages/gu-animator/index.cjs',
        format: 'umd',
        name: 'guAnimator',
        // sourcemap: true,
        globals
      },
    ],
    external: [
      ...bundled,
      /node_modules/
    ],
    plugins: [
      copy({
        targets: [
          { src: 'package.json', dest: '../../packages/gu-animator' },
        ]
      }),
      typescript({
        tsconfig: 'tsconfig.lib.json',
      }),
      nodeResolve(),
      commonjs(),
      json()
    ]
  }
];
