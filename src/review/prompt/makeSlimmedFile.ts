import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getChangedLines } from "./fileLines/getChangedLines";
import { getLanguageOfFile } from "./getLanguageOfFile";
import { slimmedContextPrompt } from "./prompts";
import { ReviewFile } from "./types";
import { CreateMemoryStore } from '../../common/model/createMemoryStore';

export const makeSlimmedFile = async (
  file: ReviewFile,
  maxBatchSize: number,
  isCi: boolean
): Promise<ReviewFile> => {
  let changedLines: string;
  changedLines = await getChangedLines(file, isCi);

  if (changedLines.length > maxBatchSize) {
    console.error(
      `The changed lines are ${changedLines.length} which is longer than ${maxBatchSize}. Consider using a model with a larger context window. Slicing the changed lines...`
    );
    changedLines = changedLines.slice(0, maxBatchSize);
    return { ...file, fileContent: changedLines };
  }

  const fileLanguage = getLanguageOfFile(file.fileName);

  let splitter: RecursiveCharacterTextSplitter;
  if (!fileLanguage) {
    splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 0,
    });
  } else {
    splitter = RecursiveCharacterTextSplitter.fromLanguage(fileLanguage, {
      chunkSize: 100,
      chunkOverlap: 0,
    });
  }

  const doc = await splitter.createDocuments([changedLines]);

  // Generate memory store with the whole file
  const fileEmbeddings = await CreateMemoryStore(doc);

  // Make a similarity search between the embeddings of the whole file
  // and the embeddings of the changed lines.
  let context: string;

  context = (await fileEmbeddings.similaritySearch(changedLines))
    .map((result) => result.pageContent)
    .join("\n");

  if (context.length > maxBatchSize) {
    console.error(
      `The context of the changed lines is ${context.length} which is longer than ${maxBatchSize}. Consider using a model with a larger context window. Slicing the context...`
    );
    context = context.slice(0, maxBatchSize);
  }

  // Include the changed lines and the context of the changed lines in the prompt.
  const prompt = slimmedContextPrompt
    .replace("{fileContent}", changedLines)
    .replace("{context}", context);

  // return the file with the updated prompt
  return { ...file, fileContent: prompt };
};
