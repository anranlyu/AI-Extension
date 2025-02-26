import OpenAI from "openai";
import { ds_key } from "../assets/API_KEY";

interface Props {
  prompt: string;
  text: string;
}

const getTranslationFromDeepseek = async ({ prompt, text }: Props): Promise<string> => {
  console.log("getTranslationFromDeepseek called");

  const getOpenAi = async (): Promise<OpenAI> => {
    const { apiKey } = await chrome.storage.local.get(["apiKey"]);
    const key = apiKey || ds_key;
    console.log("Using API key:", key); // Debug log.
    return new OpenAI({
      baseURL: "https://api.deepseek.com/v1", // Check if this is the correct endpoint.
      apiKey: key || "",
    });
  };

  const openai = await getOpenAi();

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt + text }],
    model: "deepseek-chat", // Adjust based on Deepseek's documentation.
  });

  const newText = completion.choices[0].message.content;
  return newText || "got nothing from deepseek";
};

export default getTranslationFromDeepseek;
