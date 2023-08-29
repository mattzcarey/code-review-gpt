import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";

import "sst/node/config";
declare module "sst/node/config" {
  export interface SecretResources {
    GITHUB_SECRET: {
      value: string;
    };
    GITHUB_ID: {
      value: string;
    };
    NEXTAUTH_SECRET: {
      value: string;
    };
  }
}

import "sst/node/table";
declare module "sst/node/table" {
  export interface TableResources {
    auth: {
      tableName: string;
    };
  }
}

const dynamoClient = DynamoDBDocument.from(new DynamoDB({}), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: Config.GITHUB_ID,
      clientSecret: Config.GITHUB_SECRET,
    }),
  ],
  // secret: Config.NEXTAUTH_SECRET,
  adapter: DynamoDBAdapter(dynamoClient, {
    tableName: Table.auth.tableName,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.token = token;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
