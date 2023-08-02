import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { CreateMemoryStore } from './createMemoryStore';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { initialFiles } from '../../testFiles/initialFilesExample'

describe('CreateMemoryStore function', () => {
  it('Checks that the CreateMemoryStore function returns a MemoryVectorStore object', () => {
    const result = CreateMemoryStore(initialFiles);

    expect(result).toBeInstanceOf(Promise<MemoryVectorStore>);
  });

  it('Checks if the function provides the required functionality', async () => {
    const [result, expectedResult]  = await Promise.all([
      CreateMemoryStore(initialFiles),
      MemoryVectorStore.fromDocuments(initialFiles, new OpenAIEmbeddings(), {}),
    ])

    expect(result.memoryVectors.length).toEqual(expectedResult.memoryVectors.length);
  });

  it("Checks if the MemoryVectorStore returned returns a number in a similarity search", async () => {
    const result = await CreateMemoryStore(initialFiles);
    const ssWithScore = await result.similaritySearchWithScore("hello", 1);

    expect(typeof ssWithScore[0][1] === 'number').toBe(true);
  });
});