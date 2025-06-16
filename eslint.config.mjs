import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['**/node_modules/', '**/dist/', '**/build/']
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prettier/prettier': [
        'warn',
        {
          arrowParens: 'avoid',
          bracketSameLine: false,
          bracketSpacing: true,
          embeddedLanguageFormatting: 'auto',
          experimentalTernaries: false,
          htmlWhitespaceSensitivity: 'css',
          insertPragma: false,
          jsxSingleQuote: true,
          printWidth: 80,
          proseWrap: 'preserve',
          quoteProps: 'as-needed',
          requirePragma: false,
          semi: true,
          singleAttributePerLine: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'none',
          useTabs: false
        }
      ]
    }
  },

  // Server-specific configuration
  {
    files: ['server/**/*.{js,ts}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  },

  // Client-specific React configuration
  {
    files: ['client/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  }
);
