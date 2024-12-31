import { createClient } from "@libsql/client";
import { embedMany, embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Document } from 'langchain/document';
import { prisma } from "~/services/db";
import * as R from 'remeda';

async function initSqlite() {
    const client = createClient({
        url: process.env.DATABASE_URL as string,
    });

    await client.execute({
        sql: `
    CREATE TABLE IF NOT EXISTS book_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    metadata TEXT,
    embedding F32_BLOB(1024)
    );
    `,
        args: [],
    });

    return client;
}


export let sqlClient: any;
(async () => {
  sqlClient = await initSqlite();
})().catch(console.error);

export async function saveDocs(docs: Document[], baseURL: string, apiKey: string) {
    const openai = createOpenAI({ baseURL: baseURL, apiKey: apiKey });
    const embeddingsModel = openai.embedding("text-embedding-v3");

    // process 6 docs at a time
    const batchSize = 6;
    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const embeddings = await embedMany({
            model: embeddingsModel,
            values: batch.map(doc => doc.pageContent),
        });
        // @ts-ignore
        const sqlStatements = [];
        for (let j = 0; j < batch.length; j++) {
            sqlStatements.push({
                sql: `INSERT INTO book_embeddings (content, metadata, embedding) VALUES (?, ?, vector(?))`,
                args: [batch[j].pageContent, JSON.stringify(batch[j].metadata), JSON.stringify(embeddings.embeddings[j])]
            });
        }

        sqlClient.batch(sqlStatements);
    }
}

export async function getDocs(text: string, fileName: string, topK: number) {
    const settings = await prisma.setting.findMany();
    const settingsGrouped = R.groupBy(settings, setting => setting.type)
    const apiBaseUrl = settingsGrouped.apiBaseUrl[0].content
    const apiKey = settingsGrouped.apiKey[0].content
    const embeddingsModel = createOpenAI({ baseURL: apiBaseUrl, apiKey: apiKey }).embedding("text-embedding-v3");
    const response = await embed({
        model: embeddingsModel,
        value: text
    });

    const results = await sqlClient.execute({
        sql: `SELECT * FROM book_embeddings WHERE JSON_EXTRACT(metadata, '$.source') = ? ORDER BY vector_distance_cos(embedding, ?) limit ?`,
        args: [fileName, JSON.stringify(response.embedding), topK]
    });

    return results.rows.map((row: any) => ({ content: row.content as string}));
}