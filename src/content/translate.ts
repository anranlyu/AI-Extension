import { getSelectedText } from "./textSelection";

let translationEnabled = false;
let currentTargetLanguage = ''; 

// initial state from the background
chrome.runtime.sendMessage({ type: "get_initial_state" }, (response) => {
  if (typeof response?.translateEnabled === "boolean") {
    translationEnabled = response.translateEnabled;
  }
  if (response?.targetLanguage) {
    currentTargetLanguage = response.targetLanguage;
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.targetLanguage) {
    currentTargetLanguage = changes.targetLanguage.newValue;
    console.log("Target language updated:", currentTargetLanguage);
  }
});

export const initTranslation = () => {
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === "update_translate_mode") {
      translationEnabled = message.translateEnabled;
      console.log("Translation is now enabled", translationEnabled ? "ON" : "OFF");
    } else if (message.type === "translated_text" && message.text) {
      // showTranslatedOverlay(message.translatedText);
    } else if (message.type === "update_target_language") {
      currentTargetLanguage = message.targetLanguage;
      console.log("Updated target language:", currentTargetLanguage);
    }
  });

};


export function showTranslatedOverlay(translatedText: string) {
  let overlay = document.getElementById("translate-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "translate-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "10%";
    overlay.style.left = "50%";
    overlay.style.transform = "translateX(-50%)";
    overlay.style.background = "rgba(255, 255, 255, 0.95)";
    overlay.style.color = "#333"; 
    overlay.style.padding = "1.5rem";
    overlay.style.border = "1px solid #ccc";
    overlay.style.borderRadius = "8px";
    overlay.style.zIndex = "99999";
    overlay.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
    overlay.style.fontSize = "16px";
    overlay.style.lineHeight = "1.5";

    // Add a close button.
    const closeButton = document.createElement("button");
    closeButton.textContent = "✕";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.background = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "18px";
    closeButton.style.color = "#666";
    closeButton.onmouseover = () => { closeButton.style.color = "#000"; };
    closeButton.onmouseout = () => { closeButton.style.color = "#666"; };
    closeButton.onclick = () => overlay?.remove();
    overlay.appendChild(closeButton);

    // Container for the translated text.
    const textContainer = document.createElement("div");
    textContainer.id = "translated_text";
    textContainer.style.marginTop = "10px";
    textContainer.style.fontWeight = "400";
    overlay.appendChild(textContainer);

    document.body.appendChild(overlay);
  }

  // Update the content of the translated text container.
  const textContainer = document.getElementById("translated_text");
  if (textContainer) {
    textContainer.textContent = translatedText;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTranslation);
} else {
initTranslation();
}

