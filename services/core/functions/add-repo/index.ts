import { EventBridgeEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

import { instructionPrompt } from "../../../../code-review-gpt/src/review/prompt/prompts";
import { AuthEntity, RepoEntity, UserEntity } from "../../entities";

type AddRepoEvent = EventBridgeEvent<
  "GithubInstallationEvent" | "GithubInstallationReposEvent",
  InstallationEventBody | InstallationReposEventBody
>;

type InstallationEventBody = {
  detail: {
    repositories: [
      [
        {
          name: string;
          full_name: string;
        }
      ]
    ];
    sender: {
      login: string;
      id: string;
    };
  };
};

type InstallationReposEventBody = {
  detail: {
    repositories_added: [
      [
        {
          name: string;
          full_name: string;
        }
      ]
    ];
    repositories_removed: [
      [
        {
          name: string;
          full_name: string;
        }
      ]
    ];
    sender: {
      login: string;
      id: string;
    };
  };
};

type User = {
  userId: string;
  repos: string[];
};

type Repo = {
  name: string;
  full_name: string;
};

// eslint-disable-next-line complexity
export const main = async (event: AddRepoEvent): Promise<void> => {
  try {
    let eventBody, repositories;
    if (event["detail-type"] === "GithubInstallationEvent") {
      eventBody = event as unknown as InstallationEventBody;
      repositories = eventBody.detail.repositories as unknown as [Repo];
    } else {
      eventBody = event as unknown as InstallationReposEventBody;
      repositories = eventBody.detail.repositories_added as unknown as [Repo];
    }
    const sender = eventBody.detail.sender;

    const response = await AuthEntity.query("ACCOUNT#github", {
      index: "GSI1",
      eq: `ACCOUNT#${sender.id}`,
      attributes: ["userId"],
    });

    if (!response.Items || response.Items.length === 0) {
      console.error("Error, no user found with corresponding github id.");

      return;
    }

    const githubUser = response.Items[0] as User;

    const userResponse = await UserEntity.get({
      userId: githubUser.userId,
    });

    let hasRepos = false;
    if (userResponse.Item && "repos" in userResponse.Item) {
      hasRepos = true;
    }

    const user = userResponse.Item as unknown as User;

    let newRepos: string[];
    if (hasRepos) {
      newRepos = repositories
        .filter((repo) => !user.repos.includes(repo.name))
        .map((repo) => repo.name);
    } else {
      newRepos = repositories.map((repo) => repo.name);
    }

    let allRepos: string[];
    if (hasRepos) {
      allRepos = user.repos.concat(newRepos);
    } else {
      allRepos = newRepos;
    }

    await UserEntity.update(
      {
        userId: githubUser.userId,
        repos: allRepos,
      },
      { conditions: { attr: "userId", exists: true } }
    );

    await Promise.all(
      newRepos.map(async (repo) => {
        const repoId = uuidv4();
        await RepoEntity.put({
          repoId: repoId,
          prompt: instructionPrompt,
          name: repo,
          ownerId: githubUser.userId,
        });
      })
    );

    console.log("User repos updated successfully.");
  } catch (err) {
    console.error("Error when updating user: ", err);
  }
};
