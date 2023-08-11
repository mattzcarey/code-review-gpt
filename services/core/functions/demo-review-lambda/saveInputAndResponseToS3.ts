import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getDemoReviewS3LocationEntity } from "../../entities/demoReviewS3LocationEntity";

export const saveInputAndResponseToS3 = async (
  tableName: string,
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

  const demoReviewS3LocationEntity = getDemoReviewS3LocationEntity(tableName);
  await demoReviewS3LocationEntity.put({
    reviewId: id,
    inputLocation: `${bucketDateFolder}/${id}/input.md`,
    responseLocation: `${bucketDateFolder}/${id}/response.md`,
  });
};
