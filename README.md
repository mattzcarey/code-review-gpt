# Code Review GPT

## We give engineers their weekends back

Code Review GPT uses Large Language Models to review code in your CI/CD pipeline. It helps streamline the code review process by providing feedback on code that may have issues or areas for improvement. 

It should pick up on common issues such as:

- Dead code
- Exposed secrets
- Slow or inefficient code
- Unreadable code

It can also be run locally in your command line to review staged files.

Just so you know, this is in alpha and should be used for fun only. It may provide helpful suggestions or they may be completely wrong.

## Demo

https://github.com/mattzcarey/code-review-gpt/assets/77928207/92029baf-f691-465f-8d15-e1363fcb808e

## Prerequisites

- Node.js
- Git
- Github CLI (optional for setup tool)

## Easy Setup (Github Actions)

In the root of your git repository run:

```shell
npm install code-review-gpt
npx code-review-gpt configure
```

## Template CI Usage (GitHub Actions)

```yml
- name: Install code-review-gpt
   run: npm install code-review-gpt

- name: Run code review script
   run: npx code-review-gpt review --ci
   env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      BASE_SHA: ${{ github.event.pull_request.base.sha }}
      GITHUB_SHA: ${{ github.sha }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

See templates/pr.yml for an example.

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

### Commands

- `code-review-gpt review` - Runs the code review on the staged files.
- `code-review-gpt configure` - Runs a setup tool to configure the application.

### Options

- `--ci` - Runs the application in CI mode. This will use the BASE_SHA and GITHUB_SHA environment variables to determine which files to review. It will also use the GITHUB_TOKEN environment variable to create a comment on the pull request with the review results.

- `--commentPerFile` - Used when the `--ci` flag is set. It enables the bot to comment the feedback on a file-by-file basis. Defaults to false.

- `--model` - The model to use for the review. Defaults to `gpt-4`. You can use any openai model you have access to.

## Roadmap

- [ ] Make a more clever way to find the exact code to review
- [ ] VSCode extension
- [ ] Use some embeddings and vector store to build a knowledge graph of the repo to make better suggestions
- [ ] Prompt engineering to refine the prompt
- [ ] Build a prompt analysis tool
- [ ] Support different LLMs... Private, HuggingFace, Azure etc.
- [ ] Build out the cloud offering

## Sponsors ❤️

<a href="https://www.quivr.app/">
    <img src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/30361248-3159-4535-8efb-b114989ae886" alt="quivr logo" width="150" height="150">
</a>

<a href="https://www.aleios.com/">
    <img src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/a47c2460-b866-433f-a4c9-efb5737d4fed" alt="aleios logo" width="150" height="150">
</a>

## Star History ⭐️👀

[![Star History Chart](https://api.star-history.com/svg?repos=mattzcarey/code-review-gpt&type=Date)](https://star-history.com/#mattzcarey/code-review-gpt&Date)

