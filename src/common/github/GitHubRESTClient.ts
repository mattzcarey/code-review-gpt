import { Octokit } from "octokit"
import { githubToken } from "../../config";
import { PullRequestIdentifier, PullRequestFile } from "./types";

interface CommitFile {
  path: string;
  content: string;
}

interface RawCommitFile {
  url: string;
  path: string;
}

export class GitHubRESTClient {
  readonly githubDiffMIMEType = "application/vnd.github.v3.diff";
  readonly githubPullRequestEndpoint = "/repos/{owner}/{repo}/pulls/{number}";
  readonly githubCommitEndpoint = "/repos/{owner}/{repo}/git/trees/{sha}?recursive=1";

  private client: Octokit = new Octokit({auth: githubToken()});

  async fetchPullRequestDiff(identifier: PullRequestIdentifier): Promise<string> {
    const response = await this.client.request(`GET ${this.githubPullRequestEndpoint}`, {
      headers: {
        accept: this.githubDiffMIMEType
      },
      owner: identifier.owner,
      repo: identifier.repo,
      number: identifier.prNumber,
    });

    return response.data;
  }

  async fetchCommitFiles(identifier: PullRequestIdentifier, headSha: string, prFiles: PullRequestFile[]): Promise<CommitFile[]> {
    const response = await this.client.request(`GET ${this.githubCommitEndpoint}`, {
      owner: identifier.owner,
      repo: identifier.repo,
      sha: headSha,
    });

    let filePaths = prFiles.map(file => file.path);
    let files: CommitFile[] = [];

    for (const file of response.data.tree) {
      if (filePaths.includes(file.path)) {
        const commitFile = await this.fetchCommitFile(file as RawCommitFile);
        files.push(commitFile);
      }
    }

    return files;
  }

  async fetchCommitFile(file: RawCommitFile): Promise<CommitFile> {
    const gitHubFile = await this.client.request(`GET ${file.url}`)
    const commitFile: CommitFile = {
      path: file.path,
      content: this.decodeFileContent(gitHubFile.data.content),
    };

    return commitFile
  }

  private decodeFileContent(content: string): string {
    return Buffer.from(content, "base64").toString("utf-8");
  }
}
