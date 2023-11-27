import { Context, Probot } from "probot";

import { loadChat } from "./chat/loadChat";
import { review } from "./pr";

export const app = (app: Probot): void => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.synchronize",
      "pull_request.reopened",
    ],
    async (context: Context<"pull_request">): Promise<void> => {
      const chat = await loadChat(context);

      await review(context, chat);

      console.info(
        `Successfully reviewed PR #${context.pullRequest().pull_number}`
      );
    }
  );
};
