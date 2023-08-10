import { SSTConfig } from "sst";
import { Config, NextjsSite, Table  } from "sst/constructs";


export default {
  config(_input) {
    return {
      name: "web-app",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const GITHUB_ID = new Config.Secret(stack, "GITHUB_ID");
      const GITHUB_SECRET = new Config.Secret(stack, "GITHUB_SECRET");

      const table = new Table(stack, "user-data", {
        fields: {
          pk: "string",
          sk: "string",
          GSI1PK: "string",
          GSI1SK: "string",
        },
        primaryIndex: { partitionKey: "pk", sortKey: "sk" },
        globalIndexes: {
          GSI1: { partitionKey: "GSI1PK", sortKey: "GSI1SK" },
        },
      });
      const site = new NextjsSite(stack, "site", {
        bind: [GITHUB_ID, GITHUB_SECRET, table],
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
