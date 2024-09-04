# Code Review GPT Action

## Setup

First thing you'd need to do is create an OPENAI_API_KEY secret in github, more info on how to set secrets for your github actions can be found [here](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).

Once you've set your secret you can create a new file in your workflow called crgpt.yml, which should look like something seen below. An important attribute to include, is the fetch-depth of the checkout action below. Currently the action only works when it has access to the repo's entire commit history.

### Workflow yml option 1: Review every PR

Trigger a code review on any PR into main, updating it each time you push changes.

```yaml
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
        uses: mattzcarey/code-review-gpt@v0.1.10
        with:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          MODEL: 'gpt-4o'
          GITHUB_TOKEN: ${{ github.token }}
```

### Workflow yml option 2: Add a code review bot

In this config, a GPT CR is triggered when a specific user is added as a "reviewer" in the Github UI. Create an additional Github account such as 'YourProject-ML-CR-bot', then specify the account username in the config.

This option can save on API costs by only reviewing when explicity asked to. It can also be used to avoid reviewing PRs before they are ready (draft/WIP PRs).

To trigger a re-review, simply remove and re-add the bot to the reviewers list.

```yaml
name: Code Review GPT

on:
  pull_request:
    types: [ review_requested ]

jobs:
  run_code_review:
    if: ${{ github.event.requested_reviewer.login == 'YourProject-ML-CR-bot'}}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Code Review GPT
        uses: mattzcarey/code-review-gpt@v0.1.10
        with:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          MODEL: 'gpt-4o'
          GITHUB_TOKEN: ${{ github.token }}
```
