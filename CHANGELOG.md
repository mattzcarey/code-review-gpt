# Changelog

## [0.1.0](https://github.com/mattzcarey/code-review-gpt/compare/v0.0.34...v0.1.0) (2023-08-16)

### Features

- add demo prompt for code snippet ([3bf76bf](https://github.com/mattzcarey/code-review-gpt/commit/3bf76bfb3bcdfd6e328c5e53d511a8c00aef253d))
- docs on how to set up gitlab access token ([a9643f2](https://github.com/mattzcarey/code-review-gpt/commit/a9643f2b5b973597ca422273c2d3fc742b6c1758))
- make review function return feedback ([c58fcee](https://github.com/mattzcarey/code-review-gpt/commit/c58fcee62942373f649b0a955a89716bd7560721))
- pass OpenAIApiKey as a parameter in lambdas instead of taking from process.env ([ba47456](https://github.com/mattzcarey/code-review-gpt/commit/ba47456e0ef85ab1637233b545f77c679af5c537))

### Bug Fixes

- do not add file to prompt if only removed lines ([#174](https://github.com/mattzcarey/code-review-gpt/issues/174)) ([a33f49a](https://github.com/mattzcarey/code-review-gpt/commit/a33f49a11bcb42327ef66b13eb8046f967046492))

## [0.0.34](https://github.com/mattzcarey/code-review-gpt/compare/v0.2.2...v0.0.34) (2023-08-07)

### Features

- add back filter files in review ([3aee4f7](https://github.com/mattzcarey/code-review-gpt/commit/3aee4f76e3b3bcfd4cc485d40444402a6f738b42))
- Added PHP to languageMap ([#110](https://github.com/mattzcarey/code-review-gpt/issues/110)) ([0de1790](https://github.com/mattzcarey/code-review-gpt/commit/0de17903b9e75d5a8cf1ca6c569b209371ccfb4e))
- authjs following nextjs 13 structure ([2893313](https://github.com/mattzcarey/code-review-gpt/commit/2893313c013b932859412259090ba241c7a4978f))
- authjs github login ([7f02c16](https://github.com/mattzcarey/code-review-gpt/commit/7f02c1634926c48b59082a61a44c08f81e31a66c))
- automated release pipeline ([#102](https://github.com/mattzcarey/code-review-gpt/issues/102)) ([1475c7d](https://github.com/mattzcarey/code-review-gpt/commit/1475c7dd3a2fb42fb46052e5956dd1cd96fecdef))
- bump package ([4ec97a1](https://github.com/mattzcarey/code-review-gpt/commit/4ec97a1b636f4ab72e92774774bd89474f441543))
- bump package ([793ffa6](https://github.com/mattzcarey/code-review-gpt/commit/793ffa67251aacebf91273397ab32e86de7c0df0))
- bump package ([1925493](https://github.com/mattzcarey/code-review-gpt/commit/1925493d0c968c81acb0131f3bc1332cb70c0f36))
- bump package ([2e8b916](https://github.com/mattzcarey/code-review-gpt/commit/2e8b916204a4a68e2666125d16e2104631565d47))
- bump package ([7b5d77a](https://github.com/mattzcarey/code-review-gpt/commit/7b5d77a415593517e6a01e0f72e98786b8639514))
- bump version ([f656a83](https://github.com/mattzcarey/code-review-gpt/commit/f656a8333f91b5a83db26b58466321481f3133db))
- ci commenting ([#2](https://github.com/mattzcarey/code-review-gpt/issues/2)) ([056b0f6](https://github.com/mattzcarey/code-review-gpt/commit/056b0f62350a1af97234febd9ee05b20afda2c2d))
- ci test ([#41](https://github.com/mattzcarey/code-review-gpt/issues/41)) ([4734ef1](https://github.com/mattzcarey/code-review-gpt/commit/4734ef1d89d09462b8bc257a1e8af9f5c044a15a))
- configure option ([#14](https://github.com/mattzcarey/code-review-gpt/issues/14)) ([937fcd0](https://github.com/mattzcarey/code-review-gpt/commit/937fcd0b57e8e247d4c452339ad30a7004eaaa37))
- create some abstraction in llms ([0a64bc4](https://github.com/mattzcarey/code-review-gpt/commit/0a64bc4e7ef66bc329b581ababed651aa1938f25))
- debug logging and logging logic in ci, local and debug mode ([#77](https://github.com/mattzcarey/code-review-gpt/issues/77)) ([a154cab](https://github.com/mattzcarey/code-review-gpt/commit/a154cab1ffcd858c3766b4f26aefcda968a5bfdc))
- esbuild ([026e134](https://github.com/mattzcarey/code-review-gpt/commit/026e134be59cf222bdc8ff8d11a5eba2eb03772c))
- **feedback:** limit the number of feedbacks to 5 feedbacks at most ([b52441d](https://github.com/mattzcarey/code-review-gpt/commit/b52441d5adf19523181b848805a7956efaeba510))
- gh action ([0be4bf1](https://github.com/mattzcarey/code-review-gpt/commit/0be4bf1cc455c9612c12fcde2910fafe32b10643))
- gh action ([6458144](https://github.com/mattzcarey/code-review-gpt/commit/64581442b0e9d755eba19b94516cc5eec08a3b70))
- header styling and linking to the repo ([e8a1085](https://github.com/mattzcarey/code-review-gpt/commit/e8a1085b2b776619aa0d11d1b2e10eec49f5f172))
- init ([98990cb](https://github.com/mattzcarey/code-review-gpt/commit/98990cbf431d998c102a49e4839ac1b8476ac6a4))
- keywords ([47e804b](https://github.com/mattzcarey/code-review-gpt/commit/47e804b55bfbc66c25bf5e313bf1f9e971d9e9ad))
- mask apiKey in prompt and add async functions ([cc95720](https://github.com/mattzcarey/code-review-gpt/commit/cc9572072751f0bb144c7b3eca486fadf3031193))
- move git commands in common folder out of review ([b4bd034](https://github.com/mattzcarey/code-review-gpt/commit/b4bd0343654b67b1ae9523e24f38721b1f927c14))
- new version ([554f02a](https://github.com/mattzcarey/code-review-gpt/commit/554f02a8ea877b12ffd1037af3e6ba28bf383614))
- nextjs app with sst ([44d8f57](https://github.com/mattzcarey/code-review-gpt/commit/44d8f57b6c51fe3ebebb5f088849abb08b6f8a03))
- package bump ([fce63cd](https://github.com/mattzcarey/code-review-gpt/commit/fce63cddc1b3d05db5c90e9ce19dc7b6648ee4d9))
- package push ([b1b8703](https://github.com/mattzcarey/code-review-gpt/commit/b1b8703bb61a66ff8ce9513dfbd6ee0621770490))
- published to npm ([614e3c6](https://github.com/mattzcarey/code-review-gpt/commit/614e3c6f5e703443f77d988686837ac616e4f9fc))
- remove dead cod and refactor ([506ced5](https://github.com/mattzcarey/code-review-gpt/commit/506ced57c266d0f33a1ea9618aaddf8692bee6a5))
- remove errors for no supported files ([347821e](https://github.com/mattzcarey/code-review-gpt/commit/347821e48c1e3e00e5be7a7bb7fedfcc1d65b879))
- signoff ([#6](https://github.com/mattzcarey/code-review-gpt/issues/6)) ([37c5daf](https://github.com/mattzcarey/code-review-gpt/commit/37c5daffd9c7f4f9fedefc9a7fc6936a6f5bad9c))
- split up prompts ([4e26f23](https://github.com/mattzcarey/code-review-gpt/commit/4e26f2381378fae7417a3849d2607035552239e8))
- **test:** add test command and implement code snippet generation ([1669305](https://github.com/mattzcarey/code-review-gpt/commit/1669305c79c3a3b6cbe452414640b9e3a2732f25))
- update comments ([#9](https://github.com/mattzcarey/code-review-gpt/issues/9)) ([c13c3fc](https://github.com/mattzcarey/code-review-gpt/commit/c13c3fc95245a65a3bb235efbef6b3ae22b52326))
- update readme ([21bee1b](https://github.com/mattzcarey/code-review-gpt/commit/21bee1b1931411d2a375a652b761771e3099e7b9))
- use tslog for logging ([4d287ff](https://github.com/mattzcarey/code-review-gpt/commit/4d287ff480e4da0535641523237454f8962b801e))

### Bug Fixes

- add id to release please ci step ([29345e7](https://github.com/mattzcarey/code-review-gpt/commit/29345e73069410b56661c00cf2203507c3567248))
- brackets in json ([58e4b6a](https://github.com/mattzcarey/code-review-gpt/commit/58e4b6a543210700c893d242b837ece08a4f2896))
- bump package ([db101e0](https://github.com/mattzcarey/code-review-gpt/commit/db101e00f56cf7e50977581679ebd6f609b3c4b6))
- do not send changedLines in prompt ([96475b3](https://github.com/mattzcarey/code-review-gpt/commit/96475b339729f0e56a5ad7f2e273cb4a17120305))
- exit when there is no file to review ([81097f1](https://github.com/mattzcarey/code-review-gpt/commit/81097f1f0b64618a3c51f90ec54d37178fdc8213))
- explicit exit code and return in review index ([9bb8140](https://github.com/mattzcarey/code-review-gpt/commit/9bb81400132a8c7c06057c559bdab3e1b354bf81))
- gitlab git command ([4f19728](https://github.com/mattzcarey/code-review-gpt/commit/4f19728c340a7ec072bd0a559ccd5167980ce9d3))
- gitlab support improvements ([#97](https://github.com/mattzcarey/code-review-gpt/issues/97)) ([a5c7d6b](https://github.com/mattzcarey/code-review-gpt/commit/a5c7d6be3d66cd179e7bfa10e3a4ef16351223ca))
- log type ([2a18fa6](https://github.com/mattzcarey/code-review-gpt/commit/2a18fa665572c9a89e7ce6119cf53c41b7ffd1fc))
- max prompt length per model ([#33](https://github.com/mattzcarey/code-review-gpt/issues/33)) ([fc45818](https://github.com/mattzcarey/code-review-gpt/commit/fc458188d5a5b97d7f1510f0bfccd4d608f7209e))
- openai_api_key ([915f806](https://github.com/mattzcarey/code-review-gpt/commit/915f8061e9de3c0312e4ffeaa0b3990633c6d15e))
- permissions ([91979c9](https://github.com/mattzcarey/code-review-gpt/commit/91979c96a5b95ef061ef0e44207b956b0aaffc82))
- releases_created ([#106](https://github.com/mattzcarey/code-review-gpt/issues/106)) ([4d18dbe](https://github.com/mattzcarey/code-review-gpt/commit/4d18dbe444d1fc9368cb20bb9157f90ca7d04fa2))
- remove console.log ([e28d1e5](https://github.com/mattzcarey/code-review-gpt/commit/e28d1e57435a4b4687c8a0268eeaf3e884b01acf))
- remove debug workflows ([c0a5c4b](https://github.com/mattzcarey/code-review-gpt/commit/c0a5c4b76d35ca1f15f044f1effa6120abbe3d76))
- remove unnecessary async in function ([fa9db17](https://github.com/mattzcarey/code-review-gpt/commit/fa9db170990fb799c0fffadbf9b37277685640f8))
- separate flags for review and configure ([5cb8b69](https://github.com/mattzcarey/code-review-gpt/commit/5cb8b6971ca0662fe791db5b904d2404fa63d0b7))
- use same format for all command and options formats ([3971793](https://github.com/mattzcarey/code-review-gpt/commit/3971793ceec305844f27080c7c93aebe6e0be76d))
- version number ([41a723d](https://github.com/mattzcarey/code-review-gpt/commit/41a723dd86990592de2e420ebb12b2bb087ac405))

### Miscellaneous Chores

- update description ([#118](https://github.com/mattzcarey/code-review-gpt/issues/118)) ([9dca0a0](https://github.com/mattzcarey/code-review-gpt/commit/9dca0a0c49ad6a5891529e0ea52134eccbf98fc4))
