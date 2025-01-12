import { exec } from 'child_process';
import { join } from 'path';

import { getGitHubEnvVariables, getGitLabEnvVariables, gitAzdevEnvVariables } from '../../config';
import { PlatformOptions } from '../types';
import { logger } from '../utils/logger';

export const getChangedFilesNamesCommand = (isCi: string | undefined): string => {
  if (isCi === PlatformOptions.GITHUB) {
    const { githubSha, baseSha } = getGitHubEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${baseSha} ${githubSha}`;
  }

  if (isCi === PlatformOptions.GITLAB) {
    const { gitlabSha, mergeRequestBaseSha } = getGitLabEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${mergeRequestBaseSha} ${gitlabSha}`;
  }

  if (isCi === PlatformOptions.AZDEV) {
    const { azdevSha, baseSha } = gitAzdevEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${baseSha} ${azdevSha}`;
  }

  if (isCi === undefined) {
    return 'git diff --name-only --diff-filter=AMRT --cached';
  }

  throw new Error('Invalid CI platform');
};

export const getGitRoot = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --show-toplevel', (error, stdout) => {
      if (error) {
        reject(new Error(`Failed to find git root. Error: ${error.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

export const getChangedFilesNames = async (isCi: string | undefined): Promise<string[]> => {
  const gitRoot = await getGitRoot();
  logger.debug('gitRoot', gitRoot);
  const commandString = getChangedFilesNamesCommand(isCi);
  logger.debug('commandString', commandString);
  return new Promise((resolve, reject) => {
    exec(commandString, { cwd: gitRoot }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`));
      } else {
        const files = stdout
          .split('\n')
          .filter((fileName) => fileName.trim() !== '')
          .map((fileName) => join(gitRoot, fileName.trim()));
        resolve(files);
      }
    });
  });
};
