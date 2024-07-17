# Custom LLM training and inference module

## Goal

The aim of this module is to detect stylistic regressions in a codebase introduced by a code change ie bad practices.

We aim to do this:

- Train a model to classify whether a code change conforms to a set of best practices or common mistakes
- Make it easy to run this model on a PR. 

## Training

- LLM could be fine-tuned on review comments from the github repo.

## Inference

- The llm should be stored in the repo and loaded into the github runner. It should be ran on the M1 runner using MLX for cheap and fast inference.
- It should be cheap and fast enough that this LLM can input file diff from the PR. For each diff the LLm should output whether the diff should be accepted or not
- Optional - The LLM should also be able to call external tools (like read_file) to understand the context if needed.

## LLM Selection

8B param is a good starting point to be cost efficient. The new Groq Llama3 Tool calling model or WizardLLM would be good candidates.
