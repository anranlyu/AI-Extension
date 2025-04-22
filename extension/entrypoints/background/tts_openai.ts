import { VoiceOption } from "../service/type";


const generateTTS = async (
  ttsText: string,
  voiceOption: VoiceOption
) => {
    console.log("Generating TTS with voice:", voiceOption);
  try {
    const maxChars = 1000; // OpenAI TTS character limit
    const limitedText = ttsText.slice(0, maxChars);

    // You can allow a fallback to process.env.BACKEND_URL if configured
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

    console.log(`Sending TTS request to backend with voice: ${voiceOption}`);

    const response = await fetch(`${backendUrl}/api/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        voice: voiceOption,
        input: limitedText
      })
    });

    if (!response.ok) {
      let errorMessage = `Backend TTS error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('TTS Error Details:', errorData);
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch {
        // Fail silently if response isn't JSON
      }
      throw new Error(errorMessage);
    }

    const audioBlob = await response.blob();
    console.log("TTS audio received from backend:", audioBlob);

    return {
      success: true,
      audioBlob
    };
  } catch (error) {
    console.error("Error generating TTS via backend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export default generateTTS;
