import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

import { instructionPrompt } from '../../../../code-review-gpt/src/review/prompt/prompts';
import { RepoEntity, UserEntity } from "../../entities";
import {
  formatResponse,
  FormattedHandlerResponse,
} from "../utils/format-response";

type AddRepoLambdaInput = {
  reposAdded: [string];
  userId: string;
};

const isValidEventBody = (input: unknown): input is AddRepoLambdaInput =>
  typeof input === "object" &&
  input !== null &&
  "reposAdded" in input &&
  typeof input.reposAdded === "string" &&
  "userId" in input &&
  typeof input.userId === "string";

export const main = async (
  event: APIGatewayProxyEvent
): Promise<FormattedHandlerResponse> => {
  if (event.body === null) {
    return formatResponse(
      "The request does not contain a body as expected.",
      400
    );
  }

  try {
    const inputBody: unknown = JSON.parse(event.body);

    if (!isValidEventBody(inputBody)) {
      return formatResponse(
        "The request body does not contain the expected data.",
        400
      );
    }

    await UserEntity.update(
      {
        userId: inputBody.userId,
        repos: inputBody.reposAdded,
      },
      { conditions: { attr: "userId", exists: true } }
    );

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    inputBody.reposAdded.forEach( async (repo): Promise<void> => {
      const repoId = uuidv4();
      await RepoEntity.put(
        {
          repoId: repoId,
          prompt: instructionPrompt,
          name: repo,
          ownerId: inputBody.userId,
        }
      );
    });

    return formatResponse("User updated successfully.");
  } catch (err) {
    console.error(err);

    return formatResponse("Error when updating user.", 500);
  }
};
