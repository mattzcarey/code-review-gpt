import { Context, Probot } from "probot";

import { loadChat } from "./chat/loadChat";

export const app = (app: Probot): void => {
  app.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async (context: Context) => {
      const repo = context.repo();

      console.log("Received event:", context.name, repo);

      const chat = await loadChat(context);

      try {
        const review = await chat.getReview();

        await context.octokit.issues.createComment({
          repo: repo.repo,
          owner: repo.owner,
          issue_number: context.pullRequest().pull_number,
          body: review,
        });

        console.log("Commented on PR:", repo);
      } catch (e) {
        console.error(e);
      }

      console.info(
        `Successfully reviewed: ${context.pullRequest().owner as string}/${
          context.pullRequest().repo as string
        }/${context.pullRequest().pull_number as number}`
      );

      return "Success";
    }
  );
};
