export const readPage = () => {
    // Find the first <h1> element
    const headline = document.querySelector('h1');

    if (!headline) {
        console.warn('No <h1> element found. Reading the entire page.');
        startTTS(document.body.innerText.trim());
        return;
    }

    // Get all text starting from the <h1> element
    const content = headline.innerText + ' ' + getFollowingText(headline);
    const textToRead = content.trim();

    if (!textToRead) {
        console.warn('No readable content found starting from the <h1>.');
        return;
    }

    console.log(`Starting TTS for: ${textToRead}`);
    startTTS(textToRead);
};

// Helper function to get text from all elements following the <h1>
const getFollowingText = (element: Element): string => {
    let text = '';
    let currentElement = element.nextElementSibling;

    while (currentElement) {
        // Add only text-based elements
        if ((currentElement as HTMLElement).innerText) {
            text += ' ' + (currentElement as HTMLElement).innerText;
        }

        currentElement = currentElement.nextElementSibling;
    }

    return text;
};

// Helper function to handle TTS logic
const startTTS = (text: string) => {
    speechSynthesis.cancel(); // Cancel any ongoing speech before starting

    const MAX_CHUNK_LENGTH = 200;
    const chunks = text.match(new RegExp(`.{1,${MAX_CHUNK_LENGTH}}`, 'g')) || [];

    const speakChunks = (index = 0) => {
        if (index >= chunks.length) return;

        const utterance = new SpeechSynthesisUtterance(chunks[index]);

        // Ensure voices are loaded
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            console.warn("No voices available. Waiting for voices to load...");
            speechSynthesis.onvoiceschanged = () => speakChunks(index); // Retry once voices load
            return;
        }

        // Set a default English voice (or any other language you prefer)
        utterance.voice = voices.find((voice) => voice.lang === 'en-US') || voices[0];

        utterance.rate = 1; // Normal rate
        utterance.pitch = 1; // Normal pitch
        utterance.volume = 1; // Full volume

        utterance.onend = () => speakChunks(index + 1); // Read the next chunk after finishing
        speechSynthesis.speak(utterance); // Start speaking
    };

    console.log(`Starting TTS for ${chunks.length} chunks`);
    speakChunks();
};


// Stop TTS Function
export const stopRead = () => {
    speechSynthesis.cancel();
    console.log('TTS stopped.');
};
