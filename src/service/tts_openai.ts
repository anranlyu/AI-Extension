// This is a script to handle open tts api

import { OpenAI } from "openai";

type VoiceOption = "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer";
const voiceOption: VoiceOption = "alloy";

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

// Step 3: Generate TTS Audio from OpenAI and return the URL
const generateTTS = async (openai: OpenAI, voiceOption: VoiceOption = "alloy", ttsText: string) => {
    try {
        console.log("Sending request to OpenAI to generate TTS audio");
        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: voiceOption,
            input: ttsText,
            response_format: "opus"
        });
        if (!response) {
            throw new Error("No audio response from OpenAI");
        }
        console.log("Successfully retrieved audio response from OpenAI");

        // Get the readable stream from the response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to get readable stream from response");

        // Create a MediaSource for real-time streaming
        const mediaSource = new MediaSource();
        const audio = new Audio();
        audio.src = URL.createObjectURL(mediaSource);
        audio.play();

        // When MediaSource is ready, process chunks of data
        mediaSource.addEventListener("sourceopen", async () => {
            const sourceBuffer = mediaSource.addSourceBuffer("audio/ogg; codecs=opus");
            console.log("MediaSource is open. Appending audio chunks...");

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    mediaSource.endOfStream();
                    console.log("Audio streaming completed.");
                    break;
                }
                sourceBuffer.appendBuffer(value);
            }
        });
    } catch (error) {
        console.error("Error generating streaming audio:", error);
    }
};

InitializeOpenAI().then((openai) => {
    if (openai) {
        console.log("Ready to use OpenAI!");
        generateTTS(openai, voiceOption, "Hello, this is a test text.");
    }
});

export default InitializeOpenAI;