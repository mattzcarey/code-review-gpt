import yargs from "yargs";

const argv = yargs
  .option("ci", {
    description: "Indicate that the script is running on a CI environment",
    type: "boolean",
    default: false,
  })
  .option("base_sha", {
    description: "The base SHA",
    type: "string",
    default: "",
  })
  .option("github_sha", {
    description: "The GitHub SHA",
    type: "string",
    default: "",
  })
  .parseSync();

export const gitCommand = (): string => {
  if (argv.ci) {
    return `git diff --name-only --diff-filter=ACMRT ${argv.base_sha} ${argv.github_sha}`;
  } else {
    return "git diff --name-only --diff-filter=ACMRT --cached";
  }
};
