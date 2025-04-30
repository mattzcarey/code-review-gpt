# Shippie CI/CD 

### Option 1: Review every PR to main

Trigger a code review on any PR into main, updating it each time you push changes.

```yaml
name: Shippie 🚢

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

      - name: Shippie 🚢
        uses: mattzcarey/shippie@v0.10.0
        with:
          GITHUB_TOKEN: ${{ github.token }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          MODEL_STRING: "openai:gpt-4o"
```

### Option 2: Assign a shippie bot

In this config, a review is triggered when a specific user is added as a "reviewer" in the Github UI. Create an additional Github account such as 'YourProject-ML-CR-bot', then specify the account username in the config.

This option can save on API costs by only reviewing when explicity asked to. It can also be used to avoid reviewing PRs before they are ready (draft/WIP PRs).

To trigger a re-review, simply remove and re-add the bot to the reviewers list.

```yaml
name: Shippie 🚢

on:
  pull_request:
    types: [ review_requested ]

jobs:
  run_code_review:
    if: ${{ github.event.requested_reviewer.login == 'YourProject-ML-CR-bot'}}
    runs-on: ubuntu-latest
```

