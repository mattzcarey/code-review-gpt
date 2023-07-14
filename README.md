# Code Review GPT

The Code Review GPT uses AI to suggest changes to code in files that are being staged for commit. It helps streamline the code review process by providing feedback on code that may have issues or areas for improvement. It can also be ran in your CI/CD pipeline to help speed up code reviews.

It should pick up on common issues such as:

- Dead code
- Exposed secrets
- Slow or inefficient code
- Unreadable code

Just so you know, this is in alpha and should be used for fun only. It may provide helpful suggestions or they may be completely wrong.

## Demo

https://github.com/mattzcarey/code-review-gpt/assets/77928207/92029baf-f691-465f-8d15-e1363fcb808e

## Prerequisites

- Node.js
- Git

## CI Usage (GitHub Actions)

```yml
- name: Install code-review-gpt
   run: npm install code-review-gpt

- name: Run code review script
   run: npx code-review-gpt --ci
   env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      BASE_SHA: ${{ github.event.pull_request.base.sha }}
      GITHUB_SHA: ${{ github.sha }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

See .github/workflows/pr.yml for an example.

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

Run `npm i code-review-gpt && npx code-review-gpt` in the root directory of a git repository.

### Installed globally

Run `code-review-gpt` in the root directory of a git repository.

## Roadmap

- [ ] Make a more clever way to find the exact code to review
- [ ] Use some embeddings and vector store to build a knowledge graph
- [ ] Prompt engineering to refine the prompt
- [ ] Support different LLMs
- [ ] Cash in on the cloud offering

## Sponsors ❤️

<a href="https://www.quivr.app/">
    <img src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/30361248-3159-4535-8efb-b114989ae886" alt="quivr logo" width="150" height="150">
</a>

<a href="https://www.aleios.com/">
    <img src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/a47c2460-b866-433f-a4c9-efb5737d4fed" alt="aleios logo" width="150" height="150">
</a>
