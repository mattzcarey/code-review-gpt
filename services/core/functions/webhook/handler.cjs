const crypto = require("crypto");
const { Probot } = require("probot");

const appFn = require("./bot").app;

exports.main = async (event, context) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  const probot = new Probot({
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    secret: process.env.WEBHOOK_SECRET,
    log: { level: "info" },
  });

  probot.load(appFn);

  try {
    const payload = event.body;
    const secret = process.env.WEBHOOK_SECRET;
    const computedSignature =
      `sha1=` + crypto.createHmac("sha1", secret).update(payload).digest("hex");

    const receivedSignature = lowercaseKeys(event.headers)["x-hub-signature"];

    console.log("Computed Signature:", computedSignature);
    console.log("Received Signature:", receivedSignature);

    if (computedSignature !== receivedSignature) {
      console.error("Signatures do not match");
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Unauthorized: Signatures do not match",
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error("Error processing webhook:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

function lowercaseKeys(object) {
  return Object.keys(object).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = object[key];
    return accumulator;
  }, {});
}
