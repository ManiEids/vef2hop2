module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      // Add a specific override for scripts directory
      files: ['scripts/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'linebreak-style': 0, // 0 is equivalent to 'off'
        'no-console': 'off', // Allow console in scripts
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-param-reassign': ['error', { props: false }],
    'linebreak-style': 0, // Changed from 'off' to 0 for more explicit disabling
    'no-trailing-spaces': 'error',
    // Allow function declarations to be used before defined (hoisting)
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    // Enforce consistent use of parentheses in arrow functions
    'arrow-parens': ['error', 'always'],
    'no-plusplus': 'off', // Add this line to disable the no-plusplus rule
  },
};
