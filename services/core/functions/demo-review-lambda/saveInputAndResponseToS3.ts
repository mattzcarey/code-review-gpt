import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ReviewEntity } from "../../entities";

export const saveInputAndResponseToS3 = async (
  bucketName: string,
  s3Client: S3Client,
  id: string,
  input: string,
  response: string
): Promise<void> => {
  const date = new Date();
  const bucketDateFolder = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;

  const bucketInput = {
    Bucket: bucketName,
    Key: `${bucketDateFolder}/${id}/input.md`,
    Body: input,
  };

  const putBucketInputCommand = new PutObjectCommand(bucketInput);
  await s3Client.send(putBucketInputCommand);

  const bucketResponse = {
    Bucket: bucketName,
    Key: `${bucketDateFolder}/${id}/response.md`,
    Body: response,
  };

  const putBucketResponseCommand = new PutObjectCommand(bucketResponse);
  await s3Client.send(putBucketResponseCommand);

  await ReviewEntity.put({
    reviewId: id,
    inputLocation: `${bucketDateFolder}/${id}/input.md`,
    responseLocation: `${bucketDateFolder}/${id}/response.md`,
    demo: true,
  });
};
