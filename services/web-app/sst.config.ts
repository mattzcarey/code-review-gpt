import { Tags } from "aws-cdk-lib";
import { SSTConfig } from "sst";
import { Config, NextjsSite, Table } from "sst/constructs";
import { getDomainName } from "./helpers";

export default {
  config(_input) {
    return {
      name: "web-app",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      architecture: "arm_64",
      runtime: "nodejs18.x",
    });
    app.stack(function Site({ stack }) {
      const GITHUB_ID = new Config.Secret(stack, "GITHUB_ID");
      const GITHUB_SECRET = new Config.Secret(stack, "GITHUB_SECRET");
      const NEXTAUTH_SECRET = new Config.Secret(stack, "NEXTAUTH_SECRET");
      const NEXTAUTH_URL = new Config.Parameter(stack, "NEXTAUTH_URL", {
        value: getDomainName(stack.stage) ?? "http://localhost:3000",
      });

      const table = new Table(stack, "auth", {
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
        stream: "new_image",
        consumers: {
          consumer1: {
            function: {
              handler: "./functions/add-user/index.main",
              permissions: ["dynamodb", "ssm"],
              environment: {
                CLOUDFLARE_WORKER_TOKEN_NAME: "CLOUDFLARE_WORKER_TOKEN",
                CLOUDFLARE_WORKER_URL_NAME: "CLOUDFLARE_WORKER_URL",
              },
            },
            filters: [
              {
                dynamodb: {
                  NewImage: {
                    type: {
                      S: ["USER"],
                    },
                  },
                },
              },
            ],
          },
        },
      });

      const site = new NextjsSite(stack, "site", {
        bind: [GITHUB_ID, GITHUB_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET, table],
        customDomain: getDomainName(stack.stage),
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });

    //enable OTel traces
    Tags.of(app).add("baselime:tracing", `true`);
  },
} satisfies SSTConfig;
