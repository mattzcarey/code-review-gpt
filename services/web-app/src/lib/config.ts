export const clientId = process.env.GITHUB_ID;
export const clientSecret = process.env.GITHUB_SECRET;

if (!clientId || !clientSecret) {
  throw new Error('Missing required environment variables GITHUB_ID and/or GITHUB_SECRET.');
}

export const awsAccessKeyId = process.env.AWS_ACCESS_KEY;
export const awsSecretKey = process.env.AWS_SECRET_KEY;
export const awsRegion = process.env.AWS_REGION;

if (!awsAccessKeyId || !awsSecretKey || !awsRegion) {
  throw new Error('Missing required AWS environment variables.');
}
