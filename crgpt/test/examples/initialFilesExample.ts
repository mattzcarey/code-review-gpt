export const initialFiles = [
  {
    pageContent: '**LOGAF Level 1 - src/test/cases/.cache/faee919bf4f6a5b85a44b1a8eacc0ca24223d6c4033a2b4c52bc79bb8e1bc1bb.ts**\n' +
      '\n' +
      'The code exposes a secret key which is a serious security issue. Never log sensitive information like API keys, passwords, or secrets. Consider using environment variables to store such sensitive information. For example:\n' +
      '\n' +
      '```typescript\n' +
      'const secretKey = process.env.SECRET_KEY;\n' +
      '\n' +
      'function exposeSecret() {\n' +
      '  console.log(`The secret key is: ${secretKey}`);\n' +
      '}\n' +
      '\n' +
      'exposeSecret();\n' +
      '```\n' +
      '\n' +
      'In this case, the secret key is stored in an environment variable named `SECRET_KEY`. Remember to add `SECRET_KEY` to your `.env` file and never commit the `.env` file to the repository.\n' +
      '\n' +
      '🔑❌🔒\n',
    metadata: {
      source: '/Users/sebo/Desktop/aleios/code-review-gpt/src/test/cases/snapshots/exposed-secret.md'
    }
  },
  {
    pageContent: '**LOGAF Level 1 - src/test/cases/.cache/5519e4e1b45143a504ec259a5d911dea930372c19b3f56b51afab53f55339b56.ts**\n' +
      '\n' +
      'The function `nestedLoops` has too many nested loops which can lead to performance issues and is hard to read and maintain. Consider refactoring the code to reduce the number of nested loops. If the logic of the code allows, you could use recursion or divide the task into smaller functions. Here is an example of how you could refactor this code using recursion:\n' +
      '\n' +
      '```\n' +
      'function recursiveLoop(depth, maxDepth, maxCount) {\n' +
      '    if (depth === maxDepth) {\n' +
      '        console.log(...arguments);\n' +
      '    } else {\n' +
      '        for (let i = 0; i < maxCount; i++) {\n' +
      '            recursiveLoop(i, depth + 1, maxDepth, maxCount);\n' +
      '        }\n' +
      '    }\n' +
      '}\n' +
      '\n' +
      'recursiveLoop(0, 10, 10);\n' +
      '```\n' +
      '\n' +
      'This code does the same thing as the original code but is much easier to read and maintain.\n' +
      '\n' +
      '🔄🐌🔧\n',
    metadata: {
      source: '/Users/sebo/Desktop/aleios/code-review-gpt/src/test/cases/snapshots/too-many-nested-loops.md'
    }
  },
];