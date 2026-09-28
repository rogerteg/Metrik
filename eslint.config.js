import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'scratch/**',
      '.kilo/**',
      'specs/**',
      'venv/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // O typecheck do `tsc` já cobre variáveis não usadas; no lint fica como aviso.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Blocos catch vazios são um padrão intencional de degradação defensiva aqui.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Em testes, `any` e mocks parcialmente usados são aceitáveis.
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Scripts de ferramenta (Node ESM).
    files: ['scripts/**/*.{js,mjs}', '*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
