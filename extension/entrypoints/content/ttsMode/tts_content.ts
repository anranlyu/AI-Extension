import { isProbablyReaderable, Readability } from "@mozilla/readability";
import '../../content/content.css';

/**
 * Maximum text length for TTS to prevent hitting API limits
 * Set to 0 to disable the limit
 */
const MAX_TTS_LENGTH = 0;

// State tracking
let currentAudio: HTMLAudioElement | null = null;
let isProcessing = false;

/**
 * Checks if the current page is readable using Mozilla's Readability
 * @returns boolean indicating if the page is likely readable
 */
const isPageReadable = () => isProbablyReaderable(document);

/**
 * Extracts readable content from the page
 * @returns Object containing title, content, and author or null if extraction fails
 */
const extractReadableContent = () => {
    try {
        if (!isPageReadable()) {
            console.warn("This page is not suitable for TTS.");
            return null;
        }

        const article = new Readability(document.cloneNode(true) as Document).parse();
        if (!article) {
            console.warn("Could not parse article content");
            return null;
        }

        const container = document.createElement("div");
        container.style.cssText =
            "position: absolute; left: -9999px; top: -9999px; visibility: hidden; display: block;";
        container.innerHTML = article.content;
        document.body.appendChild(container);

        // Clean up content by removing non-essential elements
        const selectorsToRemove = [
            "header", "nav", "footer", "style", "script", 
            "iframe", "object", "embed", "noscript", "aside"
        ];
        
        container.querySelectorAll(selectorsToRemove.join(",")).forEach((el) => el.remove());

        // Remove invisible elements
        container.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            if (rect.width === 0 || rect.height === 0 || computedStyle.display === "none") {
                el.remove();
            }
        });

        const plainText = container.innerText || container.textContent || "";
        document.body.removeChild(container);

        return {
            title: article.title || "",
            content: plainText.trim(),
            author: article.byline || ""
        };
    } catch (error) {
        console.error("Error extracting article content:", error);
        return null;
    }
};

/**
 * Sends a TTS request to the background script
 * @param textToRead Text to convert to speech
 * @returns Promise with the TTS response
 */
const requestTTS = async (textToRead: string): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
}> => {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "tts_request",
            text: textToRead,
        });
        
        if (!response || !response.success) {
            return {
                success: false,
                error: response?.error || "No response from background script"
            };
        }
        return response;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};

/**
 * Enables Text-to-Speech mode by extracting readable content and requesting TTS
 */
export const enableTTSMode = async () => {
    // Prevent multiple simultaneous TTS requests
    if (isProcessing) {
        return;
    }
    
    isProcessing = true;

    try {
        // Extract and prepare content
        const extractedData = extractReadableContent();
        if (!extractedData) {
            throw new Error("No readable content found");
        }

        // Combine title, author, and content
        const textParts = [
            extractedData.title, 
            extractedData.author, 
            extractedData.content
        ]
        .map(text => text.trim())
        .filter(text => text.length > 0);

        if (textParts.length === 0) {
            throw new Error("No valid text to read");
        }

        // Prepare the text for TTS
        let textToRead = textParts.join(" ");
        if (MAX_TTS_LENGTH > 0 && textToRead.length > MAX_TTS_LENGTH) {
            textToRead = textToRead.substring(0, MAX_TTS_LENGTH) + "...";
        }

        // Request TTS from background script
        const ttsResponse = await requestTTS(textToRead);
        if (!ttsResponse.success) {
            throw new Error(ttsResponse.error || "TTS request failed");
        }

        // Handle audio playback
        if (currentAudio) {
            currentAudio.pause();
        }
        
        const audio = new Audio(ttsResponse.audioUrl);
        currentAudio = audio;
        
        try {
            await currentAudio.play();
        } catch (err) {
            // Handle autoplay blocking
            if (err instanceof Error && err.name === 'NotAllowedError') {
                document.body.addEventListener(
                    "click",
                    function playAfterInteraction() {
                        currentAudio?.play().then(() => {
                            document.body.removeEventListener("click", playAfterInteraction);
                        });
                    },
                    { once: true }
                );
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error("TTS error:", error);
    } finally {
        isProcessing = false;
    }
};

/**
 * Stops TTS playback and resets state
 */
export const stopRead = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};

