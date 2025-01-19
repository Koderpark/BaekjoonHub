import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { chromeExtension } from 'rollup-plugin-chrome-extension';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  plugins: [react(), chromeExtension(), typescript()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, './src/pages/Popup.tsx'),
        options: resolve(__dirname, './src/pages/Options.tsx'),
        welcome: resolve(__dirname, './src/pages/Welcome.tsx'),
        background: resolve(__dirname, './src/background/index.ts'),
        content: resolve(__dirname, './src/content/index.ts'),
      },
      output: {
        dir: 'dist',
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    target: 'esnext',
    sourcemap: true,
    minify: 'terser',
  },
});
