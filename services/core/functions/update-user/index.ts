import { APIGatewayProxyEvent } from "aws-lambda";

import { UserEntity } from "../../entities";
import {
  formatResponse,
  FormattedHandlerResponse,
} from "../utils/format-response";
import { encryptKey } from "./encryptKey";

type UpdateUserLambdaInput = {
  apiKey: string;
  userId: string;
};

const isValidEventBody = (input: unknown): input is UpdateUserLambdaInput =>
  typeof input === "object" &&
  input !== null &&
  "apiKey" in input &&
  typeof input.apiKey === "string" &&
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

    const encryptedApiKey = await encryptKey(inputBody.apiKey);

    await UserEntity.update(
      {
        userId: inputBody.userId,
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
