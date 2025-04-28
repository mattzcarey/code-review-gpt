import { getGitRoot } from '../../common/git/getChangedFilesNames';
import type { ReviewFile } from '../../common/types';
import { createFileInfo } from './fileInfo';
import { instructionPrompt } from './prompts';
import { getLanguageName } from './utils/fileLanguage';

export const constructPrompt = async (
  files: ReviewFile[],
  reviewLanguage: string
): Promise<string> => {
  const workspaceRoot = await getGitRoot();

  // Ensure there are files before trying to access files[0]
  const languageName = files.length > 0 ? getLanguageName(files[0].fileName) : 'default';

  const languageToInstructionPrompt = instructionPrompt
    .replace('{ProgrammingLanguage}', languageName)
    .replace('{ReviewLanguage}', reviewLanguage);

  // Pass the ReviewFile array and workspaceRoot
  const fileInfo = createFileInfo(files, workspaceRoot);

  return `${languageToInstructionPrompt}\n${fileInfo}`;
};
