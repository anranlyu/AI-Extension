import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey:'sk-6e89d336703847979301879845192cae'
})

const getSummaryFromDeepseek = async(message:string) => {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: `summarize followingSummarize the following content from the webpage:${message}` }],
        model: "deepseek-chat",
    });

    const text = completion.choices[0].message.content;
    return text || "got nothing from deepseek";


}

export default getSummaryFromDeepseek;