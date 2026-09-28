/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa fornecedores grandes do bundle principal para melhorar o cache
        // e reduzir o tamanho do chunk inicial.
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    // Sob carga paralela da suíte completa, testes de componente pesados (App/Board)
    // podem passar de 5s. O limite maior evita vermelho falso sem mascarar travas reais.
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      all: true,
      reporter: ['text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
      // Limiares com folga sobre a linha de base de 2026-09-28:
      // stmts/lines 85.7% · branches 79.5% · functions 59.9%.
      thresholds: {
        statements: 84,
        lines: 84,
        branches: 77,
        functions: 58,
      },
    },
    // Exclui worktrees locais (.kilo), o harness de preview (scratch) e as
    // demais pastas padrão para não duplicar/poluir a suíte.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/.kilo/**',
      '**/scratch/**',
    ],
  },
});
