import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/Focus-Flow/',
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'app.html'),
        output: {
          entryFileNames: 'assets/app.js',
          assetFileNames: assetInfo =>
            assetInfo.name?.endsWith('.css')
              ? 'assets/app.css'
              : 'assets/[name]-[hash][extname]',
        },
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be disabled via DISABLE_HMR when file watching is unstable.
      // Do not modify; this helps avoid flickering during automated edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
