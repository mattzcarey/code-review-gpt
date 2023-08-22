describe("filterFiles unit test", () => {
  test("returns only supported files", async() => {
    const res =  await fetch("https://worker-email-production.mattc-543.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "KsaEmm?azPPMY59bAEQkyrtmK&P$J#",
      },
      body: JSON.stringify({
        "to": "",
        "from": "test@oriontools.ai",
        "subject": "Welcome",
        "html": "<p>Thanks for signing up for Orion tools. We aim to make the best AI powered dev tools. We hope you enjoy using our code review product. Here is a <a href=\"https://github.com/mattzcarey/code-review-gpt\">link</a> to the repo, give it a star. Here is a <a href=\"https://join.slack.com/t/orion-tools/shared_invite/zt-20x79nfgm-UGIHK1uWGQ59JQTpODYDwg\">link</a> to our slack community.</p>"
      }),
    });

    expect(res.status).toEqual(200);
  });
});
