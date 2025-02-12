import OpenAI from "openai";
import { gpt_Key } from "../assets/API_KEY";

interface Props {
  prompt: string;
  text: string;
}

const getTranslationFromGPT = async ({ prompt, text }: Props): Promise<string> => {
  console.log("getTranslationFromGPT called");

  const getOpenAi = async (): Promise<OpenAI> => {
    const storageResult = await chrome.storage.local.get(["apiKey"]);
    const apiKey = storageResult.apiKey || gpt_Key; 
    
    return new OpenAI({
      baseURL: "https://api.openai.com/v1", 
      apiKey: apiKey || "", // empty string if no key is available.
    });
  };

  const openai = await getOpenAi();

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt + text }],
    model: "gpt-3.5-turbo", 
  });

  const newText = completion.choices[0].message?.content;
  return newText || "got nothing from GPT";
};

export default getTranslationFromGPT;
