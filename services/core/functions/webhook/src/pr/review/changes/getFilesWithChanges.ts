import { Context } from "probot";

import { ChangedFile, Commit } from "../../../types";
import { filterFiles } from "./filterFiles";

// This function retrieves files with changes for a given pull request
export const getFilesWithChanges = async (
  context: Context<
    "pull_request.opened" | "pull_request.synchronize" | "pull_request.reopened"
  >
): Promise<{ files: ChangedFile[]; commits: Commit[] }> => {
  const { owner, repo } = context.repo();
  const pullRequest = context.payload.pull_request;

  // Fetch comparison data for the entire pull request
  const comparisonData = await fetchComparisonData(
    context,
    owner,
    repo,
    pullRequest.base.sha,
    pullRequest.head.sha
  );

  if (!comparisonData.files) {
    throw new Error("No files to review");
  }

  let changedFilesInLastCommit: string[] = [];

  // if the action is synchronize we only want to review new changes
  if (
    isSynchronizeAction(context) &&
    hasMultipleCommits(comparisonData.commits)
  ) {
    const secondLastCommitSha =
      comparisonData.commits[comparisonData.commits.length - 2].sha;
    const lastCommitSha =
      comparisonData.commits[comparisonData.commits.length - 1].sha;

    // Fetch comparison data for the last commit
    const lastCommitData = await fetchComparisonData(
      context,
      owner,
      repo,
      secondLastCommitSha,
      lastCommitSha
    );
    changedFilesInLastCommit =
      lastCommitData.files?.map((file) => file.filename) || [];
  }

  const filteredFiles = filterFiles(
    changedFilesInLastCommit,
    comparisonData.files
  );

  if (!filteredFiles.length) {
    throw new Error("No files to review: all files are filtered out.");
  }

  return { files: filteredFiles, commits: comparisonData.commits };
};

const fetchComparisonData = async (
  context: Context<
    "pull_request.opened" | "pull_request.synchronize" | "pull_request.reopened"
  >,
  owner: string,
  repo: string,
  base: string,
  head: string
): Promise<{ files: ChangedFile[] | undefined; commits: Commit[] }> => {
  const { data } = await context.octokit.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });

  return { files: data.files, commits: data.commits };
};

const isSynchronizeAction = (
  context: Context<
    "pull_request.opened" | "pull_request.synchronize" | "pull_request.reopened"
  >
): boolean => context.payload.action === "synchronize";

const hasMultipleCommits = (commits: Commit[]): boolean => commits.length > 1;
