import { Context, Probot } from "probot";

import { loadChat } from "./chat/loadChat";
import { getFilesWithChanges } from "./review/changes/getFilesWithChanges";
import { collectAllReviews } from "./review/comment/collectAllReviews";
import { filterReviews } from "./review/comment/filterReviews";
import { postReviews } from "./review/comment/postReviews";

export const app = (app: Probot): void => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.synchronize",
      "pull_request.reopened",
    ],
    async (context: Context<"pull_request">): Promise<void> => {
      const chat = await loadChat(context);

      const { files, commits } = await getFilesWithChanges(context);
      const allReviews = await collectAllReviews(files, chat);

      const topReviews = filterReviews(allReviews);
      console.log({ topReviews });

      await postReviews(context, topReviews, commits);

      console.info(
        `Successfully reviewed PR #${context.pullRequest().pull_number}`
      );
    }
  );
};
