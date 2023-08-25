import * as jwt from "jsonwebtoken";

const token = '';
const secretKey = process.env.NEXTAUTH_SECRET ?? "";

try {
  const decodedToken = jwt.verify(token, secretKey) as { [key: string]: any };
  console.log(decodedToken);
} catch (error) {
  console.error('Error decoding token:', error);
}
