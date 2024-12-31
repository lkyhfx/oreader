// /app/routes/bookManage.tsx
import { LocalFileStorage } from '@mjackson/file-storage/local';
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser';
import { ActionFunction, json } from "@remix-run/node";
import * as R from 'remeda';
import { prisma } from "~/services/db";
import { consumeEpub, extractEpubMetadataFromBuffer } from "~/services/epubServices";
import { saveDocs } from "~/services/vectorStoreService";

const bookStorage = new LocalFileStorage('./books');


export const action: ActionFunction = async ({ request }) => {
    // however you authenticate users
    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === 'book') {
            await bookStorage.set(fileUpload.name, fileUpload);

            return bookStorage.get(fileUpload.name);
        }
    }
    const formData = await parseFormData(request, uploadHandler)
    const file = formData.get('book') as File
    const buffer = Buffer.from(await file.arrayBuffer())
    const { title, author, coverImgBase64 } = await extractEpubMetadataFromBuffer(buffer)
    // const epubObj = await parseEpub(buffer)
    // let base64String = ''
    // if (epubObj.sections !== undefined) {
    //     for (const sec of epubObj.sections.slice(0, 10)) {
    //         if (sec.toHtmlObjects) {
    //             const htmls = sec.toHtmlObjects()
    //             const imgSrc = findFirstImgSrc(htmls)
    //             if (imgSrc) {
    //                 base64String = imgSrc
    //                 break
    //             }
    //         }
    //     }
    // }
    try {
        const book = await prisma.book.create({
            data: {
                title: title,
            author: author,
                coverBase64: coverImgBase64,
                fileName: file?.name,
            }
        })
    } catch (e) {
        return json({ error: 'Create book failed' })
    }


    const docs = await consumeEpub(file)
    const settings = await prisma.setting.findMany()
    const settingsGrouped = R.groupBy(settings, setting => setting.type)
    const apiBaseUrl = settingsGrouped.apiBaseUrl[0].content
    const apiKey = settingsGrouped.apiKey[0].content
    await saveDocs(docs, apiBaseUrl, apiKey)

    return json({ success: true, fileName: file?.name })
};


// export default function UploadPage() {
//     const actionData = useActionData<typeof action>();

//     return (
//         <div>
//             <h1>Upload File</h1>
//             <Form method="post" encType="multipart/form-data">
//                 <label>
//                     Choose a file:
//                     <input type="file" name="file" />
//                 </label>
//                 <button type="submit">Upload</button>
//             </Form>
//             {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
//             {actionData?.success && <p>File "{actionData.fileName}" uploaded successfully!</p>}
//         </div>
//     );
// }

