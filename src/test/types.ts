import { File } from "../common/types";

export interface TestCase {
  name: string;
  description: string;
  hash?: string;
  snippet?: File;
}
