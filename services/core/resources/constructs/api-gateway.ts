import {
  BasePathMapping,
  DomainName,
  EndpointType,
  RestApi,
  RestApiProps,
} from "aws-cdk-lib/aws-apigateway";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { buildResourceName } from "../../helpers";

export interface CoreApiProps extends Omit<RestApiProps, "restApiName"> {
  domainNameString: string;
  certificateArn?: string;
}

export class CoreApi extends RestApi {
  constructor(scope: Construct, id: string, props: CoreApiProps) {
    super(scope, id, {
      ...props,
      restApiName: buildResourceName(id),
      deployOptions: {
        ...props?.deployOptions,
        tracingEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    const { certificateArn, domainNameString } = props;

    if (certificateArn) {
      const certificate = Certificate.fromCertificateArn(
        this,
        "Certificate",
        certificateArn
      );

      // Create custom domain
      const customDomain = new DomainName(this, "CustomDomain", {
        domainName: domainNameString,
        certificate: certificate,
        endpointType: EndpointType.EDGE, // or REGIONAL
      });

      // Create a base path mapping that links the custom domain to the API
      new BasePathMapping(this, "BasePathMapping", {
        domainName: customDomain,
        restApi: this,
      });
    }
  }
}
