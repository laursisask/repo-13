const  { nodeResolve } = require("@rollup/plugin-node-resolve");
const autoInstall  = require('@rollup/plugin-auto-install');
const { visualizer } = require("rollup-plugin-visualizer");
const { summary } = require('rollup-plugin-summary');

module.exports = (config) => {
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

  return {
    ...config,
    output: {
      ...config.output,
      globals
    },
    external: (name) => {
      if (bundled.includes(name)) {
        return false;
      }

      return config.external(name)
    },
    plugins: [
      ...config.plugins,
      autoInstall(),
      visualizer()
    ]
  };
}
