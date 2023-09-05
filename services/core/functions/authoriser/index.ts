import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { getVariableFromSSM } from "../helpers/getVariable";
import { decode } from "next-auth/jwt";
import { expired, generatePolicy } from "./utils";
import { UserToken } from "../../helpers/types";
export const main = async (event: APIGatewayTokenAuthorizerEvent) => {
  try {
    const headerToken = event.authorizationToken.replace("Bearer ", ""); // Extract the JWT from the request headers
    const nextAuthSecretParamName = process.env
      .NEXTAUTH_SECRET_PARAM_NAME as string; // Retrieve JWT secret ARN from environment variables

    //Get NextAuth Secret
    if (nextAuthSecretParamName === "") {
      console.error("NEXTAUTH_SECRET is not set. Request declined.");
      return generatePolicy("", "Deny", event.methodArn);
    }
    const nextAuthSecret = await getVariableFromSSM(nextAuthSecretParamName);

    //Decode Token
    const decodedToken = await decode({
      token: headerToken,
      secret: nextAuthSecret,
    });
    console.log(decodedToken);

    // Check token is defined
    if (decodedToken?.sub === undefined) {
      console.error("Error decrypting JWT. Request declined.");
      return generatePolicy("", "Deny", event.methodArn);
    }
    
    // Check if token is still valid
    if (expired(decodedToken)) {
      console.log("Token expired");
      return generatePolicy("", "Deny", event.methodArn);
    }

    return generatePolicy(decodedToken.sub, "Allow", event.methodArn);
  } catch (error) {
    console.error("Error authorizing user:", error);
    return generatePolicy("", "Deny", event.methodArn);
  }
};
