import { json, LoaderFunction } from "@remix-run/node";
import { LocalFileStorage } from '@mjackson/file-storage/local';

const bookStorage = new LocalFileStorage('./books');

export const loader: LoaderFunction = async ({ params }) => {
    const { fileName } = params;

    if (!fileName) {
        throw new Response("Filename is required", { status: 400 });
    }

    const file = await bookStorage.get(fileName)
    if (file === null) {
        return new Response("File not found", { status: 404 });
    }


    return new Response(file, {
        headers: {
            "Content-Type": file.type,
            "Content-Disposition": `attachment; filename="${fileName}"`,
        },
    });
};

