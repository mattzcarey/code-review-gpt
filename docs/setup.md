# Setup Instructions 🤖

Shippie 🚢 is a NodeJS package that uses LLMs to provide feedback on code. It is designed to be used in a CI environment to provide feedback on pull requests.

## Prerequisites

- Node 18+ or Bun 1.0+
- Git
- Github or Gitlab CLI (optional for configure tool)

## Easy Setup in CI 🚀

In the root of your git repository run:

```shell
npx shippie configure --setupTarget=github
```

The setup script automatically adds an `OPENAI_API_KEY` secret to your repo. More info on secrets can be found [here](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).

See [templates](https://github.com/mattzcarey/shippie/tree/main/templates) for the example yaml files. You can copy and paste them to perform a manual setup or have a look at the [action configuration options](https://github.com/mattzcarey/shippie/tree/main/docs/action-options.md).


## Package Commands

- `npx shippie review` - Runs the code review on the staged files.
- `npx shippie configure` - Runs a setup tool to configure the application.

### Configure Options

- Setup Target - The platform you are using eg. github, gitlab or azure devops.

### Review Options

Shippie supports a bunch of setup options. This is a work in progress so check out the code [here](https://github.com/mattzcarey/shippie/blob/main/src/args.ts) for the latest options.

- Review Language - The language you want to review the code in.
- Platform - The platform you are using eg. github, gitlab, azure devops, local.
- Model String - The model you want to use eg. openai:gpt-4o, azure:gpt-4o, anthropic:claude-3-5-sonnet-20240620.
- (optional) Max Steps - The maximum number of steps the bot will take. defaults to 25.
- (optional) Base URL - The base URL for the AI provider. You can change this to use OpenAI compatible providers like DeepSeek or local models with LM Studio or Ollama.

Run `npx shippie --help` to see all the options available.

## Local Usage 🌈

Shippie 🚢 also works locally to review files staged for commit. Just add some files to the staging area. 

Export your OPENAI_API_KEY to the shell

```shell
export OPENAI_API_KEY=<your-api-key>
```

and run:

```shell
npx shippie review
```

