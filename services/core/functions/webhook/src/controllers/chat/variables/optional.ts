import { Context } from "probot";

interface GHVariables {
  [variableName: string]: string | undefined;
}
export const getOptionalVariablesFromGH = async (
  variables: string[],
  context: Context
): Promise<GHVariables> => {
  const repo = context.repo();
  const variablesData: GHVariables = {};

  await Promise.all(
    variables.map(async (variable) => {
      try {
        const { data } = (await context.octokit.request(
          "GET /repos/{owner}/{repo}/actions/variables/{name}",
          {
            owner: repo.owner,
            repo: repo.repo,
            name: variable,
          }
        )) as { data: { value: string | undefined } };

        variablesData[variable] = data.value;
      } catch (error) {
        console.error("Using default value for", variable);

        return undefined;
      }
    })
  );

  return variablesData;
};
