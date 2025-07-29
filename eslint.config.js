import antfu from '@antfu/eslint-config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default antfu(
  {},
  {
    rules: {
      ...eslintConfigPrettier.rules,
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'ts/no-redeclare': ['error', { ignoreDeclarationMerge: true }],
      'jsdoc/require-returns-description': 'off',
      'antfu/if-newline': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    languageOptions: {
      globals: {
        GM_addElement: 'readonly',
        GM_addStyle: 'readonly',
        GM_setValue: 'readonly',
        GM_addValueChangeListener: 'readonly',
        GM_removeValueChangeListener: 'readonly',
        GM_getValue: 'readonly',
        GM_deleteValue: 'readonly',
        GM_listValues: 'readonly',
        GM_getResourceText: 'readonly',
        GM_getResourceURL: 'readonly',
        GM_registerMenuCommand: 'readonly',
        GM_unregisterMenuCommand: 'readonly',
        GM_xmlhttpRequest: 'readonly',
        GM_download: 'readonly',
        GM_saveTab: 'readonly',
        GM_getTab: 'readonly',
        GM_getTabs: 'readonly',
        GM_info: 'readonly',
        GM_log: 'readonly',
        GM_openInTab: 'readonly',
        GM_notification: 'readonly',
        GM_setClipboard: 'readonly',
        GM_webRequest: 'readonly',
        GM_cookie: 'readonly',
        GM: 'readonly',
      },
    },
  },
)
