# Code Review GPT - Gitlab edition

This is a fork of https://github.com/mattzcarey/code-review-gpt specially tuned to work in gitlab ci environment.

It start discussions the same way as a human code reviewer would do:

<img width="983" alt="Screenshot 2023-10-12 at 22 54 21" src="https://github.com/SCD-company/code-review-gpt/assets/5467120/73cbd59b-92df-4e4c-b8d6-d5f87ad7e3d7">

It focuses on:

- Adding first-class support for GitLab
- Saving the cost of calls to open.ai model
- Providing users with complete feedback (including information about the files that were not reviewed for any reason)
- Ensuring all the files where review is possible were reviewed

### Bugs/issues fixed

- It does not spend your money to repeat the model calls if the model answered and the answer was not parserable
- It does not spend your money to add a funcy emoji to the feedback summary
- It shows all feedback (not just the three randomly selected comments, as in the original project)
- When one file can't be parsed by the model, there is no longer a reason to skip all the other files from the same bunch
- This fork works when Gitlab runners are not at the same machine where the Gitlab is (it does not work in the original version)

### Features added

- It supports projects with more than one programming language
- It adds feedback to the files that were too large for sending to the GPT model or were too complicated for the model to understand
- For GitLab, it adds first class review the same way as humans would (via discussion placed using the correct line locations inside the merge request's changes)

### Getting started

To use it with Gitlab CI:

 - Create an access token in your gitlab project with "api" permission and at least maintainer level. Copy it.
 - Create a variable in Gitlab CI/CD named GITLAB_TOKEN containg the access token
 - Create a variable in Gitlab CI/CD named OPENAI_API_KEY and copy your access token for https://openai.com/ to its value
 - Add following snippet to your .gitlab-ci.yml

```
gpt-review:
  image: scdcompany/code-review-gpt
  stage: review
  script:
    - mv /code-review-gpt $CI_PROJECT_DIR/
    - cd ./code-review-gpt && npm run gitlab3
  only:
    - merge_requests 
  when: manual
```

Replace "npm run gitlab3" with "npm run gitlab4" to use GPT4 (note that it is 10 times more expensive)

Original readme follows:

# Code Review GPT

[![NPM][npm_badge]][npm]
[![Contributors][contributors_badge]][contributors]
[![Pulse][pulse_badge]][pulse]
[![License][license_badge]][license]
[![Twitter][twitter_badge]][twitter]
[![Slack][slack_badge]][slack]

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

## Package Usage

See the [package documentation](code-review-gpt/README.md) for more information.

## Action Usage

See the [action documentation](action.md) for more information.

## Getting Started 💫

1. Clone the repository:

   ```shell
   git clone https://github.com/mattzcarey/code-review-gpt.git
   cd code-review-gpt && cd code-review-gpt
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

5. Make a PR 🎉

We use [release-please](https://github.com/googleapis/release-please) on this project. If you want to create a new release from your PR, please make sure your PR title follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format. The release-please bot will automatically create a new release for you when your PR is merged.

- fix: which represents bug fixes, and correlates to a patch version.
- feat: which represents a new feature, and correlates to a SemVer minor.
- feat!:, or fix!:, refactor!:, etc., which represent a breaking change (indicated by the !) and will result in a major version.

## Contributors 🙏

Thanks to our wonderful contributors!

<a href="https://github.com/mattzcarey/code-review-gpt/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mattzcarey/code-review-gpt" />
</a>

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
[slack]: https://join.slack.com/t/orion-tools/shared_invite/zt-20x79nfgm-UGIHK1uWGQ59JQTpODYDwg
[slack_badge]: https://img.shields.io/badge/slack-Orion_Community-purple.svg?logo=slack
