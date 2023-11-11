const {
  createLambdaFunction,
  createProbot,
} = require("@probot/adapter-aws-lambda-serverless");

const appFn = require("./bot").app;

module.exports.main = createLambdaFunction(appFn, {
  probot: createProbot(),
});
