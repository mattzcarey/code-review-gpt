const encodeAttribute = (attribute: string, jsonString: string): string => {
  const regex = new RegExp(
    `"${attribute}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`,
    "g"
  );
  return jsonString.replace(
    regex,
    (match, value) => `"${attribute}": "${encodeURIComponent(value)}"`
  );
};

const decodeAndReplaceNewlines = (value: string): string => {
  return decodeURIComponent(value).replace(/\\n/g, "\n");
};

const processAttributes = (
  object: any,
  attributesToEncode: string[],
  processor: (value: string) => string
) => {
  attributesToEncode.forEach((attribute) => {
    if (object[attribute]) {
      object[attribute] = processor(object[attribute]);
    }
  });
};

export const parseAndDecodeAttributes = <T>(
  jsonString: string,
  attributesToEncode: string[]
): T => {
  let encodedJsonString = jsonString;

  // Encode the specified attributes
  attributesToEncode.forEach((attribute) => {
    encodedJsonString = encodeAttribute(attribute, encodedJsonString);
  });

  // Parse the JSON string
  const parsedObject: T = JSON.parse(encodedJsonString);

  // Decode the specified attributes for each item and replace '\n' with actual newline characters
  if (Array.isArray(parsedObject)) {
    parsedObject.forEach((item: any) => {
      processAttributes(item, attributesToEncode, decodeAndReplaceNewlines);
    });
  }

  return parsedObject;
};
