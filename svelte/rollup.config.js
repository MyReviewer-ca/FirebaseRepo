import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import svelte from 'rollup-plugin-svelte';

const plugins = [json(), css({output: 'bundle.css'}), resolve({browser: true, dedupe: ['svelte']}), commonjs()];

export default (args) => {
  const isDev = args.mode === 'development';

  plugins.push(
    svelte({
      compilerOptions: {
        dev: true,
      },
    })
  );
  return {
    sourcemap: true,
    input: 'src/main.js',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: '../www/bundle.js',
    },
    plugins: plugins,
    watch: {
      clearScreen: false,
    },
  };
};
