import { readdirSync } from "fs";
import path from "path";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const loadSnapshot = async (snapshotPath: string) => {
  const snapshotLoader = new TextLoader(snapshotPath);

  return await snapshotLoader.load();
};

export const loadSnapshots = async (shapshotsDir: string) => {
  const snapshotFiles = readdirSync(shapshotsDir);

  const snapshots = await Promise.all(
    snapshotFiles.map(async (snapshotFile) => {
      return loadSnapshot(path.join(shapshotsDir, snapshotFile));
    })
  );
  return MemoryVectorStore.fromDocuments(
    snapshots.flat(),
    new OpenAIEmbeddings(),
    {}
  );
};
