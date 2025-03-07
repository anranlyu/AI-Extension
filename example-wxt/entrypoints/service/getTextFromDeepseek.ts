import OpenAI from "openai";


interface props {
    prompt: string,
    text: string
}

const getTextFromDeepseek = async ({ prompt, text }: props) => {
    

    const getOpenAi = async (): Promise<OpenAI> => {
        const { apiKey } = await chrome.storage.local.get(['apiKey']); 

        return new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: apiKey || '', 
        });
    };

    const openai = await getOpenAi();
    
    

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt + text }],
        model: "deepseek-chat",
    });

    const newText = completion.choices[0].message.content;
    return newText || "got nothing from deepseek";


}

export default getTextFromDeepseek;