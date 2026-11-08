import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import babel from '@babel/core';
import presetReact from '@babel/preset-react';
import presetEnv from '@babel/preset-env';

const jsxTransform = {
  name: 'gradstudio-jsx-transform',
  enforce: 'pre',
  transform(code, id) {
    if (!id.split('?')[0].endsWith('.jsx')) return null;
    const result = babel.transformSync(code, {
      filename: id,
      presets: [[presetReact, { runtime: 'automatic' }], [presetEnv, { targets: 'defaults', modules: false }]],
      sourceMaps: true,
    });
    return { code: result.code, map: result.map };
  },
};

export default defineConfig({
  plugins: [jsxTransform, react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        studio: resolve(import.meta.dirname, 'studio.html'),
        booking: resolve(import.meta.dirname, 'booking.html'),
      },
    },
  },
});
