import { DynamoDBStreamEvent } from "aws-lambda";
import { getUserEntity } from '../../entities/userEntity';

interface CreateUserLambdaInput {
  userId: string;
  email: string;
  name: string;
  pictureUrl: string;
}

const TABLE_NAME = process.env["TABLE_NAME"];

if (TABLE_NAME === undefined) {
  throw new Error(`Environment variable not found: "TABLE_NAME"`);
}

export const main = async (event: DynamoDBStreamEvent) => {
  if (event.Records == null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a body as expected.",
    });
  }

  try {
    const inputBody = JSON.parse(event.Records[0].dynamodb?.Keys) as CreateUserLambdaInput;
    const userId = inputBody.userId;
    const name = inputBody.name;
    const email = inputBody.email;
    const pictureUrl = inputBody.pictureUrl;

    if (userId === undefined || name === undefined || email === undefined || pictureUrl === undefined) {
      return Promise.resolve({
        statusCode: 400,
        body: "The request body does not contain the expected data.",
      });
    }

    const userEntity = getUserEntity(TABLE_NAME);

    await userEntity.put(
      {
        userId: userId,
        name: name,
        email: email,
        pictureUrl: pictureUrl,
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
