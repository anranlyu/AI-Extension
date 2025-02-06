import React from 'react';

export let translateModeEnabled = false;

export function enableTranslateMode() {
  translateModeEnabled = true;
  // Possibly add a click listener for a “Translate” button or set up a small UI
}

export function disableTranslateMode() {
  translateModeEnabled = false;
  // Remove/hide any translation popups or overlays
}

/**
 * Called after the user highlights text and clicks "Translate"
 */
export function displayTranslation(translatedText: string, originalRange: Range) {
  // Insert a tooltip/bubble near the original text selection
  // or create an overlay with the translated text
}
