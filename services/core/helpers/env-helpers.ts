const defaultEnvironment = "dev";
const defaultRegion = "eu-west-2";

export type GetArgProps = {
  cliArg: string;
  processEnvName: string;
  defaultValue?: string;
};

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null;

const isNonEmptyString = (arg: unknown): arg is string =>
  typeof arg === "string" && arg !== "";

const getCliCdkContext = (cliArg: string): string | undefined => {
  const cdkContextEnv = process.env.CDK_CONTEXT_JSON ?? "";
  const parsedCdKContext: unknown = JSON.parse(cdkContextEnv);

  if (isRecord(parsedCdKContext) && cliArg in parsedCdKContext) {
    const cdkCli = parsedCdKContext[cliArg];
    if (typeof cdkCli === "string") {
      return cdkCli;
    }
  }

  return undefined;
};

const findCliArg = (key: string): string | undefined => {
  const index = process.argv.findIndex((arg) => arg === `--${key}`);

  return index !== -1 && index + 1 < process.argv.length
    ? process.argv[index + 1]
    : undefined;
};

export const getArg = ({
  cliArg,
  processEnvName,
  defaultValue,
}: GetArgProps): string => {
  const argSources = [
    findCliArg(cliArg),
    getCliCdkContext(cliArg),
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
  `${getStage()}-${resourceName}`;

export const getStage = (): string => {
  return getArg({
    cliArg: "stage",
    processEnvName: "STAGE",
    defaultValue: defaultEnvironment,
  });
};

export const getRegion = (): string =>
  getArg({
    cliArg: "region",
    processEnvName: "REGION",
    defaultValue: defaultRegion,
  });
