const { build } = require("esbuild");
const { dependencies } = require("../package.json");
const { Generator } = require("npm-dts");

new Generator({
  entry: "src/index.ts",
  output: "dist/index.d.ts",
}).generate();

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  external: Object.keys(dependencies),
  platform: "node",
  outfile: "dist/index.js",
};

build(sharedConfig);
