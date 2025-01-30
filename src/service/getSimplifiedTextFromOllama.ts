const getSummaryFromOllama = async (message: string): Promise<string> => {
  try {

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b", // Replace with your model name
        prompt: `Summarize the following content from the webpage:${message} `,
        stream: false,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status:${response.status}`);
    }

    const json = await response.json();
    return json.response;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message); // Access error.message safely
    } else {
      throw new Error('An unknown error occurred');
    }
  }

}

export default getSummaryFromOllama;