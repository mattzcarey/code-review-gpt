export interface TestCaseMetadata {
  name: string;
  description: string;
}

export const isTestCaseMetadata = (input: unknown): input is TestCaseMetadata =>
  typeof input === 'object' &&
  input !== null &&
  'name' in input &&
  typeof input.name === 'string' &&
  'description' in input &&
  typeof input.description === 'string';
