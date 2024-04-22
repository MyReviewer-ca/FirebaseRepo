var isDev = true;

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import svelte from 'rollup-plugin-svelte';

const plugins = [json(), css({output: 'bundle.css'}), resolve({browser: true, dedupe: ['svelte']}), commonjs()];

export default (args) => {
  plugins.push(
    svelte({
      compilerOptions: {
        dev: isDev,
      },
    })
  );

  return [
    {
      input: 'admin/src/main.js',
      output: {
        sourcemap: isDev,
        format: 'iife',
        name: 'admin',
        file: '../admin/bundle.js',
      },
      plugins: plugins,
      watch: {
        clearScreen: false,
      },
    },
    {
      input: 'reviews/src/main.js',
      output: {
        sourcemap: isDev,
        format: 'iife',
        name: 'reviews',
        file: '../reviews/bundle.js',
      },
      plugins: plugins,
      watch: {
        clearScreen: false,
      },
    },
  ];
};
