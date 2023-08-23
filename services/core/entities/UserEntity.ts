import { Entity } from "dynamodb-toolbox";
import { Table } from "./Table";

export const UserEntity = new Entity({
  name: "userEntity",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "EMAIL#" },
    SK: { sortKey: true, hidden: true, default: "ROOT" },
    email: ["PK", 0, { type: "string", required: true }],
    userId: { type: "string" },
    apiKey: { type: "binary" },
    name: { type: "string" },
    pictureUrl: { type: "string" },
    repos: { type: "list" },
  },
  table: Table,
} as const);