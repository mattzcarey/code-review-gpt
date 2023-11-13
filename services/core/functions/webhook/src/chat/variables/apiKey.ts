import { Context } from "probot";

export const getAPIKeyFromGH = async (
  context: Context<"pull_request">
): Promise<string> => {
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

    return data.value;
  } catch {
    await context.octokit.issues.createComment({
      repo: repo.repo,
      owner: repo.owner,
      issue_number: context.pullRequest().pull_number,
      body: `@${repo.owner} I can't access your OPENAI_API_KEY. This is set in your GitHub repository at Settings/Actions/Repository Variables/Secrets. Please contact the repository owner to set this up.`,
    });

    throw new Error("Error fetching OPENAI_API_KEY");
  }
};
