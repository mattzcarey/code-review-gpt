import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ReviewLambda } from "../../functions/review-lambda/config";

interface CoreStackProps extends StackProps {
  stage: string,
}
export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);
    new ReviewLambda(this, "review-lambda-construct");
  }
}
