import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import * as path from 'path';
import electron from 'vite-plugin-electron';
import polyfillExports from 'vite-plugin-electron/polyfill-exports';
import electronRenderer from 'vite-plugin-electron/renderer';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
  },
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'electron-main/index.ts',
      },
      preload: {
        input: path.join(__dirname, './electron-preload/index.ts'),
      },
    }),
    electronRenderer(),
    polyfillExports(),
  ],
  build: {
    emptyOutDir: false,
  },
});
