import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // IMPORTANTE: Nome exato do repositório entre barras
      base: '/meudiadetreino/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        // Define a pasta de saída como 'docs' para o GitHub Pages
        outDir: 'docs',
      },
      plugins: [react()],
      // Garante que sua chave do .env.local seja embutida no build
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});