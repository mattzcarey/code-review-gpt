# Code Review GPT

The Code Review GPT is a command-line application that uses AI to suggest changes on code in files that are being staged for commit. It helps streamline the code review process by providing feedback on code that may have issues or areas for improvement.

It should pick up on common issues such as:

- Dead code
- Exposed secrets
- Slow or inefficient code
- Unreadable code

Please note that this is in alpha and should be used for fun only. It may provide useful suggestions or they may be completely wrong. Please do not use this in a production environment.

## Prerequisites

- Node.js
- Git

## One-line Usage

```shell
npx code-review-gpt
```

## Getting Started

1. Clone the repository:

   ```shell
   git clone https://github.com/mattzcarey/code-review-gpt.git
   cd code-review-gpt
   ```

2. Install dependencies:

   ```shell
   npm install
   ```

3. Set up the API key:
   - Rename the .env.example file to .env.
   - Open the .env file and replace YOUR_API_KEY with your actual OPENAI API key.

When used globally you should run `export OPENAI_API_KEY=YOUR_API_KEY` (or similar for your operating system) in your terminal to set the API key.

4. Run the application:

   ```shell
   npm start
   ```

5. Install the application globally (optional):

   ```shell
   npm run build
   npm install -g
   ```

   This will allow you to run the application from anywhere on your machine.

## Usage

### Not installed globally

Run `npx code-review-gpt` in the root directory of a git repository.

### Installed globally

Run `code-review-gpt` in the root directory of a git repository.

## Roadmap

- [ ] Make a more clever way to find the exact code to review
- [ ] Prompt engineering to refine the prompt
- [ ] Support different LLMs
- [ ] Use some embeddings and vector store to build a knowledge graph
- [ ] Cash in on the cloud offering
