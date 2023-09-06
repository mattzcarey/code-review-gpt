import { extractPullRequestIdentifier } from "./extractPullRequestIdentifier";
import { PullRequestIdentifier } from './types';

describe("extract Pull Request Identifier", () => {
  it("Extracts from valid identifiers", () => {
    const repo = new PullRequestIdentifier("mattzcarey", "code-review-gpt", 96);
    expect(extractPullRequestIdentifier("mattzcarey/code-review-gpt#96")).toEqual(repo);
  });
});
