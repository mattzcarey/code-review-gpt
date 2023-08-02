import { IFeedback } from "./IFeedback";

export type CreateFileCommentData = {
    feedback: IFeedback;
    signOff: string;
    owner: string;
    repo: string;
    pull_number: number;
    commit_id: string;
  };
  