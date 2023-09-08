# Code Review GPT 🤖

Code Review GPT is a NodeJS package that uses LLMs to provide feedback on code. It is designed to be used in a CI environment to provide feedback on pull requests.

## Prerequisites

- Node 18+
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
2. Go to your **Repo settings** by clicking on the repository, and selecting **Settings** -> **Access Tokens**.
3. In this section, you can generate a new access token.
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

- `--remote` - Used with the 'review' command. Usage `--remote=mattzcarey/code-review-gpt#96`. Review a remote GitHub Pull Request.

- `--commentPerFile` - Used when the `--ci` flag is set. Defaults to false. It enables the bot to comment the feedback on a file-by-file basis.

- `--setupTarget` - Used with the `configure` command. Options are --setupTarget=("github" | "gitlab"). Defaults to "github" if no option is specified. Specifies for which platform ('github' or 'gitlab') the project should be configured for.

- `--model` - The model to use for the review. Defaults to `gpt-4`. You can use any openai model you have access to.

- `--debug` - Runs the application in debug mode. This will enable debug logging.

- `--org` - The organization id to be used for OpenAI. This should only be used if you are member of multiple organisations and want to use your non default org.