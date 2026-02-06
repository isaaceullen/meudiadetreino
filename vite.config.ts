import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Garante o carregamento correto das variáveis locais durante o build/dev
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // 1. OBRIGATÓRIO: Nome do repositório entre barras para o GH Pages
      base: '/meudiadetreino/',
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      
      // 2. CONFIGURAÇÃO DE BUILD: Gera a pasta 'docs' em vez de 'dist'
      build: {
        outDir: 'docs',
      },

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