import fs from "fs"
import path from "path"
import { defineConfig } from "tsup"

import { dependencies } from "./package.json"

export default defineConfig(options => {
  return {
    splitting: true,
    sourcemap: true,
    minify: false,
    entry: ["src/index.ts"],
    target: "es2022",
    format: ["cjs", "esm"],
    clean: true,
    dts: true,
    noExternal: ["rnd"],
    external: Object.keys(dependencies),
    onSuccess: async () => {
      const templateFiles = ["github-pr.yml", "gitlab-pr.yml", "azdev-pr.yml"]
      templateFiles.forEach(file => {
        fs.copyFileSync(path.join(__dirname, "templates", file), path.join(__dirname, "dist", file))
      })
      console.log("Build completed and template files copied to dist folder.")
    },
    ...options
  }
})
