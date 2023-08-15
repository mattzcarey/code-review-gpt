import { DecryptCommand, KMSClient } from "@aws-sdk/client-kms";
import { getEnvVariable } from "../helpers/getVariable";

const kmsClient = new KMSClient({});

const kmsKeyId = getEnvVariable("KMS_KEY_ID");

export const decryptKey = async (encryptedKey: Uint8Array): Promise<string> => {
  const input = {
    KeyId: kmsKeyId,
    CiphertextBlob: encryptedKey,
  };

  const command = new DecryptCommand(input);

  const response = await kmsClient.send(command);

  if (!response.Plaintext) {
    throw new Error("No decrypted key returned from kms.");
  }

  return new TextDecoder("utf-8").decode(response.Plaintext);
};
