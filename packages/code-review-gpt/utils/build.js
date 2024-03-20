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
  // Copy the ci template files to the dist folder after the build is complete
  fs.copyFileSync(
    path.join(__dirname, "../templates", "github-pr.yml"),
    path.join(__dirname, "../dist", "github-pr.yml")
  );
  fs.copyFileSync(
    path.join(__dirname, "../templates", "gitlab-pr.yml"),
    path.join(__dirname, "../dist", "gitlab-pr.yml")
  );
  fs.copyFileSync(
    path.join(__dirname, "../templates", "azdev-pr.yml"),
    path.join(__dirname, "../dist", "azdev-pr.yml")
  );  
});
