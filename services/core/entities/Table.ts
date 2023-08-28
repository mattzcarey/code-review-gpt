import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table as DDBToolboxTable } from "dynamodb-toolbox";
import { TABLE_NAME } from "../constants";
import { buildResourceName } from "../helpers";

const marshallOptions = {
  convertEmptyValues: false,
};

const translateConfig = { marshallOptions };

const DocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(translateConfig)
);

export const Table = new DDBToolboxTable({
  name: buildResourceName(TABLE_NAME),
  partitionKey: "PK",
  sortKey: "SK",
  DocumentClient: DocumentClient,
});
