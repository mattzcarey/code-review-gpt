import * as dotenv from 'dotenv';

dotenv.config({ path: './services/tests/.env' });

describe("CloudFlare email worker health test", () => {
  test("Should return 200 after successfully hitting the CloudFlare health endpoint", async() => {
    const res =  await fetch(process.env.CLOUDFLARE_WORKER_HEALTH_URL ?? "", {
      method: "GET",
    });

    expect(res.status).toEqual(200);
  });
});