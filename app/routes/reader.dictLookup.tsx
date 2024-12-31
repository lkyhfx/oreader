// app/routes/reader.dictLookup.tsx
import { createOpenAI } from '@ai-sdk/openai';
import { json } from "@remix-run/node";
import { streamText } from 'ai';
import SparkMD5 from 'spark-md5';
import { Readable } from 'stream';
import { getDictLookup } from '~/services/db';

const dictLookup = async (text: string, context: string, dictionaryPrompt: string, apiKey: string, apiBaseUrl: string, chatModelName: string) => {
    const openai = createOpenAI({ baseURL: apiBaseUrl, apiKey: apiKey });
    const hashId = SparkMD5.hash(text);

    // Check if the translation already exists in the database
    const existingDictLookup = await getDictLookup(hashId);
    if (existingDictLookup) {
        // Convert existing text to a stream
        const textStream = new Readable();
        textStream.push(existingDictLookup.text);
        textStream.push(null); // Signal the end of the stream
        return textStream;
    }

    // Translate the text using the AI model and return the stream
    const responseStream = await streamText({
        model: openai(chatModelName),
        system: dictionaryPrompt,
        prompt: JSON.stringify({ context, word_or_phrase: text }),
        maxRetries: 5
    });

    // Return the response stream directly
    return responseStream.textStream;
};


export async function action({ request }: { request: Request }) {
    if (request.method !== 'POST') {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const text = body.text;
        const prompt = body.prompt;
        const apiKey = body.apiKey;
        const apiBaseUrl = body.apiBaseUrl;
        const chatModelName = body.chatModelName;
        const context = body.context;

        if (!text || !prompt) {
            return json({ error: "Text and prompt parameters are required" }, { status: 400 });
        }

        const stream = await dictLookup(text, context, prompt, apiKey, apiBaseUrl, chatModelName);
        // @ts-ignore
        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        return json({ error: "Lookup failed" + error }, { status: 500 });
    }
}