import { getCustomLanguageMap } from '../config';

export const signOff =
  '#### Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)';

export const defaultLanguageMap: { [key: string]: string } = {
  '.js': 'JavaScript',
  '.ts': 'TypeScript',
  '.py': 'Python',
  '.sh': 'Shell',
  '.go': 'Go',
  '.rs': 'Rust',
  '.tsx': 'TypeScript',
  '.jsx': 'JavaScript',
  '.dart': 'Dart',
  '.php': 'PHP',
  '.cpp': 'C++',
  '.h': 'C++',
  '.c': 'C',
  '.cxx': 'C++',
  '.hpp': 'C++',
  '.hxx': 'C++',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.java': 'Java',
  '.groovy': 'Groovy',
  '.vue': 'Vue',
  '.tf': 'Terraform',
  '.hcl': 'Terraform',
  '.swift': 'Swift',
};

export const languageMap: { [key: string]: string } = {
  ...defaultLanguageMap,
  ...getCustomLanguageMap(),
};

export const supportedFiles = new Set(Object.keys(languageMap));

export const excludedKeywords = new Set(['types']);
