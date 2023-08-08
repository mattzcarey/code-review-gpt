import { SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";
import { DynamoStack } from './stacks/dynamoStack';

export default {
  config(_input) {
    return {
      name: "web-app",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(DynamoStack);
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site");

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
