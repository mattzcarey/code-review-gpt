import { Chat } from "../../controllers/chat/chat";
import { ReviewFile } from "../../types";

export const collectAllReviews = async (
  files: { patch?: string; filename: string }[],
  chat: Chat
): Promise<ReviewFile[]> => {
  let allReviews: ReviewFile[] = [];
  for (const file of files) {
    if (!file.patch) {
      continue;
    }

    try {
      const reviewArray = await chat.getReview(file.patch);

      console.debug(`Reviewing ${file.filename}`);

      if (reviewArray === undefined) {
        continue;
      }

      // Add the filename and patch to the review data
      reviewArray.forEach((review) => {
        review.filename = file.filename;
        review.patch = file.patch;
      });

      allReviews = allReviews.concat(reviewArray);
    } catch (error) {
      console.error(`Failed to review ${file.filename}`, error);
    }
  }

  return allReviews;
};
