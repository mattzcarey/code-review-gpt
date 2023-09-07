## Getting Started

Make a copy of the .env.example file and call it .env. Replace each of the xxx with your own NEXTAUTH_SECRET, and NEXTAUTH_URL.

For the GITHUB_ID and GITHUB_SECRET you have two options:
- You can set these keys in your .env file
- You can set them using SST Config

For setting them in SST you would need to use the following commands:

```bash
npx sst secrets set GITHUB_ID sk_test_abc123
npx sst secrets set GITHUB_SECRET sk_test_abc123
npx sst secrets set NEXTAUTH_SECRET sk_test_abc123
npx sst secrets set USER_API_KEY sk_test_abc123
```
The `USER_API_KEY` found once you have deployed your API. Note: that the value of the key will change if you rename the API key.


To run the development server locally:

```bash
npm run dev-local
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on AWS

Involves starting our SST dev environment.

```bash
npx sst dev --stage <stage>
```

Remember to use the same stage for both your SST and CDK stack.

Next in a separate terminal:

```bash
npm run dev
```

Remember to have your AWS credentials setup in your configure file.

### Useful links

- https://sst.dev/examples/how-to-create-a-nextjs-app-with-serverless.html
- https://docs.sst.dev/advanced/iam-credentials
- https://docs.sst.dev/config