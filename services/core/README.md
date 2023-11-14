# Core Backend Service

Note this service uses pnpm as the package manager.

```bash
npm install -g pnpm
```

## About the Service

This service allows you to deploy a GitHub app to AWS Lambda which will run code reviews on pull requests.

Set up your GitHub app in the GiHub UI and then set up your environment variables in this service by copying the `.env.example` file to `.env` and filling in the values.

You will not yest have a webhook url so set it to `https://example.com` for now.

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Set up AWS credentials

Set them up in `~/.aws/credentials` or use the `aws configure` command.

Recommend to use a helpful GUI to manage your AWS credentials, such as [Leapp](https://github.com/Noovolari/leapp)

### Command line argument options

- `stage` - the stage that you are developing on, ie. `dev`, `staging`,`prod`.
- `region` - the region, defaults to `eu-west-2`. This is not used in the naming of resources.

### Example Deploy command

When you want to deploy you can set these cli options.

```bash
cdk deploy  --context stage=<your_stage>
```

or ideally use the deploy script. This script includes packaging of the webhook lambda function.

```bash
pnpm deploy-staging
```

### Update the GitHub app webhook URL

Once you have deployed the service you will need to update the webhook URL in the GitHub app settings.
