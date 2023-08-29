import { Octokit } from "octokit"
import { githubToken } from "../../config";
import { isEligibleForReview } from "./isEligibleForReview";
import { PullRequestIdentifier } from "./types";
import { ReviewFile } from "../types";

export class GitHubRESTClient {
  private client: Octokit = new Octokit({ auth: githubToken() });

  async fetchReviewFiles(identifier: PullRequestIdentifier): Promise<ReviewFile[]> {
    const rawFiles = await this.client.paginate(this.client.rest.pulls.listFiles, { owner: identifier.owner, repo: identifier.repo, pull_number: identifier.prNumber });

    return await this.fetchPullRequestFiles(rawFiles);
  }

  async fetchPullRequestFiles(rawFiles: any[]): Promise<ReviewFile[]> {
    let reviewFiles: ReviewFile[] = [];

    for (const rawFile of rawFiles) {
      if (!isEligibleForReview(rawFile.filename, rawFile.status)) {
        continue;
      }

      const reviewFile = await this.fetchPullRequestFile(rawFile);
      reviewFiles.push(reviewFile);
    }

    return reviewFiles;
  }

  async fetchPullRequestFile(rawFile: any): Promise<ReviewFile> {
    const content = await this.fetchPullRequestFileContent(rawFile.raw_url);

    return {
      fileName: rawFile.filename,
      fileContent: content,
      changedLines: rawFile.patch as string,
    }
  }

  async fetchPullRequestFileContent(url: string): Promise<string> {
    const response = await this.client.request(`GET ${url}`);
    return response.data;
  }
}
