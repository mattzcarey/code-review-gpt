import {
  EndpointType,
  RestApi,
  RestApiProps,
} from "aws-cdk-lib/aws-apigateway";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

import { buildResourceName } from "../env-helpers";

export interface CoreApiProps extends Omit<RestApiProps, "restApiName"> {
  rootDomain?: string;
  subDomain?: string;
  certificateArn?: string;
}

export class CRGPTApi extends RestApi {
  constructor(scope: Construct, id: string, props: CoreApiProps) {
    super(scope, id, {
      ...props,
      restApiName: buildResourceName(id),
      deployOptions: {
        ...props.deployOptions,
        tracingEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-GitHub-Event",
          "X-GitHub-Delivery",
          "X-Hub-Signature-256",
          "X-Hub-Signature",
        ],
        allowMethods: ["OPTIONS", "POST"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    const { rootDomain, subDomain, certificateArn } = props;

    if (certificateArn && rootDomain && subDomain) {
      const certificate = Certificate.fromCertificateArn(
        this,
        "Certificate",
        certificateArn
      );

      this.addDomainName("DomainName", {
        domainName: `${subDomain}.${rootDomain}`,
        certificate: certificate,
        endpointType: EndpointType.EDGE,
      });

      new ARecord(this, "ApiSubDomainDNS", {
        zone: HostedZone.fromLookup(this, "baseZone", {
          domainName: rootDomain,
        }),
        recordName: subDomain,
        target: RecordTarget.fromAlias(new ApiGateway(this)),
      });
    }
  }
}
