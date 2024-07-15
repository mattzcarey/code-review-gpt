import { readdirSync } from "fs"
import path from "path"
import { TextLoader } from "langchain/document_loaders/fs/text"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

import { CreateMemoryStore } from "../../common/model/createMemoryStore"

/**
 * Load a snapshot for a test from a file.
 * @param snapshotPath The path to the snapshot file.
 * @returns The snapshot as a Document.
 */
const loadSnapshot = async (snapshotPath: string) => {
  const snapshotLoader = new TextLoader(snapshotPath)

  return await snapshotLoader.load()
}

/**
 * Load all snapshots from a directory.
 * @param snapshotsDir The directory containing the snapshots.
 * @returns The snapshots in a MemoryVectorStore.
 */
export const loadSnapshots = async (snapshotsDir: string): Promise<MemoryVectorStore> => {
  const snapshotFiles = readdirSync(snapshotsDir)

  const snapshots = await Promise.all(
    snapshotFiles.map(async snapshotFile => {
      return loadSnapshot(path.join(snapshotsDir, snapshotFile))
    })
  )

  return await CreateMemoryStore(snapshots.flat())
}
