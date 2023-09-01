import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    token?: JWT;
    user?: User;
    expires?: ISODateString;
  }

  interface User {
    name?: string;
    email?: string;
    picture?: string;
    id?: string;
  }
}
