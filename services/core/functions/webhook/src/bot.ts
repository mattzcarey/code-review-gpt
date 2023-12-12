import { Context, Probot } from "probot";

import { loadPR, loadQA } from "./controllers/chat/load";
import { qa } from "./pr/qa";
import { review } from "./pr/review";

export const app = (app: Probot): void => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.synchronize",
      "pull_request.reopened",
    ],
    async (
      context: Context<
        | "pull_request.opened"
        | "pull_request.synchronize"
        | "pull_request.reopened"
      >
    ): Promise<void> => {
      const chat = await loadPR(context);

      await review(context, chat);

      console.info(
        `Successfully reviewed PR #${context.pullRequest().pull_number}`
      );
    }
  );

  //chat with bot about PR
  app.on(
    ["pull_request_review_thread"],
    async (context: Context<"pull_request_review_thread">): Promise<void> => {
      const chat = await loadQA(context);

      await qa(context, chat);

      console.info(
        `Successfully answered question in PR #${context.payload.pull_request.number}`
      );
    }
  );
};
