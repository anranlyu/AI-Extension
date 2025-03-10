// This is a script to handle open tts api
// import { OpenAI } from "openai";

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

// Step 3: Generate TTS Audio from OpenAI and return the URL
const generateTTS = async (ttsText: string, voiceOption: VoiceOption = "alloy") => {
    try {
        const apiKey = await getOpenAIKey();
        console.log("Using API Key:", apiKey ? "Retrieved successfully" : "Missing");

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: voiceOption,
                input: ttsText,
                response_format: "mp3"
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "Failed to generate TTS.");
        }

        const audioBlob = await response.blob();

        const audioFile = new File([audioBlob], "tts_audio.mp3", { type: "audio/mpeg" });
        const fileReader = new FileReader();

        return new Promise<{ success: boolean; audioUrl?: string; error?: string }>((resolve) => {
            fileReader.onloadend = () => {
                const base64Audio = fileReader.result as string;
                chrome.storage.local.set({ ttsAudio: base64Audio }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Failed to store audio in Chrome storage:", chrome.runtime.lastError.message);
                        resolve({ success: false, error: "Failed to store audio." });
                    } else {
                        console.log("Stored TTS audio in Chrome storage.");
                        resolve({ success: true, audioUrl: "chrome.storage://ttsAudio" });
                    }
                });
            };
            fileReader.readAsDataURL(audioFile);
        });

    } catch (error) {
        console.error("Error generating TTS:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
};

export default generateTTS;
