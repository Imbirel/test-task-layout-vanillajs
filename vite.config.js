import { defineConfig } from 'vite';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { fileURLToPath, URL } from 'node:url';

const targets = browserslist();

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    lightningcss: {
      targets: browserslistToTargets(targets),
    },
  },
  build: {
    target: browserslistToEsbuild(targets),
    cssMinify: 'lightningcss',
  },
});
