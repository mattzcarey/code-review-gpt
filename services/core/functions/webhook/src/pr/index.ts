import { Context } from "probot";

import { Chat } from "../chat/chat";
import { getFilesWithChanges } from "./review/changes/getFilesWithChanges";
import { collectAllReviews } from "./review/collectAllReviews";
import { filterReviews } from "./review/filterReviews";
import { postReviews } from "./review/postReviews";

export const review = async (
  context: Context<"pull_request">,
  chat: Chat
): Promise<void> => {
  const { files, commits } = await getFilesWithChanges(context);
  const allReviews = await collectAllReviews(files, chat);

  const topReviews = filterReviews(allReviews);

  await postReviews(context, topReviews, commits);
};
