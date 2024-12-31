import { ActionFunction, json } from "@remix-run/node";
import * as R from 'remeda';
import { prisma } from "~/services/db";


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const fileName = formData.get('fileName') as string;
    const css = formData.get('css') as string;
    const theme = await prisma.theme.findFirst({
        where: {
            book: {
                fileName
            }
        }
    })
    if (theme) {
        const parsedCss = theme.css ? JSON.parse(theme.css) : {}
        const mergedCss = R.mergeDeep(parsedCss, JSON.parse(css))
        await prisma.theme.update({
            where: {
                id: theme.id
            },
            data: {
                css: JSON.stringify(mergedCss)
            }
        })

        return json({ css: mergedCss })
    } else {
        await prisma.theme.create({
            data: {
                book: { connect: { fileName } },
                css: css
            }
        })
        return json({ css: css })
    }
}