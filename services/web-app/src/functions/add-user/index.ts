import { DynamoDBStreamEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const main = async (event: DynamoDBStreamEvent) => {
  if (event.Records == null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a any dynamodb records as expected.",
    });
  }

  try {
    for (const record of event.Records) {
      const userId = record.dynamodb?.NewImage.id['S'];
      const name = record.dynamodb?.NewImage.name['S'];
      const email = record.dynamodb?.NewImage.email['S'];
      const pictureUrl = record.dynamodb?.NewImage.image['S'];

      if (userId === undefined || name === undefined || email === undefined || pictureUrl === undefined) {
        return Promise.resolve({
          statusCode: 400,
          body: "The request record does not contain the expected data.",
        });
      }

      const command = new PutCommand({
        TableName: "liza-dev-crgpt-data",
        Item: {
          PK: `EMAIL#${email}`,
          SK: "ROOT",
          userId: userId,
          name: name,
          email: email,
          pictureUrl: pictureUrl,
        },
      });
      await docClient.send(command);

      return Promise.resolve({
        statusCode: 200,
        body: "User added successfully.",
      });
    }

    return Promise.resolve({
      statusCode: 400,
      body: "Dynamodb record did not contain any new users",
    });
  } catch (err) {
    console.error(err);
  
    return Promise.resolve({
      statusCode: 500,
      body: "Error when updating user.",
    });
  }
};
