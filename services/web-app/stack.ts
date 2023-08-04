import { Api, ReactStaticSite, StackContext, Table } from "sst/constructs";

export function WebAppStack({ stack }: StackContext) {
  // Create the table
  const table = new Table(stack, "Counter", {
    fields: {
      counter: "string",
    },
    primaryIndex: { partitionKey: "counter" },
  });
}