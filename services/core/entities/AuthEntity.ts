import { Entity } from "dynamodb-toolbox";

import { AuthTable } from './AuthTable';
import { buildResourceName } from '../helpers';

export const AuthEntity = new Entity({
  name: buildResourceName("web-app-auth"),
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "USERID#" },
    SK: { sortKey: true, hidden: true, default: "ROOT" },
    userId: ["PK", 0, { type: "string" }],
    email: { type: "string" },
    name: { type: "string" },
    image: { type: "string" },
    GSI1PK: { type: "string" },
    GSI1SK: { type: "string" },
  },
  table: AuthTable,
});