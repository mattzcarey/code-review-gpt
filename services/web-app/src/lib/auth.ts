import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;

if (!clientId || !clientSecret) {
  throw new Error('Missing required environment variables GITHUB_ID and/or GITHUB_SECRET.');
}
export const authOptions: NextAuthOptions = ({
  providers: [
    GithubProvider({
      clientId,
      clientSecret,
    }),
  ],
});