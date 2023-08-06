export const parseAndDecodeAttributes = <T>(
  jsonString: string,
  attributesToEncode: string[]
): T => {
  let encodedJsonString = jsonString;

  // Encode the specified attributes
  attributesToEncode.forEach((attribute) => {
    encodedJsonString = encodedJsonString.replace(
      new RegExp(`"${attribute}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g"),
      (match, value) => {
        return `"${attribute}": "${encodeURIComponent(value)}"`;
      }
    );
  });

  // Parse the JSON string
  const parsedObject: T = JSON.parse(encodedJsonString);

  // Decode the specified attributes for each item
  if (Array.isArray(parsedObject)) {
    parsedObject.forEach((item: any) => {
      attributesToEncode.forEach((attribute) => {
        if (item[attribute]) {
          item[attribute] = decodeURIComponent(item[attribute]);
        }
      });
    });
  }

  return parsedObject;
};
