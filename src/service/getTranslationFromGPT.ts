import OpenAI from "openai";
import { gpt_Key } from "../assets/API_KEY";

interface Props {
  prompt: string;
  text: string;
  targetLanguage?: string;
}

const getTranslationFromGPT = async ({ prompt, text, targetLanguage }: Props): Promise<string> => {
  console.log("getTranslationFromGPT called");

  let finalPrompt = prompt;
  if (targetLanguage) {
    finalPrompt = `${prompt} to ${targetLanguage}:`;
  }

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
    messages: [{ role: "system", content: finalPrompt },
    { role: "user", content: text }], 
    model: "gpt-4o-mini", 
  });

  console.log("Full API response:", completion);

  // where is the handling of api response? in a different file?

  const newText = completion.choices[0].message?.content;
  return newText || "Got nothing from GPT";
};

export default getTranslationFromGPT;
