import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const outDir = path.resolve(__dirname, 'dist');

  return {
    base: env.VITE_BASE_PATH || '/',
    build: {
      outDir,
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-static-portfolio-data',
        apply: 'build',
        closeBundle() {
          const dbSource = path.resolve(__dirname, 'db.json');
          const dbTarget = path.join(outDir, 'db.json');
          const uploadsSource = path.resolve(__dirname, 'uploads');
          const uploadsTarget = path.join(outDir, 'uploads');

          if (fs.existsSync(dbSource)) {
            fs.copyFileSync(dbSource, dbTarget);
          }

          if (fs.existsSync(uploadsSource)) {
            fs.cpSync(uploadsSource, uploadsTarget, { recursive: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify; file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/db.json', '**/uploads/**']
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
