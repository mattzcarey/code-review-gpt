import { Entity } from "dynamodb-toolbox";
import { getTable } from "./getTable";

export const getDemoReviewS3LocationEntity = (tableName: string): Entity => {
  const myTable = getTable(tableName);

  const demoReviewS3LocationEntity = new Entity({
    name: "demoReviewS3LocationEntity",
    attributes: {
      PK: { partitionKey: true, hidden: true, prefix: "DEMOREVIEWID#" },
      SK: { sortKey: true, hidden: true, default: "S3_LOCATION" },
      reviewId: ["PK", 0, { type: "string", required: true }],
      inputLocation: { type: "string", required: true },
      responseLocation: { type: "string", required: true },
      date: { type: "string", default: () => new Date().toDateString() },
    },
    table: myTable,
  } as const);

  return demoReviewS3LocationEntity;
};
