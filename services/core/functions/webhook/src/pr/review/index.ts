import { Context } from "probot";

import { Chat } from "../../controllers/chat/chat";
import { getFilesWithChanges } from "./changes/getFilesWithChanges";
import { collectAllReviews } from "./collectAllReviews";
import { filterReviews } from "./filterReviews";
import { postReviews } from "./postReviews";

export const review = async (
  context: Context<
    "pull_request.opened" | "pull_request.synchronize" | "pull_request.reopened"
  >,
  chat: Chat
): Promise<void> => {
  const { files, commits } = await getFilesWithChanges(context);
  const allReviews = await collectAllReviews(files, chat);

  const topReviews = filterReviews(allReviews);

  await postReviews(context, topReviews, commits);
};
