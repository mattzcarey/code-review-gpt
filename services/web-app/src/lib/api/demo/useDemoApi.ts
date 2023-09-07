import { postDemoReview } from "./demo";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDemoApi = () => {
  return {
    postDemoReview: async (code: string) => postDemoReview(code),
  };
};
