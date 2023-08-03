import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ReviewLambda } from '../functions/review-lambda/config';

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    ReviewLambda(this, props);
  }
}
