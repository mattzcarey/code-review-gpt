import { Context } from "probot";

import { GitHubRESTClient } from "../../../../../code-review-gpt/src/common/remote/github/GitHubRESTClient";
import { review } from "../../../../../code-review-gpt/src/review";

export type ReviewFile = {
  fileName: string;
  fileContent: string;
  changedLines: string;
};

export class Chat {
  client: GitHubRESTClient;
  apiKey: string;
  params: {
    owner: string;
    repo: string;
    pull_number: number;
  };
  constructor(openaiApiKey: string, context: Context) {
    this.apiKey = openaiApiKey;
    this.params = context.pullRequest();
    this.client = new GitHubRESTClient();
  }

  private getRawFiles = async (): Promise<ReviewFile[]> => {
    return await this.client.fetchReviewFiles({
      owner: this.params.owner,
      repo: this.params.repo,
      prNumber: this.params.pull_number,
    });
  };

  public getReview = async (): Promise<string> => {
    const files = await this.getRawFiles();

    //Create args object for review
    const args = {
      model: "gpt-4-1106-preview", // TODO: allow user to set this
      reviewType: "changed",
      setupTarget: "github",
      ci: undefined,
      org: undefined,
      commentPerFile: false,
      remote: undefined,
      provider: "openai",
      _: [],
      $0: "",
    };

    try {
      const reviewComment = await review(args, files, this.apiKey);

      if (reviewComment === undefined) {
        throw new Error("Error fetching review");
      }

      return reviewComment;
    } catch (error) {
      throw new Error(`Error fetching review: ${JSON.stringify(error)}`);
    }
  };
}
