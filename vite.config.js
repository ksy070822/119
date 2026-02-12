import { defineConfig } from 'vite';

// Vercel 등 루트 배포 시 base: '/'. GitHub Pages 서브경로 시엔 '/119/' 로 빌드.
export default defineConfig({
  base: process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/119/' : '/'),
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
