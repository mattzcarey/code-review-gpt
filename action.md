# Code Review GPT Action

## Setup

First thing you'd need to do is create an OPENAI_API_KEY secret in github, more info on how to set secrets for your github actions can be found [here](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).

Once you've set your secret you can create a new file in your workflow called crgpt.yml, which should look like something seen below. An important attribute to include, is the fetch-depth of the checkout action below. Currently the action only works when it has access to the repo's entire commit history.

```shell
name: Code Review GPT

on:
  pull_request:
    branches: [main]

jobs:
  run_code_review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Code Review GPT
        uses: mattzcarey/code-review-gpt@v0.1.8
        with:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          MODEL: 'gpt-4o'
          GITHUB_TOKEN: ${{ github.token }}
```