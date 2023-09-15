import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

import { GetUserLambda } from "../../functions/get-user/config";
import { UpdateUserLambda } from "../../functions/update-user/config";
import { getCertificateArn, getDomainName, getStage } from "../../helpers";
import { OrionApi } from "../constructs/api-gateway";
import { UserTable } from "../constructs/user-table";
import { AddRepoLambda } from '../../functions/add-repo/config';
import { Lambda } from 'aws-cdk-lib/aws-ses-actions';

interface CoreStackProps extends StackProps {
  stage: string;
}

export class CoreStack extends Stack {
  userTable: Table;
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
    this.userTable = new UserTable(this, "user-database");

    //Lambda
    const updateUserLambda = new UpdateUserLambda(this, "update-user-lambda", {
      table: this.userTable,
      kmsKey: kmsKey,
    });
    const getUserLambda = new GetUserLambda(this, "get-user-lambda", {
      table: this.userTable,
    });

    const addRepoLambda = new AddRepoLambda(this, "add-repo-lambda", {
      table: this.userTable,
    });

    //Routes
    const updateUserRoute = api.root.addResource("updateUser");
    updateUserRoute.addMethod("POST", new LambdaIntegration(updateUserLambda));

    const getUserRoute = api.root.addResource("getUser");
    getUserRoute.addMethod("GET", new LambdaIntegration(getUserLambda));

    const addRepoRoute = api.root.addResource("addRepo");
    addRepoRoute.addMethod("POST", new LambdaIntegration(addRepoLambda));
  }
}
