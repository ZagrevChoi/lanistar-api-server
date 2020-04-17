module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-import'
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:import/typescript'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "quotes": [2, "double", { "avoidEscape": true }],
    "brace-style": [2, "1tbs", { "allowSingleLine": false }],
    "func-style": [1, "declaration", { "allowArrowFunctions": true }],
    "sort-imports": [1, {
      "ignoreCase": false,
      "ignoreDeclarationSort": true,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
    }],
    "import/order": [1, {
      "groups": [["builtin"], ["external"], ["internal", "sibling", "parent", "index"]  ],
      "newlines-between": "always",
      "alphabetize": {
        "order": 'asc', /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */
        "caseInsensitive": true /* ignore case. Options: [true, false] */
      }
    }],
    "object-curly-newline": [1, {
      "ObjectExpression": {
        "consistent": true,
        "minProperties": 3
      },
      "ObjectPattern": {
        "consistent": true,
      },
      "ImportDeclaration": {
        // "multiline": true,
        "consistent": true,
        "minProperties": 3
      },
      "ExportDeclaration": {
        "consistent": true,
      },
    }],
    "no-param-reassign": [2],
    "semi": [1, "always"],
    "padded-blocks": [1, "never"],
    "comma-dangle": [1, "never"],
    "no-multiple-empty-lines": [1, { "max": 1, "maxEOF": 1 }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/interface-name-prefix": "off"
  }
};
