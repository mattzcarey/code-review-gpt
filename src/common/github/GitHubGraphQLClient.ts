import { gql, GraphQLClient } from "graphql-request"
import { githubToken } from "../../config";
import { PullRequestIdentifier, PullRequestFile } from "./types";

interface PullRequest {
  headSha: string;
  files: PullRequestFile[];
}

interface PaginatedPullRequestFiles {
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  }
  headSha: string;
  files: PullRequestFile[];
}

export class GitHubGraphQLClient {
  readonly endpoint = "https://api.github.com/graphql"

  private client: GraphQLClient = new GraphQLClient(this.endpoint, {
    headers: {
      authorization: `Bearer ${githubToken()}`,
    }
  });

  async query(query: string, variables?: any): Promise<any> {
    try {
      return this.client.request(query, variables);
    } catch(error) {
      throw new Error(`Failed to query GitHub: ${error}`);
    }
  }

  async getPullRequest(identifier: PullRequestIdentifier): Promise<PullRequest> {
    const q = gql`
      query($owner: String!, $repo: String!, $prNumber: Int!, $nextPage: String) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $prNumber) {
            headRefOid
            files(first: 100, after: $nextPage) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                changeType
                path
              }
            }
          }
        }
      }
`

    let hasNextPage = true;
    let nextPage = "";
    let headSha = "";
    let files: PullRequestFile[] = [];

    while (hasNextPage) {
      const result = await this.getPaginatedPullRequestFiles(q, identifier, nextPage);

      headSha = result.headSha;
      files.push(...result.files);

      nextPage = result.pageInfo.endCursor;
      hasNextPage = result.pageInfo.hasNextPage;
    }

    return { headSha, files };
  }

  private async getPaginatedPullRequestFiles(query: string, identifier: PullRequestIdentifier, nextPage?: string): Promise<PaginatedPullRequestFiles> {
    const data = await this.query(query, { owner: identifier.owner, repo: identifier.repo, prNumber: identifier.prNumber, nextPage: nextPage });

    const pullRequest = data.repository.pullRequest;
    const pageInfo = pullRequest.files.pageInfo;
    const headSha = pullRequest.headRefOid;
    const files = pullRequest.files.nodes as PullRequestFile[];

    return {pageInfo: pageInfo, headSha: headSha, files: files};
  }
}
