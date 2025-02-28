// import { awan_key } from "../assets/API_KEY";

interface Props {
  prompt: string;
  text: string;
}

const getTranslationFromAwan = async ({ prompt, text }: Props): Promise<string> => {
  console.log("getTranslationFromAwan is called");

  const storageResult = await chrome.storage.local.get(["apiKey"]);
  const apiKey = storageResult.apiKey;
  
  // Construct the request payload.
  // System prompt is drawn from Prompt.ts
  // User message = selected text to translate
  const body = {
    model: "Meta-Llama-3-8B-Instruct", 
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: text }
    ],
    repetition_penalty: 1.1,
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    max_tokens: 1024,
    stream: false // Change to true if you plan to handle streaming.
  };

  // POST request using fetch
  const response = await fetch("https://api.awanllm.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Awan API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const newText = data.choices?.[0]?.message?.content;
  return newText || "Got nothing from Awan";
};

export default getTranslationFromAwan;
