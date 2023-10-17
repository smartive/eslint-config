/** @type {import('eslint').Linter.Config} */
module.exports = {
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/forbid-component-props': ['warn', { forbid: ['style', 'className'] }],
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['./index', 'plugin:react/recommended'],
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  plugins: ['react', 'react-hooks'],
};
