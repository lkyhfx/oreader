// app/routes/api/translate.ts
import { createOpenAI } from '@ai-sdk/openai';
import { json } from "@remix-run/node";
import { generateText } from 'ai';
import pLimit from 'p-limit';
import SparkMD5 from 'spark-md5';
import { createTranslation, getTranslation } from '~/services/db';

const limit = pLimit(10);
const translateText = async (text: string, translatePrompt: string, apiKey: string, apiBaseUrl: string, chatModelName: string) => {
  const openai = createOpenAI({ baseURL: apiBaseUrl, apiKey: apiKey });
  const hashId = SparkMD5.hash(text);

  // Check if the translation already exists in the database
  const existingTranslation = await getTranslation(hashId);
  if (existingTranslation) {
    return existingTranslation.text;
  }

  return limit(async () => {

    // Translate the text using the AI model
    const response = (await generateText({
      model: openai(chatModelName),
      system: translatePrompt,
      prompt: text,
      maxRetries: 5
    }));
    const translation = response.text;

    // Save the new translation to the database
    await createTranslation(hashId, translation);
    return translation;
  }
  )

};

// export const loader = async () => {
//   const settings = await prisma.setting.findMany({
//     where: {
//       type: {
//         in: ['apiKey', 'apiBaseUrl', 'chatModelName']
//       }
//     }
//   });

//   const settingsGrouped = R.groupBy(settings, setting => setting.type)

//   return json({ apiKey: settingsGrouped.apiKey[0].content, apiBaseUrl: settingsGrouped.apiBaseUrl[0].content,
//      chatModelName: settingsGrouped.chatModelName[0].content });
// };

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

    if (!text || !prompt) {
      return json({ error: "Text and prompt parameters are required" }, { status: 400 });
    }

    const translation = await translateText(text, prompt, apiKey, apiBaseUrl, chatModelName);
    return json({ translation });
  } catch (error) {
    return json({ error: "Translation failed" + error }, { status: 500 });
  }
}