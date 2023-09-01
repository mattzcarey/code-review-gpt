import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import { getStage } from "./env-helpers";
import { isDev } from "./environment";

export const getCertificateArn = (
  scope: Construct,
  subDomain: string
): string | undefined => {
  const stage = getStage();

  if (isDev()) {
    return undefined;
  }

  return StringParameter.fromStringParameterAttributes(
    scope,
    `CertificateArnParameter-${subDomain}-${stage}`,
    {
      parameterName: `${subDomain.toUpperCase()}_${stage.toUpperCase()}_CERTIFICATE_ARN`,
    }
  ).stringValue;
};
