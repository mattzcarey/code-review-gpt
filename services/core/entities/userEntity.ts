import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, Table } from "dynamodb-toolbox";

export const getUserEntity = (tableName: string): Entity => {
  const marshallOptions = {
    convertEmptyValues: false,
  };

  const translateConfig = { marshallOptions };

  const DocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient(translateConfig)
  );

  const myTable = new Table({
    name: tableName,
    partitionKey: "PK",
    sortKey: "SK",
    DocumentClient: DocumentClient,
  });

  const userEntity = new Entity({
    name: "userEntity",
    attributes: {
      PK: { partitionKey: true, hidden: true, prefix: "USERID#" },
      SK: { sortKey: true, hidden: true, default: "ROOT" },
      userId: ["PK", 0, { type: "string", required: true }],
      apiKey: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      pictureUrl: { type: "string" },
    },
    table: myTable,
  } as const);

  return userEntity;
};
