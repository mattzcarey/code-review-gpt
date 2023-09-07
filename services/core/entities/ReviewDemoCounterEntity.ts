import { Entity } from "dynamodb-toolbox";

import { Table } from "./Table";

export const ReviewDemoCounterEntity = new Entity({
  name: "demoReviewDayCounterEntity",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "DATE#" },
    SK: { sortKey: true, hidden: true, default: "DEMO" },
    date: [
      "PK",
      0,
      {
        type: "string",
        default: () => new Date().toISOString().split("T")[0],
      },
    ],
    dailyCount: { type: "number" },
  },
  table: Table,
} as const);
