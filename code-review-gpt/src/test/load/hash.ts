import crypto from "crypto";

const hashAlgorithm = "sha256";

/**
 * Generate a hash from a string
 * @param data The string to hash.
 * @returns The hash.
 */
export const generateHash = (data: string): string => {
  return crypto.createHash(hashAlgorithm).update(data).digest("hex");
};
