# How to name and deploy your stacks

When developing be sure to use the `buildResourceName()` to define the names of your stacks and constructs.

The `buildResourceName("<resource_name>")` uses command line arguments set when deploying to prepend additional info to the resource names.

### Command line argument options

- `stage` - the stage that you are developing on, ie. `dev`, `staging`,`prod`.
- `region` - the region, defaults to `eu-west-2`. This is not used in the naming of resources.

### Example Deploy command

When you want to deploy you can set these cli options.

```bash
cdk deploy  --context stage=<your_stage>
```
