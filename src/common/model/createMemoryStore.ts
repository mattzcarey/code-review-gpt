import { Document } from 'langchain/dist/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

export const CreateMemoryStore = async (initialFiles: Document<Record<string, any>>[]): Promise<MemoryVectorStore> => {
  const embeddingModel = new OpenAIEmbeddings();

  return await MemoryVectorStore.fromDocuments(
    initialFiles,
    embeddingModel,
    {}
  );
}