import { Context, Probot } from "probot";

import { getFilesWithChanges } from "./changes/getFilesWithChanges";
import { loadChat } from "./chat/loadChat";

export const app = (app: Probot): void => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.synchronize",
      "pull_request.reopened",
    ],
    async (context: Context<"pull_request">) => {
      const repo = context.repo();

      console.log("Received event:", context.name, repo);

      const chat = await loadChat(context);

      const { files, commits } = await getFilesWithChanges(context);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const patch = file.patch;

        if (!patch) {
          continue;
        }

        try {
          const review = await chat.getReview(patch);

          if (review) {
            await context.octokit.pulls.createReviewComment({
              repo: repo.repo,
              owner: repo.owner,
              pull_number: context.pullRequest().pull_number,
              commit_id: commits[commits.length - 1].sha,
              path: file.filename,
              body: review,
              position: patch.split("\n").length - 1,
            });
          }
          console.log("Commented on file:", file.filename);
        } catch (error) {
          console.error(`Failed to review ${file.filename}`, error);
        }
      }

      console.info(
        `Successfully reviewed: ${context.pullRequest().owner}/${
          context.pullRequest().repo
        }/${context.pullRequest().pull_number}`
      );

      return "Success";
    }
  );
};
