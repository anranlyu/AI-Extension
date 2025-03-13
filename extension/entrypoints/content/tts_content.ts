import { isProbablyReaderable, Readability } from "@mozilla/readability";

const MAX_TTS_LENGTH = 2000;
let currentAudio: HTMLAudioElement | null = null;
let isProcessing = false;

// Check if the page is readable using Mozilla's Readability
const isPageReadable = () => isProbablyReaderable(document);

// Extract readable content from the page
const extractReadableContent = () => {
    if (!isPageReadable()) {
        console.warn("This page is not suitable for Read Mode.");
        return null;
    }

    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (!article) return null;

    const container = document.createElement("div");
    container.style.cssText =
        "position: absolute; left: -9999px; top: -9999px; visibility: hidden; display: block;";
    container.innerHTML = article.content;
    document.body.appendChild(container);

    // Remove unwanted elements
    const selectorsToRemove = [
        "header",
        "nav",
        "footer",
        "style",
        "script",
        "iframe",
        "object",
        "embed",
        "noscript",
        "aside",
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
        author: article.byline || "",
    };
};

/**
 * Sends a TTS request (Manifest V3).
 * In MV3, `chrome.runtime.sendMessage` returns a Promise
 * if no callback is provided.
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
            console.error("TTS request failed: No valid response received.", response);
            return {
                success: false,
                error: response?.error || "No response from background script.",
            };
        }
        return response;
    } catch (error) {
        console.error("TTS request failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

/**
 * Extracts readable text from the page and sends it for TTS.
 */
export const enableTTSMode = async () => {
    if (isProcessing) {
        console.warn("TTS request is already in progress.");
        return;
    }
    isProcessing = true;

    const extractedData = extractReadableContent();
    console.log("Extracted data:", extractedData);

    if (!extractedData) {
        console.warn("No readable content found.");
        isProcessing = false;
        return;
    }

    const textParts = [extractedData.title, extractedData.author, extractedData.content]
        .map((text) => text.trim())
        .filter((text) => text.length > 0);

    if (textParts.length === 0) {
        console.warn("No valid text to read.");
        isProcessing = false;
        return;
    }

    let textToRead = textParts.join(" ");
    if (textToRead.length > MAX_TTS_LENGTH) {
        console.warn(`Text is too long (${textToRead.length} characters), truncating.`);
        textToRead = textToRead.substring(0, MAX_TTS_LENGTH) + "...";
    }

    try {
        const ttsResponse = await requestTTS(textToRead);
        console.log("Received response in content script:", ttsResponse);

        if (ttsResponse?.success && ttsResponse.audioUrl) {
            console.log("Received TTS audio URL:", ttsResponse.audioUrl);
            playAudio();
        } else {
            console.error("TTS request failed:", ttsResponse?.error || "Unknown error");
        }
    } catch (error) {
        console.error("TTS request error:", error);
    } finally {
        isProcessing = false;
    }
};

/**
 * Plays the stored TTS audio by retrieving it from Chrome Storage.
 */
const playAudio = () => {
    chrome.storage.local.get("ttsAudio", (result) => {
        if (chrome.runtime.lastError || !result.ttsAudio) {
            console.error(
                "No stored TTS audio found:",
                chrome.runtime.lastError?.message || "No audio available."
            );
            return;
        }

        console.log("Retrieved stored TTS audio.");
        const audio = new Audio(result.ttsAudio);
        audio.play().catch((err) => {
            console.warn("Autoplay blocked:", err.message);
            document.body.addEventListener(
                "click",
                function playAfterInteraction() {
                    audio
                        .play()
                        .then(() => {
                            console.log("Audio is now playing.");
                            document.body.removeEventListener("click", playAfterInteraction);
                        })
                        .catch(console.error);
                },
                { once: true }
            );
        });
    });
};

/**
 * Stops TTS playback and resets state.
 */
export const stopRead = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
        console.log("TTS playback stopped.");
    }
    chrome.storage.local.set({ TTSenabled: false });
};
