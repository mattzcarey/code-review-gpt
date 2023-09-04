import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { PullRequestIdentifier } from './types';

describe("extract Pull Request Identifier", () => {
  it("Extracts from valid identifiers", () => {
    const repo1 = new PullRequestIdentifier("mattzcarey", "code-review-gpt", 96);
    expect(extractPullRequestIdentifier("mattzcarey/code-review-gpt#96")).toEqual(repo1);

    const repo2 = new PullRequestIdentifier("toptal", "blackfish", 9148);
    expect(extractPullRequestIdentifier("toptal/blackfish#9148")).toEqual(repo2);
  });
});
