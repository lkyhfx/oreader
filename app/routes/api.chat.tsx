import { createOpenAI } from '@ai-sdk/openai';
import { ActionFunction } from "@remix-run/node";
import { streamText } from 'ai';
import * as R from 'remeda';
import { prisma } from "~/services/db";
import { getDocs } from '~/services/vectorStoreService';

export const action: ActionFunction = async ({ request }) => {
    const { messages, fileName } = await request.json();

    if (messages.length === 1) {
        const context = await getDocs(messages[0].content, '/tmp/' + fileName, 10);
        messages[0].content = `
        {
            "context": ${context.map(c => c.content).join('\n\n')},
            "question": ${messages[0].content}
        }
        `
    }
    const settings = await prisma.setting.findMany();
    const settingsGrouped = R.groupBy(settings, setting => setting.type)
    const apiBaseUrl = settingsGrouped.apiBaseUrl[0].content
    const apiKey = settingsGrouped.apiKey[0].content
    const model = settingsGrouped.chatModelName[0].content

    const openai = createOpenAI({ baseURL: apiBaseUrl, apiKey: apiKey });
    const result = await streamText({
        model: openai.chat(model),
        system: `
Task: Answer the reader’s question about a book using the given context. Ensure accuracy and alignment with the book content.

Steps:

1. Understand the Question: Identify its key terms and context.
2. Retrieve Relevant Content: Locate sections in the context that address the question.
3. Generate Answer: Use relevant content to form a coherent, accurate response.
4. Verify: Ensure consistency with the book’s content.

Output:
* Provide a concise, paragraph-form answer that directly addresses the question.
* Maintain coherence and relevance to the book content.
* Pretend that the context is in your mind and don't mention it in your response.
        `,
        messages,
    });

    return result.toDataStreamResponse();
}