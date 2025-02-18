// This is a script to handle open tts api

import { OpenAI } from "openai";


// Step 1: Get local api key
const getOpenAIKey = async (): Promise<string> => {
    try {
        const { apiKey } = await chrome.storage.local.get(['apiKey']);
        if (!apiKey) {
            throw new Error("API key not found in local storage, please set it in the extension LLM Selector");
        }
        console.log("Successfully retrieved API key from local storage");
        return apiKey;
    } catch (error) {
        console.error("Error retrieving API key from local storage", error);
        throw error;
    }
}

// Step 2: Initialize the OpenAI object
const InitializeOpenAI = async (): Promise<OpenAI> => {
    try {
        const apiKey = await getOpenAIKey();
        const openai = new OpenAI({ apiKey });
        console.log("Successfully created OpenAI instance");
        return openai;
    } catch (error) {
        console.error("Error initializing OpenAI instance", error);
        throw error;
    }
}

InitializeOpenAI().then((openai) => {
    if (openai) {
        console.log("Ready to use OpenAI!");
    }
});

/*
Helper function
Step 3: Create a function to generate readable text
*/
// TODO: Implement this function
//const generateReadableText



// Step 4: Create a function to generate audio from text
// TODO: Implement this function
//const generateAudioFromText


/*const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: ttsText,
});
*/

// Step 5: Export the function to be used in other files
// export default generateAudioFromText;
