import { defineConfig } from 'vite';

// GitHub Pages: /119/ 서브경로용 base (119 리포에서 payment-crisis-rpg 서브폴더로 서빙 시)
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/119/' : '/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
  },
});
