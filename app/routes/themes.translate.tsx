import { ActionFunction, json } from "@remix-run/node";
import { prisma } from "~/services/db";


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const fileName = formData.get('fileName') as string;
    const translateActive = formData.get('translateActive') as string;
    const theme = await prisma.theme.findFirst({
        where: {
            book: {
                fileName
            }
        }
    })
    if (theme) {
        await prisma.theme.update({
            where: {
                id: theme.id
            },
            data: {
                translateActive: translateActive === 'true'
            }
        })

        return json({ translateActive: translateActive })
    } else {
        await prisma.theme.create({
            data: {
                book: { connect: { fileName } },
                css: '',
                translateActive: translateActive === 'true'
            }
        })
        return json({ translateActive: translateActive })
    }
}