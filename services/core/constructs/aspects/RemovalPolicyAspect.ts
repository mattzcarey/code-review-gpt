import { CfnResource, IAspect, RemovalPolicy } from "aws-cdk-lib";
import { IConstruct } from "constructs";

import { isProduction } from "../../env-helpers";

export class RemovalPolicyAspect implements IAspect {
  visit(node: IConstruct): void {
    if (node instanceof CfnResource && !isProduction()) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  }
}
