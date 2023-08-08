# Code Review GPT

[![NPM][npm_badge]][npm]
[![Contributors][contributors_badge]][contributors]
[![Pulse][pulse_badge]][pulse]
[![License][license_badge]][license]
[![Twitter][twitter_badge]][twitter]

## We give engineers their weekends back

Code Review GPT uses Large Language Models to review code in your CI/CD pipeline. It helps streamline the code review process by providing feedback on code that may have issues or areas for improvement.

It should pick up on common issues such as:

- Exposed secrets
- Slow or inefficient code
- Unreadable code

It can also be run locally in your command line to review staged files.

Code Review GPT is in alpha and should be used for fun only. It may provide useful feedback but please check any suggestions thoroughly.

## Demo

https://github.com/mattzcarey/code-review-gpt/assets/77928207/92029baf-f691-465f-8d15-e1363fcb808e

## Prerequisites

- Node.js
- Git
- Github or Gitlab CLI (optional for configure tool)

## Easy Setup in CI 🚀

In the root of your git repository run:

### Github Actions

```shell
npm install code-review-gpt
npx code-review-gpt configure --setupTarget=github
```

### Gitlab CI

If you are running this tool in Gitlab, you will need to do some additional setup. You will need to create a **access token** in Gitlab and store it in your CI/CD variables to allow the bot access to you Gitlab account. Follow the steps below.

#### Get Your Access Token
1. Log in to your GitLab account.
2. Go to your **User Settings** by clicking on your profile picture in the top right corner and selecting **Preferences**.
3. In the left sidebar, under the **Access Tokens** section, you can generate a new personal access token.
4. Name your token something relevant and understandable ie. `CODE_REVIEW-GPT-TOKEN`. Set the scope to be `api` only. 
5. Click the "Create personal access token" button. GitLab will generate the token and display it to you ***once***. Make sure to copy this value, we are going to use it in the next step.

#### Set Access Token as a CI/CD Variable
1. Navigate to the project where you want to add the code review bot.
2. In the left sidebar, click the **Settings** drop down, then click **CI/CD**
3. Scroll down to the **Variables** section and click the **Expand** button.This is where you can manage your CI/CD variables.
4. Create a new variable by clicking the **Add Variable** button in the CI/CD Variable table. 
5. Paste your previously copied access token into the **Value** box. Name the variable `GITLAB_TOKEN`. Under the **Flags** section, make sure to tick the `Mask variable` option. 

   - [Un-tick the `Protect variable` if your branches are not protected, otherwise this variable won't be availiable for the bot to use.]
6. Save you changes. Now you can go ahead and run the following commands in you project directory.


```shell
npm install code-review-gpt
npx code-review-gpt configure --setupTarget=gitlab
```


See templates for example yaml files. Copy and paste them to perform a manual setup.

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

- `--commentPerFile` - Used when the `--ci` flag is set. Defaults to false. It enables the bot to comment the feedback on a file-by-file basis.

- `--setupTarget` - Used with the `configure` command. Options are --setupTarget=("github" | "gitlab"). Defaults to "github" if no option is specified. Specifies for which platform ('github' or 'gitlab') the project should be configured for.

- `--model` - The model to use for the review. Defaults to `gpt-4`. You can use any openai model you have access to.

- `--debug` - Runs the application in debug mode. This will enable debug logging.

## Getting Started Contributing 💫

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

See the package.json file for all the npm commands you can run.

5. Make a package release 🎉

We use [release-please](https://github.com/googleapis/release-please) on this project. If you want to create a new release from your PR, please make sure your PR title follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format. The release-please bot will automatically create a new release for you when your PR is merged.

- fix: which represents bug fixes, and correlates to a patch version.
- feat: which represents a new feature, and correlates to a SemVer minor.
- feat!:, or fix!:, refactor!:, etc., which represent a breaking change (indicated by the !) and will result in a major version.

## Roadmap (see projects tab) 🌏

## Sponsors ❤️

<a href="https://www.quivr.app/">
    <img src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/30361248-3159-4535-8efb-b114989ae886" alt="quivr logo" width="150" height="150">
</a>

<a href="https://www.aleios.com/">
    <img src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/a47c2460-b866-433f-a4c9-efb5737d4fed" alt="aleios logo" width="150" height="150">
</a>

## Star History ⭐️

[![Star History Chart](https://api.star-history.com/svg?repos=mattzcarey/code-review-gpt&type=Date)](https://star-history.com/#mattzcarey/code-review-gpt&Date)

<!-- Badges -->

[npm]: https://www.npmjs.com/package/code-review-gpt
[npm_badge]: https://img.shields.io/npm/dm/code-review-gpt.svg
[license]: https://opensource.org/licenses/MIT
[license_badge]: https://img.shields.io/github/license/mattzcarey/code-review-gpt.svg?color=blue&style=flat-square&ghcache=unused
[contributors]: https://github.com/mattzcarey/code-review-gpt/graphs/contributors
[contributors_badge]: https://img.shields.io/github/contributors/mattzcarey/code-review-gpt
[pulse]: https://github.com/mattzcarey/code-review-gpt/pulse
[pulse_badge]: https://img.shields.io/github/commit-activity/m/mattzcarey/code-review-gpt
[twitter]: https://twitter.com/intent/follow?screen_name=oriontools.ai
[twitter_badge]: https://img.shields.io/twitter/follow/oriontoolsai?style=social&logo=twitter
