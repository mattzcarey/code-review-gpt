export const InstallationInstructions = `
## We give engineers their weekends back

Code Review GPT uses Large Language Models to review code in your CI/CD pipeline. It helps streamline the code review process by providing feedback on code that may have issues or areas for improvement.

It should pick up on common issues such as:

- Exposed secrets
- Slow or inefficient code
- Unreadable code

It can also be run locally in your command line to review staged files.

Code Review GPT is in alpha and should be used for fun only. It may provide useful feedback but please check any suggestions thoroughly.

## Prerequisites

- Node.js
- Git
- Github or Gitlab CLI (optional for configure tool)

## Easy Setup in CI 🚀

In the root of your git repository run:

### Github Actions

\`\`\`shell
npm install code-review-gpt
npx code-review-gpt configure --setupTarget=github
\`\`\`

### Gitlab CI

\`\`\`shell
npm install code-review-gpt
npx code-review-gpt configure --setupTarget=gitlab
\`\`\`

See templates for example yaml files. Copy and paste them to perform a manual setup.

## Local Usage 🌈

Code Review GPT works locally to review files staged for commit:

### Scoped Install

Run \`npm i code-review-gpt && npx code-review-gpt review\` in the root directory of a git repository.

### Global Install

Run \`npm i -g code-review-gpt\` to install the tool globally.

You can now run \`code-review-gpt review\` in the root directory of any git-enabled repository on your machine.

### Commands

- \`code-review-gpt review\` - Runs the code review on the staged files.
- \`code-review-gpt configure\` - Runs a setup tool to configure the application.

- \`code-review-gpt test\` - Runs the e2e testing suite used internally in the CI in the tool repo.

### Options

- \`--ci\` - Used with the \`review\` command. Options are --ci=("github" | "gitlab"). Defaults to "github" if no option is specified. Runs the application in CI mode. This will use the BASE_SHA and GITHUB_SHA environment variables to determine which files to review. It will also use the GITHUB_TOKEN environment variable to create a comment on the pull request with the review results.

- \`--reviewType\` - Used with the 'review' command. The options are --reviewType=("changed" | "full" | "costOptimized). Defaults to "changed" if no option is specified. Specifies whether the review is for the full file or just the changed lines. costOptimized limits the context surrounding the changed lines to 5 lines.

- \`--commentPerFile\` - Used when the \`--ci\` flag is set. Defaults to false. It enables the bot to comment the feedback on a file-by-file basis.

- \`--setupTarget\` - Used with the \`configure\` command. Options are --setupTarget=("github" | "gitlab"). Defaults to "github" if no option is specified. Specifies for which platform ('github' or 'gitlab') the project should be configured for.

- \`--model\` - The model to use for the review. Defaults to \`gpt-4\`. You can use any openai model you have access to.

- \`--debug\` - Runs the application in debug mode. This will enable debug logging.

## Getting Started 💫

1. Clone the repository:

   \`\`\`shell
   git clone https://github.com/mattzcarey/code-review-gpt.git
   cd code-review-gpt
   \`\`\`

2. Install dependencies:

   \`\`\`shell
   npm install
   \`\`\`

3. Set up the API key:
   - Rename the .env.example file to .env.
   - Open the .env file and replace YOUR_API_KEY with your actual OPENAI API key.

When used globally you should run \`export OPENAI_API_KEY=YOUR_API_KEY\` (or similar for your operating system) in your terminal to set the API key.

4. Run the application:

   \`\`\`shell
   npm start
   \`\`\`

See the package.json file for all the npm commands you can run.

5. Make a PR 🎉

We use [release-please](https://github.com/googleapis/release-please) on this project. If you want to create a new release from your PR, please make sure your PR title follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format. The release-please bot will automatically create a new release for you when your PR is merged.

- fix: which represents bug fixes, and correlates to a patch version.
- feat: which represents a new feature, and correlates to a SemVer minor.
- feat!:, or fix!:, refactor!:, etc., which represent a breaking change (indicated by the !) and will result in a major version.
`;