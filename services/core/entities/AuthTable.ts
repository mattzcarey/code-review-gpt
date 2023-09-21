import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table as DDBToolboxTable } from "dynamodb-toolbox";

import { AUTH_TABLE_NAME } from "../constants";
import { buildResourceName } from "../helpers";

const marshallOptions = {
  convertEmptyValues: false,
};

const translateConfig = { marshallOptions };

const DocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(translateConfig)
);

export const AuthTable = new DDBToolboxTable({
  name: buildResourceName(AUTH_TABLE_NAME),
  partitionKey: "pk",
  sortKey: "sk",
  DocumentClient: DocumentClient,
  indexes: {
    GSI1: {
      partitionKey: "GSI1PK",
      sortKey: "GSI1SK",
    }
  }
});
