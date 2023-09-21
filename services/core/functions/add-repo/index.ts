import { EventBridgeEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

import { instructionPrompt } from '../../../../code-review-gpt/src/review/prompt/prompts';
import { AuthEntity, RepoEntity, UserEntity } from "../../entities";
import {
  formatResponse,
  FormattedHandlerResponse,
} from "../utils/format-response";

type AddRepoEvent = EventBridgeEvent<"WebhookRequestEvent", string>;

type AddRepoEventBody = {
  detail: {
    repositories : [[{
      name: string,
      full_name: string,
    }]],
    sender: {
      login: string,
      id: string,
    }
  }
};

type User = {
  userId : string,
  repos: string[],
}

type Repo = {
  name: string,
  full_name: string,
}

export const main = async(
  event: AddRepoEvent
): Promise<FormattedHandlerResponse> => {
  const eventBody = event as unknown as AddRepoEventBody;

  try {
    const repositories = eventBody.detail.repositories as unknown as [Repo];
    const sender = eventBody.detail.sender;

    const response = await AuthEntity.query("ACCOUNT#github", {
      index: "GSI1",
      eq: `ACCOUNT#${sender.id}`,
      attributes: [ "userId" ],
    });

    if (!response.Items || response.Items.length === 0) {
      return formatResponse("Error, no user found with corresponding github id.", 204);
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
      newRepos = repositories.filter((repo) =>
        !user.repos.includes(repo.name)
      ).map((repo) => repo.name);
    }
    else {
      newRepos = repositories.map((repo) => repo.name);
    }

    let allRepos: string[];
    if (hasRepos) {
      allRepos = user.repos.concat(
        newRepos
      );
    }
    else {
      allRepos = newRepos;
    }

    await UserEntity.update(
      {
        userId: githubUser.userId,
        repos: allRepos,
      },
      { conditions: { attr: "userId", exists: true } }
    );

    await Promise.all(newRepos.map(async (repo) => {
      const repoId = uuidv4();
      await RepoEntity.put({
        repoId: repoId,
        prompt: instructionPrompt,
        name: repo,
        ownerId: githubUser.userId,
      });
    }));
    
    return formatResponse("User repos updated successfully.", 200);
  } catch (err) {
    console.error(err);

    return formatResponse("Error when updating user.", 500);
  }
};
