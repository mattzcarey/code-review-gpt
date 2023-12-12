import { Context } from "probot";
import { Chat } from "../../controllers/chat/chat";

export const qa = async (
  context: Context<"pull_request_review_thread">,
  chat: Chat
): Promise<void> => {
  const thread = context.payload.thread;

  //TODO: parse the thread as a history object
  console.log({ thread });

  //get the question
  const question = thread.comments[-1].body;

  //use that to get some do a rag on the question
  const answer = await chat.getAnswer(question);

  if (!answer) {
    return;
  }

  //comment on the thread with the answer
  await context.octokit.pulls.createReplyForReviewComment({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number,
    comment_id: thread.comments[0].id,
    body: answer,
  });
};
