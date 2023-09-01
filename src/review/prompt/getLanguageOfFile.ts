import { extname } from "path";

import { languageMap } from "../constants";

export const getLanguageName = (fileName: string): string => {
  const extension = extname(fileName);

  return languageMap[extension] || "Unknown Language";
};
