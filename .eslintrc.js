module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  parser: '@typescript-eslint/parser',
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
  },
  rules: {
    // Add custom rules here
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};