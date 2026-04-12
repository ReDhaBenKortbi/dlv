import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.netlify']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow intentionally-unused variables when prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  // Enforce layer boundaries: domain and application must never import
  // Firebase or React directly — those belong in infrastructure/presentation.
  {
    files: ['src/domain/**/*.{ts,tsx}', 'src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase/*', 'firebase-admin/*'],
              message: 'Domain/application layers must not import Firebase. Use port interfaces instead.',
            },
            {
              group: ['react', 'react-dom', 'react-router-dom'],
              message: 'Domain/application layers must not import React. Move UI logic to the presentation layer.',
            },
          ],
        },
      ],
    },
  },
])
