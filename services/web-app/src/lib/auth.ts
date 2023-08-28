import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter"
import { CookiesOptions, NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { Table } from "sst/node/table";
import { Config } from "sst/node/config";

const dynamoClient = DynamoDBDocument.from(new DynamoDB({}), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

export const cookies: Partial<CookiesOptions> = {
  sessionToken: {
      name: `next-auth.session-token`,
      options: {
          httpOnly: true,
          sameSite: "none",
          path: "/",
          domain: process.env.NEXT_PUBLIC_DOMAIN,
          secure: true,
      },
  },
  callbackUrl: {
      name: `next-auth.callback-url`,
      options: {}
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: Config.GITHUB_ID || process.env.GITHUB_ID as string,
      clientSecret: Config.GITHUB_SECRET || process.env.GITHUB_SECRET as string,
    }),
  ],
  adapter: DynamoDBAdapter(dynamoClient, {
    tableName: Table['user-data'].tableName,
  }),
  session: {
    strategy: "jwt",
  },
  cookies: cookies,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }

      return session;
    },
  },
};