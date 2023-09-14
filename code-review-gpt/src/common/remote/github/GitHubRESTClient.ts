import { Octokit } from "octokit";

import { isEligibleForReview } from "./isEligibleForReview";
import { PullRequestIdentifier } from "./types";
import { githubToken } from "../../../config";
import { ReviewFile } from "../../types";

type GithubFile = {
  sha: string;
  filename: string;
  status:
    | "added"
    | "removed"
    | "modified"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string | undefined;
  previous_filename?: string | undefined;
};

type ValidClientResponse = {
  data: { content: string };
};

const isValidOctokitResponse = (input: unknown): input is ValidClientResponse =>
  typeof input === "object" &&
  input !== null &&
  "data" in input &&
  typeof input.data === "object" &&
  input.data !== null &&
  "content" in input.data &&
  typeof input.data.content === "string";

export class GitHubRESTClient {
  private client: Octokit = new Octokit({ auth: githubToken() });

  async fetchReviewFiles(
    identifier: PullRequestIdentifier
  ): Promise<ReviewFile[]> {
    const rawFiles = await this.client.paginate(
      this.client.rest.pulls.listFiles,
      {
        owner: identifier.owner,
        repo: identifier.repo,
        pull_number: identifier.prNumber,
      }
    );

    return await this.fetchPullRequestFiles(rawFiles);
  }

  async fetchPullRequestFiles(rawFiles: GithubFile[]): Promise<ReviewFile[]> {
    const reviewFiles: ReviewFile[] = [];

    for (const rawFile of rawFiles) {
      if (!isEligibleForReview(rawFile.filename, rawFile.status)) {
        continue;
      }

      const reviewFile = await this.fetchPullRequestFile(rawFile);
      reviewFiles.push(reviewFile);
    }

    return reviewFiles;
  }

  async fetchPullRequestFile(rawFile: GithubFile): Promise<ReviewFile> {
    const content = await this.fetchPullRequestFileContent(
      rawFile.contents_url
    );

    return {
      fileName: rawFile.filename,
      fileContent: content,
      changedLines: rawFile.patch ?? "",
    };
  }

  async fetchPullRequestFileContent(url: string): Promise<string> {
    const response: unknown = await this.client.request(`GET ${url}`);

    if (isValidOctokitResponse(response)) {
      return this.decodeBase64(response.data.content);
    } else {
      throw new Error(
        `Unexpected response from Octokit. Response was ${JSON.stringify(response)}.`
      );
    }
  }

  decodeBase64(encoded: string): string {
    return Buffer.from(encoded, "base64").toString("utf-8");
  }
}
