import { getSelectedText } from "./textSelection";

let translationEnabled = false;
let currentTargetLanguage = 'es'; // default value

// initial state from the background
chrome.runtime.sendMessage({ type: "get_initial_state" }, (response) => {
  if (typeof response?.translateEnabled === "boolean") {
    translationEnabled = response.translateEnabled;
  }
  if (response?.targetLanguage) {
    currentTargetLanguage = response.targetLanguage;
  }
});

export const initTranslation = () => {
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === "update_translate_mode") {
      translationEnabled = message.translateEnabled;
      console.log("Translation is now enabled", translationEnabled ? "ON" : "OFF");
    } else if (message.type === "translated_text") {
      showTranslatedOverlay(message.translatedText);
    } else if (message.type === "update_target_language") {
      // Optionally listen for an update message for target language.
      currentTargetLanguage = message.targetLanguage;
      console.log("Updated target language:", currentTargetLanguage);
    }
  });

  document.addEventListener("mouseup", () => {
    const selectedText = getSelectedText();
    if (selectedText) {
      console.log("Selected text for translation:", selectedText);
      if (translationEnabled) {
        const isSentence = selectedText.trim().split(/\s+/).length > 1;
        // Use the currentTargetLanguage variable rather than a hardcoded value.
        chrome.runtime.sendMessage(
          {
            type: "translate_text",
            text: selectedText,
            targetLang: currentTargetLanguage, // use user-selected target language
            isSentence, // Pass the flag so the background can choose the correct API; sentences -> gpt, words -> dictionary API
          },
          (response) => {
            if (response?.translatedText) {
              showTranslatedOverlay(response.translatedText);
            } else if (response?.error) {
              console.error("Translation error:", response.error);
            }
          }
        );
      }
    }
  });
};


function showTranslatedOverlay(translatedText: string) {
  let overlay = document.getElementById("translate-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "translate-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "10%";
    overlay.style.left = "50%";
    overlay.style.transform = "translateX(-50%)";
    overlay.style.background = "rgba(255, 255, 255, 0.95)";
    overlay.style.padding = "1rem";
    overlay.style.border = "1px solid #ccc";
    overlay.style.borderRadius = "8px";
    overlay.style.zIndex = "99999";
    overlay.style.maxWidth = "80%";
    overlay.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";

    // Add a close button.
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.marginBottom = "0.5rem";
    closeButton.onclick = () => overlay?.remove();
    overlay.appendChild(closeButton);

    // Container for the translated text.
    const textContainer = document.createElement("div");
    textContainer.id = "translated-text";
    overlay.appendChild(textContainer);

    document.body.appendChild(overlay);
  }

  // Update the content of the translated text container.
  const textContainer = document.getElementById("translated_text");
  if (textContainer) {
    textContainer.textContent = translatedText;
  }
}

// Immediately initialize translation functionality.
initTranslation();
