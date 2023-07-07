import yargs from "yargs";

import yargs from "yargs";

const argv = yargs
  .option("ci", {
    description: "Indicate that the script is running on a CI environment",
    type: "boolean",
  })
  .option("base_sha", {
    description: "The base SHA",
    type: "string",
  })
  .option("github_sha", {
    description: "The GitHub SHA",
    type: "string",
  })
  .parseSync();

export const gitCommand = (): string => {
  if (argv.ci) {
    return `git diff --name-only --diff-filter=ACMRT ${argv.base_sha} ${argv.github_sha}`;
  } else {
    return "git diff --name-only --diff-filter=ACMRT --cached";
  }
};
