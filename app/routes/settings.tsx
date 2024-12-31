import { ActionFunctionArgs, json } from "@remix-run/node";

import { prisma } from "~/services/db";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const { apiKey, apiBaseUrl, chatModelName, embedModelName } = data;
    await prisma.setting.updateMany({
        where: { type: 'apiKey' },
        data: { content: apiKey.toString() }
    });
    await prisma.setting.updateMany({
        where: { type: 'apiBaseUrl' },
        data: { content: apiBaseUrl.toString() }
    });
    await prisma.setting.updateMany({
        where: { type: 'chatModelName' },
        data: { content: chatModelName.toString() }
    });
    await prisma.setting.updateMany({
        where: { type: 'embedModelName' },
        data: { content: embedModelName.toString() }
    });
    return json({ success: true });
}
