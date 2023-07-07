import yargs from "yargs";

const argv = yargs
  .option("ci", {
    description: "Indicate that the script is running on a CI environment",
    type: "boolean",
  })
  .parseSync();

export const gitCommand = (): string => {
  if (argv.ci) {
    return "git diff --name-only main ${{ github.event.pull_request.head.ref }}";
  } else {
    return "git diff --name-only --cached";
  }
};
