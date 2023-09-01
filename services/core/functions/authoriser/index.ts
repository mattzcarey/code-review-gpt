import { APIGatewayTokenAuthorizerEvent, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { verify } from 'jsonwebtoken';

export const main = async (event: APIGatewayTokenAuthorizerEvent) => {
      try {
        const token = event.authorizationToken.replace('Bearer ', ''); // Extract the JWT from the request headers
        const secretArn = process.env.JWT_SECRET_ARN as string; // Retrieve JWT secret ARN from environment variables
    
        // Retrieve the JWT secret from Secrets Manager
        // You'll need to implement this part to fetch the secret
        // const jwtSecret = await getJwtSecret(secretArn);
    
        // Verify the JWT's signature using the secret
        // Replace 'your-secret-arn' with the actual ARN of your JWT secret in Secrets Manager
        // const decoded = verify(token, jwtSecret) as { sub: string }; // Replace 'sub' with the actual key used in your JWT
    
        // Check against the auth DB to confirm the session is still valid
        // You'll need to implement this part to check the session validity
    
        // If valid, allow the request to proceed
        return generatePolicy(decoded.sub, 'Allow', event.methodArn);
      } catch (error) {
        console.error('Error authorizing user:', error);
        return generatePolicy('', 'Deny', event.methodArn);
      }
    };
    
    function generatePolicy(principalId: string, effect: string, resource: string) {
      const authResponse = {
        principalId,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: effect,
              Resource: resource,
            },
          ],
        },
      };
      return authResponse;
    }
    
    // Implement your JWT secret retrieval and session validation functions here
    

};
