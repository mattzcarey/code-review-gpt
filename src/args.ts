import yargs from "yargs";
import dotenv from "dotenv";

dotenv.config();

export interface ReviewArgs {
  [x: string]: unknown;
  ci: boolean;
  commentPerFile: boolean;
  model: string;
  _: (string | number)[];
  $0: string;
}

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
      description: "Indicate that the script is running on a CI environment",
      type: "boolean",
      default: false,
    })
    .option("commentPerFile", {
      description: "When the script run the feedback is commented on the relevant files.",
      type: "boolean",
      default: false,
    })
    .option("model", {
      description: "The model to use for generating the review",
      type: "string",
      default: "gpt-4",
    })
    .command("review", "Review the pull request")
    .command("configure", "Configure the script")
    .parseSync();

  if (!argv._[0]) {
    argv._[0] = await handleNoCommand();
  }

  return argv;
};
