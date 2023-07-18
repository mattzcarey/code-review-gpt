const { build } = require("esbuild");
const { dependencies } = require("../package.json");
const { Generator } = require("npm-dts");
const fs = require("fs");
const path = require("path");

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

build(sharedConfig).then(() => {
  // Copy the ci template file to the dist folder after the build is complete
  fs.copyFileSync(
    path.join(__dirname, "../templates", "pr.yml"),
    path.join(__dirname, "../dist", "pr.yml")
  );
});
