import { Entity } from "dynamodb-toolbox";
import { getTable } from "./getTable";

export const getUserEntity = (tableName: string): Entity => {
  const myTable = getTable(tableName);

  const userEntity = new Entity({
    name: "userEntity",
    attributes: {
      PK: { partitionKey: true, hidden: true, prefix: "USERID#" },
      SK: { sortKey: true, hidden: true, default: "ROOT" },
      userId: ["PK", 0, { type: "string", required: true }],
      apiKey: { type: "string" },
    },
    table: myTable,
  } as const);

  return userEntity;
};
