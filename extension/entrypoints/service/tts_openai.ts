// This is a script to handle open tts api
import { OpenAI } from "openai";

type VoiceOption = "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer";


// Step 1: Get local api key
// Function to get the OpenAI API key from Chrome storage
const getOpenAIKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['apiKey'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving API key:", chrome.runtime.lastError.message);
                return reject("Error retrieving API key.");
            }
            if (!result.apiKey) {
                console.error("API key not found in Chrome storage.");
                return reject("API key is missing. Please set it in the extension settings.");
            }
            console.log("Successfully retrieved API key from Chrome storage.");
            resolve(result.apiKey);
        });
    });
};

// Step 2: Generate TTS Audio from OpenAI and return the audio URL
const generateTTS = async (ttsText: string, voiceOption: VoiceOption = "alloy") => {
    try {
        const apiKey = await getOpenAIKey();
        const maxChars = 1000; // Hard code to be safe to avoid hitting the API limit
        const limitedText = ttsText.slice(0, maxChars);
        console.log("Using API Key:", apiKey ? "Retrieved successfully" : "Missing");

        // Approach 1: Using fetch
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: voiceOption,
                input: limitedText,
                response_format: "mp3"
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "Failed to generate TTS.");
        }
        // Convert the response to audio blob object
        const audioBlob = await response.blob();
        return { success: true, audioBlob };

    } catch (error) {
        console.error("Error generating TTS:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
};

export default generateTTS;