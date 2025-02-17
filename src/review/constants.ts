export const signOff =
  '#### Powered by [Code Review GPT](https://github.com/mattzcarey/code-review-gpt)';

export type AIModelName = (typeof modelInfo)[number]['model'];

export const modelInfo = [
  {
    model: 'gpt-4o-mini',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'gpt-4o',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'gpt-4-turbo',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'gpt-4-turbo-preview',
    maxPromptLength: 300000, //128k tokens
  },
  {
    model: 'gpt-4',
    maxPromptLength: 21000, //8k tokens
  },
  {
    model: 'gpt-4-32k',
    maxPromptLength: 90000, //32k tokens
  },
  {
    model: 'gpt-3.5-turbo',
    maxPromptLength: 9000, //4k tokens
  },
  {
    model: 'gpt-3.5-turbo-16k',
    maxPromptLength: 45000, //16k tokens
  },
  {
    model: 'deepseek-chat',
    maxPromptLength: 180000, //64k tokens
  },
  {
    model: 'deepseek-reasoner',
    maxPromptLength: 180000, //64k tokens
  },
] as const; // Response needs about 1k tokens ~= 3k characters

export const modelsNames = modelInfo.map((item) => item.model);

export const languageMap = {
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
} as const;

export const supportedFiles = new Set(Object.keys(languageMap));

export const excludedKeywords = new Set(['types']);

export const maxFeedbackCount = 3;

//for cost optimized changed lines
export const MAX_SURROUNDING_LINES = 5;
