export const getEnvVariableOrDefault = (
  name: string,
  defaultValue: string
): string => process.env[name] ?? defaultValue;
