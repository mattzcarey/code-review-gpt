describe("CloudFlare email worker health test", () => {
  test("Should return 200 after successfully hitting the CloudFlare health endpoint", async() => {
    const res =  await fetch("https://worker-email-production.mattc-543.workers.dev/api/health", {
      method: "GET",
    });
    expect(res.status).toEqual(200);
  });
});
