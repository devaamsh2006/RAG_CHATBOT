import { NextResponse } from 'next/server';
import { generateEmbedding, getChatCompletion } from '@/lib/embeddings';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { message, messages: history, chatId } = await request.json();

        // Save User Message
        if (chatId) {
            await supabase.from('messages').insert({
                chat_id: chatId,
                role: 'user',
                content: message
            });
        }

        // 1. Generate Embedding for the query
        const embedding = await generateEmbedding(message);

        // 2. Search Supabase for relevant documents
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 5
        });

        if (error) {
            console.error('Supabase search error:', error);
            throw new Error('Failed to search documents');
        }

        // 3. Construct Context
        const contextText = documents
            .map(doc => doc.content)
            .join('\n\n---\n\n');

        const systemMessage = `
You are a helpful AI assistant that formats responses cleanly.

📌 RULES:
- Always use bullet points, headings, and separation for readability.
- Highlight technologies, roles, skills, and achievements in **bold**.
- If listing items, use numbered or bullet lists.
- Include a short summary if the content is long.
- If answer is not in documents, say: "I don't have that information in your uploaded documents."

📄 CONTEXT (use only this information):
${contextText}
`;


        // 4. Call Ollama for Chat Completion
        // Construct messages array for Ollama
        const chatMessages = [
            { role: 'system', content: systemMessage },
            ...(history || []).map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: message }
        ];

        const responseMessage = await getChatCompletion(chatMessages);

        let chatTitle = null;

        // Generate Title if it's the first USER message (history might contain greetings)
        const hasUserHistory = history && history.some(msg => msg.role === 'user');

        if (chatId && !hasUserHistory) {
            try {
                const titlePrompt = [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Generate a short, concise title (max 5 words) for this chat based on the initial user message: "${message}". Return ONLY the title, no quotes or other text.` }
                ];
                const titleResponse = await getChatCompletion(titlePrompt);
                chatTitle = titleResponse.content.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present

                if (chatTitle) {
                    await supabase
                        .from('chats')
                        .update({ title: chatTitle })
                        .eq('id', chatId);
                }
            } catch (err) {
                console.error("Failed to generate title:", err);
            }
        }

        // Save AI Message
        if (chatId) {
            await supabase.from('messages').insert({
                chat_id: chatId,
                role: 'assistant',
                content: responseMessage.content
            });
        }

        return NextResponse.json({ ...responseMessage, chatTitle });
    } catch (error) {
        console.error('Chat processing error:', error);
        return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
    }
}
