import { StackContext, Table } from "sst/constructs";

export const DynamoStack = ({ stack }: StackContext) => {
  const table = new Table(stack, "user-data", {
    fields: {
      id: "number",
      name: "string",
      email: "string",
    },
    primaryIndex: { partitionKey: "id", sortKey: "email" },
    globalIndexes: {
      GSI1: {partitionKey: "email", sortKey: "name"},
    },
  });

  return {
    table,
  };
};