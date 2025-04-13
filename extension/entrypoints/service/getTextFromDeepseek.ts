interface props {
    prompt: string,
    text: string,
    model?: string
}

const getTextFromDeepseek = async ({ prompt, text, model = "deepseek-chat" }: props) => {
    try {
        // Get the backend URL from the environment or use a default
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
        
        // Call our backend API instead of DeepSeek directly
        const response = await fetch(`${backendUrl}/api/deepseek`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, text, model })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Backend API error: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data.content || "got nothing from deepseek";
    } catch (error) {
        console.error('Error calling backend service:', error);
        return `Error processing text: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

export default getTextFromDeepseek;