import { Context } from "probot";

import { Chat } from "./chat";

export const loadChat = async (context: Context): Promise<Chat> => {
  if (process.env.OPENAI_API_KEY) {
    return new Chat(process.env.OPENAI_API_KEY, context);
  }

  const repo = context.repo();

  try {
    const { data } = (await context.octokit.request(
      "GET /repos/{owner}/{repo}/actions/variables/{name}",
      {
        owner: repo.owner,
        repo: repo.repo,
        name: "OPENAI_API_KEY",
      }
    )) as { data: { value: string } };

    if (!data.value) {
      throw new Error("Error fetching OPENAI_API_KEY");
    }

    return new Chat(data.value, context);
  } catch {
    await context.octokit.issues.createComment({
      repo: repo.repo,
      owner: repo.owner,
      issue_number: context.pullRequest().pull_number,
      body: `@${
        repo.owner as string
      } I can't access your OPENAI_API_KEY. This is set in your GitHub repository at Settings/Actions/Repository Variables/Secrets. Please contact the repository owner to set this up.`,
    });

    throw new Error("Error fetching OPENAI_API_KEY");
  }
};
