import { Entity } from "dynamodb-toolbox";

import { Table } from "./Table";

export const RepoEntity = new Entity({
  name: "repoEntity",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "REPOID#" },
    SK: { sortKey: true, hidden: true, default: "ROOT" },
    repoId: ["PK", 0, { type: "string", required: true }],
    prompt: { type: "string", required: true },
    name: { type: "string", required : true},
    ownerId: { type: "string" },
  },
  table: Table,
} as const);