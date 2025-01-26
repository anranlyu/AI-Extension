import OpenAI from "openai";
import { Prompt } from "../assets/Prompt";
import { apiKey } from "../assets/API_KEY";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey
})

const getSummaryFromDeepseek = async(message:string) => {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: Prompt + message }],
        model: "deepseek-chat",
    });

    const text = completion.choices[0].message.content;
    return text || "got nothing from deepseek";


}

export default getSummaryFromDeepseek;