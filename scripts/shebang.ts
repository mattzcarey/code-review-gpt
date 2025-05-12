import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const filePath = join(import.meta.dir, '../dist/index.js')

const data = readFileSync(filePath, 'utf8')
writeFileSync(filePath, `#!/usr/bin/env node\n${data}`)
