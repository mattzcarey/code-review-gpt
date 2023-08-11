import { Entity } from "dynamodb-toolbox";
import { getTable } from "./getTable";

export const getDemoReviewDayCounterEntity = (tableName: string): Entity => {
  const myTable = getTable(tableName);

  const demoReviewDayCounterEntity = new Entity({
    name: "demoReviewDayCounterEntity",
    attributes: {
      PK: { partitionKey: true, hidden: true, prefix: "DATE#" },
      SK: { sortKey: true, hidden: true, default: "DEMO_COUNTER" },
      date: [
        "PK",
        0,
        {
          type: "string",
          default: () => new Date().toDateString(),
        },
      ],
      count: { type: "number" },
    },
    table: myTable,
  } as const);

  return demoReviewDayCounterEntity;
};
