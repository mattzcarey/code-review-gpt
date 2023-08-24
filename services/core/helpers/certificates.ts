import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export const getCertificateArn = (
  scope: Construct,
  stage: string,
  subDomain: string
): string | undefined => {
  return (
    StringParameter.fromSecureStringParameterAttributes(
      scope,
      "CertificateArnParameter",
      {
        parameterName: `${subDomain.toUpperCase()}_${stage.toUpperCase()}_CERTIFICATE_ARN`,
      }
    ).stringValue ?? undefined
  );
};
