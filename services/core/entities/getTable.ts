import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "dynamodb-toolbox";

export const getTable = (tableName: string): Table<string, "PK", "SK"> => {
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

  return myTable;
};
