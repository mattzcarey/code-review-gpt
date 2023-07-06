import { OpenAIChat } from "langchain/llms/openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

let apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const model = new OpenAIChat({
  openAIApiKey: apiKey,
  modelName: "gpt-4",
  temperature: 0.0,
});

export const askAI = async (text: string): Promise<string> => {
  if (text.length <= 3000) {
    const res = await model.call(text);
    return res;
  }

  const delimiter = "------------------------"; // Specify the delimiter to split the text
  const chunks = text.split(delimiter);

  const responses = [];
  for (const chunk of chunks) {
    try {
      const res = await model.call(chunk);
      responses.push(res);
    } catch (error) {
      console.error(error);
    }
  }

  return responses.join("");
};
