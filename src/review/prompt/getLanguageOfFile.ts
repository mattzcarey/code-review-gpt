import { SupportedTextSplitterLanguage } from "langchain/text_splitter";
import { extname } from "path";
import { supportedFiles } from "../constants";

const fileExtensionToLanguage: Record<string, SupportedTextSplitterLanguage> = {
  ".js": "js",
  ".ts": "js",
  ".py": "python",
  ".go": "go",
  ".rs": "rust",
  ".tsx": "js",
  ".jsx": "js",
  ".rb": "ruby",
};

export const getLanguageOfFile = (
  fileName: string
): SupportedTextSplitterLanguage | undefined => {
  const fileExtension = extname(fileName);

  if (supportedFiles.has(fileExtension)) {
    return fileExtensionToLanguage[fileExtension];
  }

  return undefined;
};
