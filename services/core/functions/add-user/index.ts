import { DynamoDBStreamEvent } from "aws-lambda";
import { UserEntity } from '../../entities';

const TABLE_NAME = process.env["TABLE_NAME"];

if (TABLE_NAME === undefined) {
  throw new Error(`Environment variable not found: "TABLE_NAME"`);
}

export const main = async (event: DynamoDBStreamEvent) => {
  if (event.Records == null) {
    return Promise.resolve({
      statusCode: 400,
      body: "The request does not contain a any dynamodb records as expected.",
    });
  }

  try {
    const records = event.Records.filter(record => record.dynamodb?.Keys && record.dynamodb?.Keys['type'].S === 'user');
    for (const record of records) {
      if (record.dynamodb?.Keys) {
        const userId = record.dynamodb?.Keys['id'].S;
        const name = record.dynamodb?.Keys['name'].S;
        const email = record.dynamodb?.Keys['email'].S;
        const pictureUrl = record.dynamodb?.Keys['image'].S;

        if (userId === undefined || name === undefined || email === undefined || pictureUrl === undefined) {
          return Promise.resolve({
            statusCode: 400,
            body: "The request record does not contain the expected data.",
          });
        }

        await UserEntity.put(
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
          body: "User added successfully.",
        });
      } else {
        return Promise.resolve({
          statusCode: 400,
          body: "Dynamodb record in the event did not contain any keys"
        });
      }
    }
    return Promise.resolve({
      statusCode: 400,
      body: "Dynamodb record in the event did not contain any keys"
    });
  } catch (err) {
    console.error(err);
  
    return Promise.resolve({
      statusCode: 500,
      body: "Error when updating user.",
    });
  }
};
