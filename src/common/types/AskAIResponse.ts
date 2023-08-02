import { IFeedback } from "./IFeedback";

export type AskAIResponse = {
    markdownReport: string;
    feedbacks: IFeedback[];
  };
