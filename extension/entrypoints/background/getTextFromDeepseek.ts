interface props {
    prompt: string,
    text: string,
    model?: string
}

const getTextFromDeepseek = async ({ prompt, text, model = "deepseek-chat" }: props) => {
    // Get the backend URL from the environment or use a default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Call our backend
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
}

export default getTextFromDeepseek;