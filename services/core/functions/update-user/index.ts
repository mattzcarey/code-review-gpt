import { APIGatewayProxyEvent } from "aws-lambda";

import { encryptKey } from "./encryptKey";
import { UserEntity } from "../../entities";
import {
  formatResponse,
  FormattedHandlerResponse,
} from "../../helpers/format-response";

interface UpdateUserLambdaInput {
  apiKey: string;
  userId: string;
}

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
    const inputBody = JSON.parse(event.body) as UpdateUserLambdaInput;
    const apiKey = inputBody.apiKey;
    const userId = inputBody.userId;

    if (apiKey === undefined || userId === undefined) {
      return formatResponse(
        "The request body does not contain the expected data.",
        400
      );
    }

    const encryptedApiKey = await encryptKey(apiKey);

    await UserEntity.update(
      {
        userId: userId,
        apiKey: encryptedApiKey,
      },
      { conditions: { attr: "userId", exists: true } }
    );

    return formatResponse("User updated successfully.");
  } catch (err) {
    console.error(err);

    return formatResponse("Error when updating user.", 500);
  }
};
