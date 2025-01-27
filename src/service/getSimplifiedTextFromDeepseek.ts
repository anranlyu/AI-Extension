import OpenAI from "openai";
import { Prompt } from "../assets/Prompt";



const getSummaryFromDeepseek = async (message: string) => {


    const getOpenAi = async (): Promise<OpenAI> => {
        const { apiKey } = await chrome.storage.local.get(['apiKey']); 

        return new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: apiKey || '', 
        });
    };

    const openai = await getOpenAi();
    
    

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: Prompt + message }],
        model: "deepseek-chat",
    });

    const text = completion.choices[0].message.content;
    return text || "got nothing from deepseek";


}

export default getSummaryFromDeepseek;