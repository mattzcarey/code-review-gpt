import { password } from "@inquirer/prompts";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import { PlatformOptions, ReviewArgs } from "../common/types";
import { logger } from "../common/utils/logger";

export const configure = async (yargs: ReviewArgs): Promise<void> => {
  if (yargs.setupTarget === PlatformOptions.GITHUB) {
    await configureGitHub();
  }
  if (yargs.setupTarget === PlatformOptions.GITLAB) {
    await configureGitLab();
  }
  if (yargs.setupTarget == PlatformOptions.AZURE) {
    await configureAzureDevOps();
  }
};

const captureApiKey = async (): Promise<string | undefined> => {
  const apiKey = await password({
    message: "Please input your OpenAI API key:",
  });

  return apiKey;
};

const configureGitHub = async () => {
  const workflowContent = fs.readFileSync(
    path.join(__dirname, "../..templates", "github-pr.yml"),
    "utf8"
  );

  const workflowsDir = path.join(__dirname, "../../..", ".github", "workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });

  const workflowFile = path.join(workflowsDir, "code-review-gpt.yml");
  fs.writeFileSync(workflowFile, workflowContent, "utf8");

  logger.info(`Created GitHub Actions workflow at: ${workflowFile}`);

  const apiKey = await captureApiKey();

  if (!apiKey) {
    logger.error(
      "No API key provided. Please manually add the OPENAI_API_KEY secret to your GitHub repository."
    );
    return;
  }

  try {
    execSync(`gh auth status || gh auth login`, { stdio: "inherit" });
    execSync(`gh secret set OPENAI_API_KEY --body=${String(apiKey)}`);
    logger.info(
      "Successfully added the OPENAI_API_KEY secret to your GitHub repository."
    );
  } catch (error) {
    logger.error(
      "It seems that the GitHub CLI is not installed or there was an error during authentication. Don't forget to add the OPENAI_API_KEY to the repo settings/Environment/Actions/Repository Secrets manually."
    );
  }
};

const configureGitLab = async () => {
  const pipelineContent = fs.readFileSync(
    path.join(__dirname, "../../templates", "gitlab-pr.yml"),
    "utf8"
  );

  const pipelineDir = path.join(__dirname, "../../..");
  fs.mkdirSync(pipelineDir, { recursive: true });

  const pipelineFile = path.join(pipelineDir, ".gitlab-ci.yml");
  fs.writeFileSync(pipelineFile, pipelineContent, "utf8");

  logger.info(`Created GitLab CI at: ${pipelineFile}`);

  const apiKey = await captureApiKey();

  if (!apiKey) {
    logger.error(
      "No API key provided. Please manually add the OPENAI_API_KEY secret to your GitLab CI/CD environment variables for your repository."
    );

    return;
  }

  try {
    execSync(`glab auth login`, { stdio: "inherit" });
    execSync(`glab variable set OPENAI_API_KEY ${String(apiKey)}`);
    logger.info(
      "Successfully added the OPENAI_API_KEY secret to your GitLab repository.\n Please make sure you have set up your Gitlab access token before using this tool. Refer to the README (Gitlab CI section) for information on how to do this."
    );
  } catch (error) {
    logger.error(
      "It seems that the GitLab CLI is not installed or there was an error during authentication. Don't forget to add the OPENAI_API_KEY and the GITLAB_TOKEN to the repo's CI/CD Variables manually. Refer to the README (Gitlab CI section)for information on how to set up your access token."
    );
  }
};

const configureAzureDevOps = async () => {
  const pipelineContent = fs.readFileSync(
    path.join(__dirname, "../../templates", "azure-pipelines.yml"),
    "utf8"
  );

  const pipelineDir = path.join(__dirname, "../../..");
  fs.mkdirSync(pipelineDir, { recursive: true });

  const pipelineFile = path.join(pipelineDir, "azure-pipelines.yml");
  fs.writeFileSync(pipelineFile, pipelineContent, "utf8");

  logger.info(`Created Azure DevOps pipeline at: ${pipelineFile}`);

  logger.info(
    "Please configure your Azure DevOps pipeline to include the necessary steps and variables for your project."
  );
};
