module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:jsdoc/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'import',
    'jsdoc'
  ],
  rules: {
    // Error level rules (will cause build to fail in CI)
    'no-undef': 'error',
    'no-const-assign': 'error',
    'no-case-declarations': 'error',
    'no-prototype-builtins': 'error',
    
    // Warning level rules (will be reported but won't fail the build)
    'no-console': 'warn',
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-empty': 'warn',
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'jsdoc/require-jsdoc': 'warn',
    'jsdoc/check-tag-names': 'warn',
    'jsdoc/check-types': 'warn',
    'jsdoc/no-defaults': 'warn',
    'jsdoc/tag-lines': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/require-returns-check': 'warn',
    'import/order': [
      'warn', 
      { 
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always'
      }
    ],
    'import/no-duplicates': 'warn',
    'no-useless-escape': 'warn'
  },
  globals: {
    module: 'writable',
    wp: 'readonly',
    ajaxurl: 'readonly',
    wpApiSettings: 'readonly',
    tinyMCE: 'readonly',
    productEstimatorAdmin: 'readonly',
    productEstimatorVars: 'readonly',
    initSuggestionsCarousels: 'readonly'
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: './webpack.config.js'
      }
    }
  }
};