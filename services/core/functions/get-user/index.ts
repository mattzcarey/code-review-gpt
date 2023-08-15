import { APIGatewayProxyEvent } from "aws-lambda";

import { UserEntity } from "../../entities";

export const main = async (event: APIGatewayProxyEvent) => {
  try {
    const userId = event.queryStringParameters?.userId;

    if (userId === undefined) {
      return Promise.resolve({
        statusCode: 400,
        body: "Please provide the userId of the user you wish to get.",
      });
    }

    const response = await UserEntity.get({
      userId: userId,
    });

    const user = response.Item;
    delete user?.["apiKey"];

    if (user === undefined) {
      return Promise.resolve({
        statusCode: 404,
        body: "User not found.",
      });
    }

    return Promise.resolve({
      statusCode: 200,
      body: JSON.stringify(user),
    });
  } catch (err) {
    console.error(err);

    return Promise.resolve({
      statusCode: 500,
      body: "Error when getting user.",
    });
  }
};
