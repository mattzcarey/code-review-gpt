import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";

const dynamoClient = DynamoDBDocument.from(new DynamoDB({}), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: Config.GITHUB_ID || (process.env.GITHUB_ID as string),
      clientSecret:
        Config.GITHUB_SECRET || (process.env.GITHUB_SECRET as string),
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: DynamoDBAdapter(dynamoClient, {
    tableName: Table["user-data"].tableName,
  }),
};
