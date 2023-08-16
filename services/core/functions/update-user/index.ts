import { APIGatewayProxyEvent } from "aws-lambda";

import { UserEntity } from "../../entities";
import { encryptKey } from "./encryptKey";

interface UpdateUserLambdaInput {
  apiKey: string;
  userId: string;
}

export const main = async (event: APIGatewayProxyEvent) => {
  if (event.body == null) {
    return {
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    };
  }

  try {
    const inputBody = JSON.parse(event.body) as UpdateUserLambdaInput;
    const apiKey = inputBody.apiKey;
    const userId = inputBody.userId;

    if (apiKey === undefined || userId === undefined) {
      return {
        statusCode: 400,
        body: "The request body does not contain the expected data.",
      };
    }

    const encryptedApiKey = await encryptKey(apiKey);

    await UserEntity.update(
      {
        userId: userId,
        apiKey: encryptedApiKey,
      },
      { conditions: { attr: "userId", exists: true } }
    );

    return {
      statusCode: 200,
      body: "User updated successfully.",
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: "Error when updating user.",
    };
  }
};
