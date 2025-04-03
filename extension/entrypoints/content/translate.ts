import { showFloatingUI } from "./Floating/contentFloating";
import { createReferenceFromSelection } from "./utilities";

export function showFloatingOverlay(translatedText: string) {
  try {
    console.log("Showing floating overlay with draggable content");
    const referenceEl = createReferenceFromSelection();
    if (!referenceEl) {
      console.warn("No valid selection for tooltip positioning");
      return;
    }
    
    showFloatingUI(translatedText, {
      draggable: true,
      preserveReference: true
    });
  } catch (error) {
    console.error("Error showing floating overlay:", error);
  }
}
