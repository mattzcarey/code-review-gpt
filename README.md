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

## Package Usage

See the [package documentation](code-review-gpt/README.md) for more information.

## Action Usage

See the [action documentation](action.md) for more information.

## Getting Started 💫

1. Clone the repository:

   ```shell
   git clone https://github.com/mattzcarey/code-review-gpt.git
   cd code-review-gpt && cd packages/code-review-gpt
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

The roadmap shifts the focus to a Github app which can be installed on any repo. This will allow for a more seamless UX and better features including a chatbot to discuss the PR and make suggestions. 

The code-review-gpt package will continue to be maintained and improved based on the feedback from the Github app.

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
[twitter]: https://twitter.com/intent/follow?screen_name=mattzcarey
[twitter_badge]: https://img.shields.io/twitter/follow/mattzcarey?style=social&logo=twitter
