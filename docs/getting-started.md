# Code Review GPT 🤖

Code Review GPT is a NodeJS package that uses LLMs to provide feedback on code. It is designed to be used in a CI environment to provide feedback on pull requests.

## Prerequisites

- Node 18+
- Git
- Github or Gitlab CLI (optional for configure tool)

## Setup in CI 🚀

See the [CI Setup](ci-setup.md) documentation for instructions on how to setup the tool in your CI environment.

## Local Usage 🌈

Code Review GPT works locally to review files staged for commit:

### Scoped Install

Run `npm i code-review-gpt && npx code-review-gpt review` in the root directory of a git repository.

### Global Install

Run `npm i -g code-review-gpt` to install the tool globally.

You can now run `code-review-gpt review` in the root directory of any git-enabled repository on your machine.

### Commands

- `code-review-gpt review` - Runs the code review on the staged files.
- `code-review-gpt configure` - Runs a setup tool to configure the application.

- `code-review-gpt test` - Runs the e2e testing suite used internally in the CI in the tool repo.

### Options

- `--ci` - Used with the `review` command. Options are --ci=("github" | "gitlab"). Defaults to "github" if no option is specified. Runs the application in CI mode. This will use the BASE_SHA and GITHUB_SHA environment variables to determine which files to review. It will also use the GITHUB_TOKEN environment variable to create a comment on the pull request with the review results.

- `--reviewType` - Used with the 'review' command. The options are --reviewType=("changed" | "full" | "costOptimized). Defaults to "changed" if no option is specified. Specifies whether the review is for the full file or just the changed lines. costOptimized limits the context surrounding the changed lines to 5 lines.

- `--remote` - Used with the 'review' command. Usage `--remote=mattzcarey/code-review-gpt#96`. Review a remote GitHub Pull Request.

- `--commentPerFile` - Used when the `--ci` flag is set. Defaults to false. It enables the bot to comment the feedback on a file-by-file basis.

- `--setupTarget` - Used with the `configure` command. Options are --setupTarget=("github" | "gitlab"). Defaults to "github" if no option is specified. Specifies for which platform ('github' or 'gitlab') the project should be configured for.

- `--model` - The model to use for the review. Defaults to `gpt-4o-mini`. You can use any openai model you have access to.

- `--debug` - Runs the application in debug mode. This will enable debug logging. Defaults to false.

- `--org` - The organization id to be used for OpenAI. This should only be used if you are member of multiple organisations and want to use your non default org.

- `--summary` - Used with the `review` command. Prints a summary of the review in emojis at the end of the review. Defaults to false.
