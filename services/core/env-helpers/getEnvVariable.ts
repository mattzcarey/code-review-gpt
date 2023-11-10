export const getEnvVariable = (name: string): string => {
  const variable = process.env[name];
  if (variable === undefined) {
    throw new Error(`Environment variable not found: ${name}`);
  }

  return variable;
};
