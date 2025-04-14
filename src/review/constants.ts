export const signOff =
  '#### Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)';

export const languageMap: { [key: string]: string } = {
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
  '.vue': 'Vue',
  '.tf': 'Terraform',
  '.hcl': 'Terraform',
  '.swift': 'Swift',
};

export const supportedFiles = new Set(Object.keys(languageMap));

export const excludedKeywords = new Set(['types']);

export const maxFeedbackCount = 3;

//for cost optimized changed lines
export const MAX_SURROUNDING_LINES = 5;
