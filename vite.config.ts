import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' garante que o build funcione na Hostinger tanto na raiz do
// dominio quanto dentro de uma subpasta (caminhos relativos).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // recharts (com o d3) e naturalmente grande; o limite e ajustado
    // para evitar o aviso, ja que o tamanho final e aceitavel.
    chunkSizeWarningLimit: 700,
    // Separa as bibliotecas em chunks proprios para melhorar o cache
    // quando o app for atualizado na Hostinger.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('recharts') ||
            id.includes('d3-') ||
            id.includes('victory')
          ) {
            return 'charts';
          }
          if (id.includes('@supabase')) return 'supabase';
          return 'vendor';
        },
      },
    },
  },
});
