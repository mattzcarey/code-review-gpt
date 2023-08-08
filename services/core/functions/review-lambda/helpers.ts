import { SSM } from "aws-sdk";

export const getOpenAiApiEnvVariable = async (
  openApiKeyParamName: string
): Promise<string | undefined> => {
  const ssmClient = new SSM();
  const response = await ssmClient
    .getParameter({
      Name: openApiKeyParamName,
      WithDecryption: true,
    })
    .promise();
  const keyValue = response.Parameter?.Value;
  if (keyValue === undefined) {
    throw new Error(
      `Could not retrieve value for key ${openApiKeyParamName} from AWS Parameter Store.`
    );
  }
  return keyValue;
};
