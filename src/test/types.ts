import { ReviewFile } from "../common/types";

export type TestCase = {
  name: string;
  description: string;
  hash?: string;
  snippet?: ReviewFile;
}
