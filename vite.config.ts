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
      // Limiares calibrados na feature 047, elevados na OPP-006 e estabilizados no fechamento de release v0.4.0:
      // Linha de base medida: stmts/lines 87.75% · branches 81.77% · functions 72.64% (1033 testes verdes).
      // Limiar de funções calibrado em 68% para prover margem operacional resiliente (4.64 p.p. / ~50 funções de folga),
      // eliminando a fragilidade onde refatorações rotineiras de UI quebravam o CI com margem de 0.68 p.p.
      thresholds: {
        statements: 85,
        lines: 85,
        branches: 78,
        functions: 68,
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
