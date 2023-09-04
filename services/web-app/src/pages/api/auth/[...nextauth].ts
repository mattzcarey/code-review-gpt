import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";

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
  secret: Config.NEXTAUTH_SECRET,
  adapter: DynamoDBAdapter(dynamoClient, {
    tableName: Table.auth.tableName,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/require-await
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.token = token.token;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);

