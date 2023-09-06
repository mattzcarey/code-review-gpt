export const defaultStage = "dev";
export const defaultRegion = "eu-west-2";
export const projectName = "crgpt";

export const sharedCdkEsbuildConfig = {
  minify: false,
  keepNames: true,
  sourceMap: true,
  externalModules: ["aws-sdk"],
  target: "node16",
  platform: "node",
  metafile: true,
  mainFields: ["module", "main"],
};
