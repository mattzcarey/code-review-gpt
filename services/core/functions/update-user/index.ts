import { APIGatewayProxyEvent } from "aws-lambda";

import { UserEntity } from "../../entities";
import { encryptKey } from "./encryptKey";
import { formatResponse } from "../../helpers/format-response";

interface UpdateUserLambdaInput {
  apiKey: string;
  email: string;
}

export const main = async (event: APIGatewayProxyEvent) => {
  if (event.body == null) {
    return formatResponse(
      "The request does not contain a body as expected.",
      400
    );
  }

  try {
    const inputBody = JSON.parse(event.body) as UpdateUserLambdaInput;
    const apiKey = inputBody.apiKey;
    const email = inputBody.email;

    if (apiKey === undefined || email === undefined) {
      return formatResponse(
        "The request body does not contain the expected data.",
        400
      );
    }

    const encryptedApiKey = await encryptKey(apiKey);

    await UserEntity.update(
      {
        email: email,
        apiKey: encryptedApiKey,
      },
      { conditions: { attr: "email", exists: true } }
    );

    return formatResponse("User updated successfully.");
  } catch (err) {
    console.error(err);
    return formatResponse("Error when updating user.", 500);
  }
};
