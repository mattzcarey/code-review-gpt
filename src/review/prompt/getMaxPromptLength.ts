import { modelInfo } from "../constants";

export const getMaxPromptLength = (modelName: string): number => {
  const maxPromptLength = modelInfo.find(
    (info) => info.model === modelName
  )?.maxPromptLength;

  if (!maxPromptLength) {
    throw new Error(
      `Model ${modelName} not found. Please choose one of ${modelInfo.map(
        (info) => info.model
      )} or make a PR to add a new model.`
    );
  }

  return maxPromptLength;
};
