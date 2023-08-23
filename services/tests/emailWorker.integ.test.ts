import { getVariableFromSSM } from "../core/functions/helpers/getVariable";

describe("CloudFlare email worker health test", () => {
  it("Should return 200 after successfully hitting the CloudFlare health endpoint", async() => {
    const url = await getVariableFromSSM("CLOUDFLARE_WORKER_URL");
    const res =  await fetch(url.concat("api/health"), {
      method: "GET",
    });

    expect(res.status).toEqual(200);
  });
});