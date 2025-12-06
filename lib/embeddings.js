export async function generateEmbedding(text) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    try {
        const response = await fetch(`${baseUrl}/api/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'nomic-embed-text:latest',
                prompt: text,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

export async function getChatCompletion(messages) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    try {
        // We'll use a generic 'llama3' model, but this might need to be adjusted based on what the user has installed.
        // Often 'llama2' or just 'llama' might be used. 
        // Given the user's phrasing, I'll stick to a safe default or maybe 'llama3:latest'.
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2:latest',
                messages: messages,
                stream: false,
            }),
        });

        if (!response.ok) {
            // Fallback to 'llama2' if 'llama3' fails? Or just throw.
            // Let's try to be robust.
            throw new Error(`Ollama Chat API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error getting chat completion:', error);
        throw error;
    }
}
