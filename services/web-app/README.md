## Getting Started

First, to run the development server locally:

```bash
npm run dev-local
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on AWS

Involves starting our SST dev environment:

```bash
npx sst dev
```

Next in a separate terminal:

```bash
npm run dev
```

Remember to have your AWS credentials setup in your configure file.

### Useful links

..*https://sst.dev/examples/how-to-create-a-nextjs-app-with-serverless.html
..*https://docs.sst.dev/advanced/iam-credentials