const defaultEnvironment = "dev";
const defaultRegion = "eu-west-2";

export type GetArgProps = {
  cliArg: string;
  processEnvName: string;
  defaultValue?: string;
};

export const getArg = ({
  cliArg,
  processEnvName,
  defaultValue,
}: GetArgProps): string => {
  const isNonEmptyString = (arg: unknown): arg is string =>
    typeof arg === "string" && arg !== "";

  const getCdkContext = (): Record<string, unknown> | undefined => {
    const cdkContextEnv = process.env.CDK_CONTEXT_JSON;

    return cdkContextEnv != null
      ? (JSON.parse(cdkContextEnv) as Record<string, unknown>)
      : undefined;
  };

  const findCliArg = (key: string): string | undefined => {
    const index = process.argv.findIndex((arg) => arg === `--${key}`);
    return index !== -1 && index + 1 < process.argv.length
      ? process.argv[index + 1]
      : undefined;
  };

  const argSources = [
    findCliArg(cliArg),
    getCdkContext()?.[cliArg] as string | undefined,
    process.env[processEnvName],
    defaultValue,
  ];

  for (const arg of argSources) {
    if (isNonEmptyString(arg)) {
      return arg;
    }
  }

  throw new Error(
    `--${cliArg} CLI argument or ${processEnvName} env var required.`
  );
};

export const buildResourceName = (resourceName: string): string =>
  `${getStackName()}-${resourceName}`;

export const getStackName = (): string => {
  const arg = getArg({
    cliArg: "stackName",
    processEnvName: "STACK_NAME",
    defaultValue: getStage(),
  });
  return arg;
};
export const getStage = (): string => {
  return getArg({
    cliArg: "stage",
    processEnvName: "STAGE",
    defaultValue: defaultEnvironment,
  });
};

export const getRegion = (): string =>
  getArg({
    cliArg: 'region',
    processEnvName: 'REGION',
    defaultValue: defaultRegion,
  });