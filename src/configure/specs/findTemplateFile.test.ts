import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { findTemplateFile } from '../findTemplateFile'

const testDir = join(import.meta.dir, 'test-glob')

describe('findTemplateFile', () => {
  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
    writeFileSync(join(testDir, 'template1.txt'), 'Test File 1')
    mkdirSync(join(testDir, 'subdir'))
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('should find a template file matching the pattern', async () => {
    const pattern = join(testDir, '*.txt')
    const file = await findTemplateFile(pattern)
    expect(file).toMatchInlineSnapshot(`"src/configure/specs/test-glob/template1.txt"`)
  })

  it('should throw an error when no files match the pattern', async () => {
    const pattern = join(testDir, '*.md')
    expect(findTemplateFile(pattern)).rejects.toThrow(
      'No template file found for pattern'
    )
  })
})
