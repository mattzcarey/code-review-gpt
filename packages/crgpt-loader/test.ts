import { CRGPTLoader } from "./src/crgpt-loader";

const test = () => {
  const loader = new CRGPTLoader(
    "https://github.com/mattzcarey/code-review-gpt"
  );

  loader.load();
  loader.read();
  loader.delete();
};

test();
