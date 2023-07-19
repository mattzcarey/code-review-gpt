import crypto from "crypto";

const hashAlgorithm = "sha256";

export const generateHash = (data: string): string => {
  return crypto.createHash(hashAlgorithm).update(data).digest("hex");
};
