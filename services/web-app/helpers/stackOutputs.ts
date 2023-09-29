import { Fn } from "aws-cdk-lib";

export const getStackOutput = (stage: string, outputName: string): string => {
  const value = Fn.importValue(`${stage}${outputName}`);

  if (value === "undefined") {
    throw new Error(
      `Stack output ${outputName} not found, have you deployed the dependent stacks?`
    );
  }

  return value;
};
