import { IFeedback } from "../types";

const encodeDetails = (jsonString: string): string => {
  const regex = new RegExp(`"details"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g");

  return jsonString.replace(
    regex,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    (match, value) => `"details": "${encodeURIComponent(value)}"`
  );
};

const decodeAndReplaceNewlines = (value: string): string =>
  decodeURIComponent(value).replace(/\\n/g, "\n");

const processDetails = (object: IFeedback) =>
  (object["details"] = decodeAndReplaceNewlines(object["details"]));

const isIFeedback = (input: unknown): input is IFeedback =>
  typeof input === "object" &&
  input !== null &&
  "fileName" in input &&
  typeof input.fileName === "string" &&
  "riskScore" in input &&
  typeof input.riskScore === "number" &&
  "details" in input &&
  typeof input.details === "string";

const isIFeedbackArray = (input: unknown): input is IFeedback[] =>
  Array.isArray(input) && input.every((entry) => isIFeedback(entry));

export const parseAttributes = (jsonString: string): IFeedback[] => {
  let encodedJsonString = jsonString;
  encodedJsonString = encodeDetails(encodedJsonString);

  // Parse the JSON string
  const parsedObject: unknown = JSON.parse(encodedJsonString);

  if (isIFeedbackArray(parsedObject)) {
    // Decode the specified attributes for each item and replace '\n' with actual newline characters
    parsedObject.forEach((item: IFeedback) => {
      processDetails(item);
    });

    return parsedObject;
  } else {
    throw new Error(
      `The shape of the object returned from the model was incorrect. Object returned was ${String(
        parsedObject
      )}. Object should include fileName, riskScore and details fields.`
    );
  }
};
