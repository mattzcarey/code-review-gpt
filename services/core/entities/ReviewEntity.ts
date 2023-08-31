import { Entity } from "dynamodb-toolbox";

import { Table } from "./Table";

export const ReviewEntity = new Entity({
  name: "demoReviewS3LocationEntity",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "DEMOREVIEWID#" },
    SK: { sortKey: true, hidden: true, default: "S3_LOCATION" },
    reviewId: ["PK", 0, { type: "string", required: true }],
    inputLocation: { type: "string", required: true },
    responseLocation: { type: "string", required: true },
    demo: { type: "boolean", default: false },
    date: { type: "string", default: () => new Date().toDateString() },
  },
  table: Table,
} as const);
