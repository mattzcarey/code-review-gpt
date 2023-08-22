import { DynamoDBStreamEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const postEmail = async(email: string) => {
  return await fetch(process.env.CLOUDFLARE_WORKER_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": await getVariableFromSSM(
        process.env.CLOUDFLARE_WORKER_TOKEN_NAME ?? ""
      ),
    },
    body: JSON.stringify({
      "to": email,
      "from": "test@oriontools.ai",
      "subject": "Welcome",
      "html": "<p>Thanks for signing up for Orion tools. We aim to make the best AI powered dev tools. We hope you enjoy using our code review product. Here is a <a href=\"https://github.com/mattzcarey/code-review-gpt\">link</a> to the repo, give it a star. Here is a <a href=\"https://join.slack.com/t/orion-tools/shared_invite/zt-20x79nfgm-UGIHK1uWGQ59JQTpODYDwg\">link</a> to our slack community.</p>"
    }),
  });
};

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

      const res = await postEmail(email);
      if (!res.ok) {
        console.error("Failed to send welcome email due to this status code: ", res.status);
      }

      const command = new PutCommand({
        TableName: `${process.env.SST_STAGE}-crgpt-data`,
        Item: {
          PK: `USERID#${userId}`,
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
function getVariableFromSSM(arg0: string): string | PromiseLike<string> {
  throw new Error('Function not implemented.');
}

