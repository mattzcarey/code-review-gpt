import { extname } from 'path';

import type { ReviewFile } from '../../common/types';
import { excludedKeywords, supportedFiles } from '../constants';

export const filterFiles = (files: ReviewFile[]): ReviewFile[] => {
  const filteredFiles = files.filter((file) => {
    const ext = extname(file.fileName);

    return (
      supportedFiles.has(ext) &&
      ![...excludedKeywords].some((keyword) => file.fileName.includes(keyword)) &&
      file.fileName.trim() !== ''
    );
  });

  return filteredFiles;
};
