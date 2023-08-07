import yargs from "yargs";
import dotenv from "dotenv";
import { logger } from "./common/utils/logger";
import { PlatformOptions, ReviewArgs } from "./common/types";

dotenv.config();

const handleNoCommand = async () => {
  const inquirer = await import("inquirer");
  const questions = [
    {
      type: "list",
      name: "command",
      message: "What do you want to do?",
      choices: [
        { name: "Review the staged files", value: "review" },
        {
          name: "Configure the script (Recommended for first time use)",
          value: "configure",
        },
      ],
    },
  ];

  const answers = await inquirer.default.prompt(questions);
  return answers.command;
};

export const getYargs = async (): Promise<ReviewArgs> => {
  const argv = yargs
    .option("ci", {
      description:
        "Indicates that the script is running on a CI environment. Specifies which platform the script is running on, 'github' or 'gitlab'. Defaults to 'github'.",
      choices: ["github", "gitlab"],
      type: "string",
      coerce: (arg) => {
        return arg || "github";
      },
    })
    .option("setupTarget", {
      description: "Specifies for which platform ('github' or 'gitlab') the project should be configured for. Defaults to 'github'.",
      choices: ["github", "gitlab"],
      type: "string",
      default: "github",
    })
    .option("commentPerFile", {
      description:
        "Enables feedback to be made on a file-by-file basis. Only work when the script is running on GitHub.",
      type: "boolean",
      default: false,
    })
    .option("model", {
      description: "The model to use for generating the review",
      type: "string",
      default: "gpt-4",
    })
    .option("remote", {
      description: "The identifier of a remote Pull Request to review",
      type: "string",
      coerce: (arg) => {
        return arg || "";
      },
    })
    .option("debug", {
      description: "Enables debug logging",
      type: "boolean",
      default: false,
    })
    .command("review", "Review the pull request")
    .command("configure", "Configure the script")
    .parseSync();

  if (!argv._[0]) {
    argv._[0] = await handleNoCommand();
  }

  if (argv.shouldCommentPerFile && !argv.isCi) {
    throw new Error(
      "The 'commentPerFile' flag requires the 'ci' flag to be set."
    );
  }

  if (argv.isCi === PlatformOptions.GITLAB && argv.shouldCommentPerFile) {
    logger.warn(
      "The 'commentPerFile' flag only works for GitHub, not for GitLab."
    );
  }

  return argv;
};
