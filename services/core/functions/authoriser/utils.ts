import { JWT } from "next-auth/jwt";

export const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string
) => {
  const authResponse = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return authResponse;
};

export const expired = (token: JWT): boolean => {
  const currentEpochTimeInSeconds = Math.floor(Date.now() / 1000);
  console.log(token)
  return 0 < currentEpochTimeInSeconds;
};

