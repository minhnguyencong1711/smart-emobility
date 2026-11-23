import path from 'node:path';

import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import checkFilePlugin from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

const fixUnsupportedPlugins = {
  'react-hooks': fixupPluginRules(reactHooksPlugin),
  import: importPlugin,
};

export default [
  prettierConfig,
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...tailwindcssPlugin.configs['flat/recommended'],
  {
    ignores: ['dist/*', 'node_modules/*', '*.cjs', 'src/routeTree.gen.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptEslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    plugins: {
      ...fixUnsupportedPlugins,
      'check-file': checkFilePlugin,
      prettier: prettierPlugin,
      react: reactPlugin,
      tailwindcss: tailwindcssPlugin,
      '@typescript-eslint': typescriptEslint.plugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
      tailwindcss: {
        callees: ['clsx', 'cn'],
        config: path.resolve(import.meta.dirname, 'tailwind.config.cjs'),
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/jsx-key': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features',
              from: './src/app.tsx',
            },
            {
              target: [
                './src/components',
                './src/data',
                './src/hooks',
                './src/services',
                './src/stores',
                './src/types',
                './src/utils',
              ],
              from: ['./src/features', './src/app.tsx'],
            },
          ],
        },
      ],
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { destructuredArrayIgnorePattern: '^_' },
      ],
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/*.{ts,tsx}': '*([-~$_])[a-z]+*(-[a-z0-9]+)',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/!(__tests__)/': '*([-~$_])[a-z0-9]+*(-[a-z0-9]+)',
        },
      ],
      'tailwindcss/classnames-order': 'error',
      'tailwindcss/enforces-negative-arbitrary-values': 'error',
      'tailwindcss/enforces-shorthand': 'error',
      'tailwindcss/no-custom-classname': 'error',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-unnecessary-arbitrary-value': 'error',
    },
  },
];
