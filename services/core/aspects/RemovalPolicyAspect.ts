import { CfnResource, IAspect, RemovalPolicy } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import { isProduction } from "../helpers";

export class RemovalPolicyAspect implements IAspect {
  constructor() {}
  visit(node: IConstruct): void {
    if (node instanceof CfnResource && !isProduction()) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  }
}
