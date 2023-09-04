import { ISODateString } from "next-auth";

declare module "next-auth" {
  interface Session {
    token?: string;
    user?: User;
    expires?: ISODateString;
  }

  interface User {
    name?: string;
    email?: string;
    pictureUrl?: string;
    id?: string;
    repos?: [string];
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
