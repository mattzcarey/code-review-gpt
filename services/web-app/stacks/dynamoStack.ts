import { StackContext, Table } from "sst/constructs";

export const DynamoStack = ({ stack }: StackContext) => {
  const table = new Table(stack, "user-data", {
    fields: {
      pk: "string",
      sk: "string",
      GSI1PK: "string",
      GSI1SK: "string",
    },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: {
      GSI1: { partitionKey: "GSI1PK", sortKey: "GSI1SK" },
    },
  });

  return {
    table,
  };
};