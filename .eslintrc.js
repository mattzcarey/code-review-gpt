module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["**.js"],
  extends: "standard-with-typescript",
  rules: {},
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
  },
};
