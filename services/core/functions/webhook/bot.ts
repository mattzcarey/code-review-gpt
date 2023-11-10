/* eslint-disable */
import { Context, Probot } from "probot";

import { loadChat } from "./chat/loadChat";

export const app = (app: Probot): void => {
  app.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async (context: Context) => {
      const repo = context.repo();

      console.log("Hereeee...");
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
        "successfully reviewed",
        context.payload.pull_request.html_url
      );

      return "success";
    }
  );
};
