import { showTooltip } from "./Floating/renderFloating";
import { createReferenceFromSelection } from "./utilities";

export function showFloatingOverlay(translatedText: string) {
  try {
    const referenceEl = createReferenceFromSelection();
    if (!referenceEl) {
      console.warn("No valid selection for tooltip positioning");
      return;
    }
    
    showTooltip({
      content: translatedText,
      referenceElement: referenceEl,
    });
  } catch (error) {
    console.error("Error showing floating overlay:", error);
  }
}
