import { Context, Probot } from "probot";

import { loadChat } from "./chat/loadChat";

export const bot = (app: Probot): void => {
  app.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async (context: Context) => {
      const repo = context.repo();

      const chat = await loadChat(context);

      try {
        const review = await chat.getReview();

        await context.octokit.issues.createComment({
          repo: repo.repo,
          owner: repo.owner,
          issue_number: context.pullRequest().pull_number,
          body: review,
        });
      } catch (e) {
        console.error(e);
      }
    }
  );
};
