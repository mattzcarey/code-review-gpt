module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["**.js", "**.d.ts", "**.cjs", "**.mjs", "**.json"],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/prefer-default-export": 0,
    "import/no-duplicates": "error",
    complexity: ["error", 8],
    "max-lines": ["error", { max: 200, skipBlankLines: true }],
    "max-depth": ["error", 3],
    "max-params": ["error", 6],
    eqeqeq: ["error", "smart"],
    "@typescript-eslint/no-misused-promises": [
      2,
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    "prefer-const": "error",
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "*",
        next: "return",
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "aws-sdk",
            message: "Please use aws-sdk/{module} import instead",
          },
          {
            name: ".",
            message: "Please use explicit import file",
          },
        ],
      },
    ],
    curly: ["error", "all"],
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    // TODO: The four lines below are warn rather than error because this is not a monorepo and we were having import issues
    // Once we have a monorepo setup, these should be changed.
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
  },
};
