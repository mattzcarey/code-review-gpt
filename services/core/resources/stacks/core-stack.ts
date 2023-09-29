import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

import { getCertificateArn } from "../../cdk-helpers/certificates";
import { GetUserLambda } from "../../functions/get-user/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { getDomainName, getStage } from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";
import { CoreTable } from "../constructs/dynamodb";

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  table: Table;
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    //API
    const api = new OrionApi(this, "core-api", {
      rootDomain: getDomainName(props.stage),
      subDomain: "api",
      certificateArn: getCertificateArn(this, "api"),
    });

    //KMS
    const kmsKey = new Key(this, "encryption-key", {
      enableKeyRotation: true,
      alias: `${getStage()}/encryption-key`,
    });

    //DynamoDB
    this.table = new CoreTable(this, "core-table");

    //Lambda
    const updateUserLambda = new UpdateUserLambda(this, "update-user-lambda", {
      table: this.table,
      kmsKey: kmsKey,
    });
    const getUserLambda = new GetUserLambda(this, "get-user-lambda", {
      table: this.table,
    });

    //Routes
    const updateUserRoute = api.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda));

    const getUserRoute = api.root.addResource("getUser");
    getUserRoute.addMethod("GET", new LambdaIntegration(getUserLambda));

    //Exports
    new CfnOutput(this, "baseUrl", {
      value: api.url,
      exportName: `${props.stage}BaseUrl`,
    });
  }
}
