import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const configure = async () => {
  const workflowContent = fs.readFileSync(
    path.join(__dirname, "pr.yml"),
    "utf8"
  );

  const workflowsDir = path.join(process.cwd(), ".github", "workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });

  const workflowFile = path.join(workflowsDir, "code-review-gpt.yml");
  fs.writeFileSync(workflowFile, workflowContent, "utf8");

  console.log(`Created GitHub Actions workflow at: ${workflowFile}`);

  const inquirer = await import("inquirer");
  const { apiKey } = await inquirer.default.prompt([
    {
      type: "input",
      name: "apiKey",
      message: "Please input your OpenAI API key:",
    },
  ]);

  if (!apiKey) {
    console.log(
      "No API key provided. Please manually add the OPENAI_API_KEY secret to your GitHub repository."
    );
    return;
  }

  try {
    execSync(`gh auth status || gh auth login`, { stdio: "inherit" });
    execSync(`gh secret set OPENAI_API_KEY --body=${apiKey}`);
    console.log(
      "Successfully added the OPENAI_API_KEY secret to your GitHub repository."
    );
  } catch (error) {
    console.log(
      "It seems that the GitHub CLI is not installed or there was an error during authentication. Don't forget to add the OPENAI_API_KEY to the repo settings/Environment/Actions/Repository Secrets manually."
    );
  }
};
