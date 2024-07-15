module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json"
  },
  ignorePatterns: [
    "**.d.ts",
    "**.json",
    "node_modules/",
    "dist/",
    "docs/",
    ".eslintrc.cjs",
    "vitest.config.ts",
    "tsup.config.ts"
  ],
  extends: [
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/prefer-default-export": 0,
    "import/no-duplicates": "error",
    "prettier/prettier": "error",
    "eqeqeq": ["error", "smart"],
    "@typescript-eslint/no-non-null-assertion": 1,
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-misused-promises": [
      2,
      {
        checksVoidReturn: {
          attributes: false
        }
      }
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false
      }
    ],
    "prefer-const": "error",
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "*",
        next: "return"
      }
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: ".",
            message: "Please use explicit import file"
          }
        ]
      }
    ],
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error"
  }
}
