import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const filePath = join(import.meta.dir, '../dist/index.js');

const data = readFileSync(filePath, 'utf8');
writeFileSync(filePath, `#!/usr/bin/env node\n${data}`);
