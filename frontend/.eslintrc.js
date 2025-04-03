module.exports = {
  extends: [
    'next/core-web-vitals',
  ],
  rules: {
    // Customize your ESLint rules here
    'react/react-in-jsx-scope': 'off', // Not needed with Next.js
    'react/no-unescaped-entities': 'off', // Allow unescaped entities in JSX
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignore unused vars prefixed with _
    'import/no-unresolved': 'off', // Disable unresolved import errors
  },
};
