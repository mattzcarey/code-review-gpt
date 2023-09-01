import { readdirSync } from "fs";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import path from "path";

import { CreateMemoryStore } from "../../common/model/createMemoryStore";

/**
 * Load a snapshot for a test from a file.
 * @param snapshotPath The path to the snapshot file.
 * @returns The snapshot as a Document.
 */
const loadSnapshot = async (snapshotPath: string) => {
  const snapshotLoader = new TextLoader(snapshotPath);

  return await snapshotLoader.load();
};

/**
 * Load all snapshots from a directory.
 * @param shapshotsDir The directory containing the snapshots.
 * @returns The snapshots in a MemoryVectorStore.
 */
export const loadSnapshots = async (
  shapshotsDir: string
): Promise<MemoryVectorStore> => {
  const snapshotFiles = readdirSync(shapshotsDir);

  const snapshots = await Promise.all(
    snapshotFiles.map(async (snapshotFile) => {
      return loadSnapshot(path.join(shapshotsDir, snapshotFile));
    })
  );

  return await CreateMemoryStore(snapshots.flat());
};
