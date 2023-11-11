# Core Backend Service

Note this service uses pnpm as the package manager.

```bash
npm install -g pnpm
```

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
