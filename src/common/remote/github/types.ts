export class PullRequestIdentifier {
  constructor(
    public owner: string,
    public repo: string,
    public prNumber: number
  ) {}
}
