import { APIGatewayProxyEvent } from "aws-lambda";

import { getUserEntity } from "../../entities/userEntity";

interface UpdateUserLambdaInput {
  apiKey: string;
  userId: string;
}

const TABLE_NAME = process.env["TABLE_NAME"];

if (TABLE_NAME === undefined) {
  throw new Error(`Environment variable not found: "TABLE_NAME"`);
}

export const main = async (event: APIGatewayProxyEvent) => {
  if (event.body == null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    });
  }

  try {
    const inputBody = JSON.parse(event.body) as UpdateUserLambdaInput;
    const apiKey = inputBody.apiKey;
    const userId = inputBody.userId;

    if (apiKey === undefined || userId === undefined) {
      return Promise.resolve({
        statusCode: 400,
        body: "The request body does not contain the expected data.",
      });
    }

    const userEntity = getUserEntity(TABLE_NAME);

    await userEntity.update(
      {
        userId: userId,
        apiKey: apiKey,
      },
      { conditions: { attr: "userId", exists: true } }
    );

    return Promise.resolve({
      statusCode: 200,
      body: "User updated successfully.",
    });
  } catch (err) {
    console.error(err);

    return Promise.resolve({
      statusCode: 500,
      body: "Error when updating user.",
    });
  }
};
