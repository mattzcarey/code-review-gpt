import type { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

export const CreateMemoryStore = async (initialFiles: Document[]): Promise<MemoryVectorStore> => {
  const embeddings = new OpenAIEmbeddings();

  return await MemoryVectorStore.fromDocuments(initialFiles, embeddings);
};
