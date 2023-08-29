import { Octokit } from "octokit"
import { githubToken } from "../../config";
import { isEligibleForReview } from "./isEligibleForReview";
import { PullRequestIdentifier } from "./types";
import { ReviewFile } from "../types";

export class GitHubRESTClient {
  private client: Octokit = new Octokit({ auth: githubToken() });

  async fetchPullRequestFiles(identifier: PullRequestIdentifier): Promise<ReviewFile[]> {
    const response = await this.client.paginate(this.client.rest.pulls.listFiles, { owner: identifier.owner, repo: identifier.repo, pull_number: identifier.prNumber });

    let pullRequestFiles: ReviewFile[] = [];

    for (const file of response) {
      if (!isEligibleForReview(file.filename, file.status)) {
        continue;
      }

      const content = await this.fetchPullRequestFile(file.raw_url);
      const pullRequestFile = {
        fileName: file.filename,
        fileContent: content,
        changedLines: file.patch as string,
      }

      pullRequestFiles.push(pullRequestFile);
    }

    return pullRequestFiles;
  }

  async fetchPullRequestFile(url: string): Promise<string> {
    const response = await this.client.request(`GET ${url}`);
    return response.data;
  }
}
