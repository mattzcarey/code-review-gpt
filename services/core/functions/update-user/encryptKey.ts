import { EncryptCommand, KMSClient } from "@aws-sdk/client-kms";

import { getEnvVariable } from "../utils/getVariable";

const kmsClient = new KMSClient({});

const kmsKeyId = getEnvVariable("KMS_KEY_ID");

export const encryptKey = async (key: string): Promise<Uint8Array> => {
  const input = {
    KeyId: kmsKeyId,
    Plaintext: new TextEncoder().encode(key),
  };

  const command = new EncryptCommand(input);

  const response = await kmsClient.send(command);

  if (!response.CiphertextBlob) {
    throw new Error("No encrypted key returned from kms.");
  }

  return response.CiphertextBlob;
};
