import { readFileSync } from 'fs';
import { join } from 'path';
import { build } from 'bun';
import { Generator } from 'npm-dts';

new Generator({
  entry: 'src/index.ts',
  output: 'dist/index.d.ts',
}).generate();

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

await build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  external: Object.keys(pkg.dependencies),
  target: 'node',
  format: 'cjs',
});

const templates = ['github-pr.yml', 'gitlab-pr.yml', 'azdev-pr.yml'];

for (const template of templates) {
  await Bun.write(join('./dist', template), await Bun.file(join('./templates', template)).text());
}
