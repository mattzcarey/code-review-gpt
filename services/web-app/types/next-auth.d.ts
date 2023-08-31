import { ISODateString } from "next-auth";

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

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    refreshTokenExpires?: number;
    accessTokenExpires?: number;
    refreshToken?: string;
    token: string;
    exp?: number;
    iat?: number;
    jti?: string;
  }
}
