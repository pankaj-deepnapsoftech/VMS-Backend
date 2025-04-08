import OpenAI from "openai";
import { config } from "../config/env.config.js";
export const GPTResponse = async (text) => {
  const client = new OpenAI({ apiKey: `${config.OPENAPI_API_KEY}` });

  const response = await client.responses.create({
    model: "gpt-4o",
    input: text,
  });

  return response.output_text;
};