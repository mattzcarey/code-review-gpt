import { extname } from "path";

import { PromptFile } from "../../common/types";
import { languageMap } from "../constants";

export const getLanguageName = (files: PromptFile[]): string => {
  const extensions = files.reduce<Set<string>>((set, file) => {
    set.add(languageMap[extname(file.fileName)] || "Software Development");

    return set;
  }, new Set<string>());

  

  return Array.from(extensions).join(" and ");
};
