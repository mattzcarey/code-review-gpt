import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBStreamEvent } from "aws-lambda";
import fetch from "node-fetch";
import { getVariableFromSSM } from "./getVariableFromSSM";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const postEmail = async (email: string, name: string) => {
  const url = await getVariableFromSSM(
    process.env.CLOUDFLARE_WORKER_URL_NAME ?? ""
  );
  return await fetch(url.concat("api/email"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: await getVariableFromSSM(
        process.env.CLOUDFLARE_WORKER_TOKEN_NAME ?? ""
      ),
    },
    body: JSON.stringify({
      to: { email: email, name: name },
      from: { email: "noreply@oriontools.ai", name: "Matt from Orion Tools" },
      subject: "Welcome to Code Review GPT",
      html: '<p>Thanks for signing up for Orion tools. We aim to make the best AI powered dev tools. We hope you enjoy using our code review product. <br/>Here is a <a href="https://github.com/mattzcarey/code-review-gpt">link</a> to the repo, give it a star. Here is a <a href="https://join.slack.com/t/orion-tools/shared_invite/zt-20x79nfgm-UGIHK1uWGQ59JQTpODYDwg">link</a> to our slack community.</p>',
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
    if (event.Records[0].dynamodb?.NewImage) {
      const record = event.Records[0].dynamodb?.NewImage;
      const userId = record.id["S"];
      const name = record.name["S"];
      const email = record.email["S"];
      const pictureUrl = record.image["S"];

      if (
        userId === undefined ||
        name === undefined ||
        email === undefined ||
        pictureUrl === undefined
      ) {
        return Promise.resolve({
          statusCode: 400,
          body: "The request record does not contain the expected data.",
        });
      }

      const res = await postEmail(email, name);
      if (!res.ok) {
        console.error(
          "Failed to send welcome email due to this status code: ",
          res.status
        );
      }

      const command = new PutCommand({
        TableName: `${process.env.SST_STAGE}-crgpt-data`,
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
        body: "Successfully added new user to the user db",
      });
    } else {
      return Promise.resolve({
        statusCode: 400,
        body: "Dynamodb record did not contain any new users",
      });
    }
  } catch (err) {
    console.error(err);

    return Promise.resolve({
      statusCode: 500,
      body: "Error when updating user.",
    });
  }
};
