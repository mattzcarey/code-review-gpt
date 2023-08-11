import { SSM } from "aws-sdk";

export const getVariableFromSSM = async (
  parameterName: string
): Promise<string> => {
  if (parameterName === "") {
    throw new Error("No SSM parameter name provided.");
  }

  const ssmClient = new SSM();
  const response = await ssmClient
    .getParameter({
      Name: parameterName,
      WithDecryption: true,
    })
    .promise();
  const keyValue = response.Parameter?.Value;
  if (keyValue === undefined) {
    throw new Error(
      `Could not retrieve value for key ${parameterName} from AWS Parameter Store.`
    );
  }
  return keyValue;
};

export const getEnvVariable = (variableName: string): string => {
  const value = process.env[variableName];

  if (value === undefined) {
    throw new Error(`Environment variable not found: ${variableName}`);
  }

  return value;
};
