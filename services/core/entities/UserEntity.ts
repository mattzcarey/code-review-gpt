import { Entity } from "dynamodb-toolbox";

import { Table } from "./Table";

export const UserEntity = new Entity({
  name: "userEntity",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "USERID#" },
    SK: { sortKey: true, hidden: true, default: "ROOT" },
    userId: ["PK", 0, { type: "string", required: true }],
    email: { type: "string" },
    apiKey: { type: "binary" },
    name: { type: "string" },
    pictureUrl: { type: "string" },
    repos: { type: "list" },
  },
  table: Table,
} as const);