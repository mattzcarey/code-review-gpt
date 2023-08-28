export const sharedCdkEsbuildConfig = {
  minify: false,
  keepNames: true,
  sourceMap: true,
  externalModules: ["@aws-sdk"],
  target: "node18",
  platform: "node",
  metafile: true,
  /**
   * Sets the resolution order for esbuild.
   *
   * In order to enable tree-shaking of packages, we need specify `module` first (ESM)
   * Because it defaults to "main" first (CJS, not tree shakeable)
   * https://esbuild.github.io/api/#main-fields
   */
  mainFields: ["module", "main"],
};
