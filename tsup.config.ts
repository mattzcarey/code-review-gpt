import { defineConfig } from 'tsup'
import { join } from 'node:path'
import fs from 'node:fs'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  async onSuccess() {
    const templates = ['github-pr.yml', 'gitlab-pr.yml', 'azdev-pr.yml']

    for (const template of templates) {
      const content = await fs.promises.readFile(join('./templates', template), 'utf8')
      await fs.promises.writeFile(join('./dist', template), content)
    }
  },
})
