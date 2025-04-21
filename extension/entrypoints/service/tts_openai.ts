type VoiceOption = "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer";


const generateTTS = async (ttsText: string, voiceOption: VoiceOption = "alloy") => {
    try {

        const maxChars = 4000; // OpenAI TTS character limit
        const limitedText = ttsText.slice(0, maxChars);

        // Get the backend URL from the environment or use a default
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

        // Send the request to our Backend API
        console.log(`Sending TTS request to backend: ${backendUrl}/api/tts`);
        const response = await fetch(`${backendUrl}/api/tts`, {
            method: "POST",
            headers: {
                // "Authorization": `Bearer ${apiKey}`, // Handled by backend
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // model: "tts-1", // Handled by backend
                voice: voiceOption,
                input: limitedText,
                // response_format: "mp3" // Handled by backend
            })
        });

        if (!response.ok) {
            // Attempt to parse error JSON from backend, otherwise use status text
            let errorMessage = `Backend TTS error: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.details || errorMessage;
            } catch (e) {
                // Ignore JSON parsing error if response body is not JSON
            }
            throw new Error(errorMessage);
        }

        // Convert the response to audio blob object
        const audioBlob = await response.blob();
        console.log("TTS audio received from backend:", audioBlob);
        return { success: true, audioBlob: audioBlob };

    } catch (error) {
        console.error("Error generating TTS via backend:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
};

export default generateTTS;