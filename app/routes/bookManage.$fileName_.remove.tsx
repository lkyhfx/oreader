import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/services/db";
import { sqlClient } from "~/services/vectorStoreService";

export async function loader({ params }: LoaderFunctionArgs) {
    const { fileName } = params
    await prisma.book.delete({
        where: {
            fileName
        }
    })
    await sqlClient.execute({
        sql: `DELETE FROM book_embeddings WHERE JSON_EXTRACT(metadata, '$.source') = ?`,
        args: ['/tmp/' + fileName!]
    });
    return redirect('/')
}
