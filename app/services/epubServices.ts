import AdmZip from 'adm-zip';
import fs from 'fs';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { EPubLoader } from "@langchain/community/document_loaders/fs/epub";
import { tmpdir } from 'os';
import path from 'path';
import xml2js from 'xml2js';

export function extractEpubMetadataFromBuffer(epubBuffer: Buffer): Promise<{ title: string; author: string; coverImgBase64: string }> {
  return new Promise((resolve, reject) => {
    const zip = new AdmZip(epubBuffer);
    const files = zip.getEntries();

    let opfPath = '';

    // Find the container.xml file to locate the OPF file
    files.forEach(file => {
      if (file.entryName === 'META-INF/container.xml') {
        const containerXml = zip.readAsText(file);
        xml2js.parseString(containerXml, (err, result) => {
          if (err) {
            reject(new Error(`Error parsing container.xml: ${err}`));
            return;
          }
          const opfFilePath = result.container.rootfiles[0].rootfile[0].$['full-path'];
          opfPath = opfFilePath;
          extractMetadataFromOpf(zip, opfPath)
            .then(metadata => resolve(metadata))
            .catch(err => reject(err));
        });
      }
    });

    if (!opfPath) {
      reject(new Error('OPF file not found'));
    }
  });
}

function extractMetadataFromOpf(zip: AdmZip, opfPath: string): Promise<{ title: string; author: string; coverImgBase64: string }> {
  return new Promise((resolve, reject) => {
    const opfXml = zip.readAsText(opfPath);
    xml2js.parseString(opfXml, (err, result) => {
      if (err) {
        reject(new Error(`Error parsing OPF file: ${err}`));
        return;
      }

      const metadata = result['package']['metadata'][0];
      const title = metadata['dc:title'][0];
      
      // Extract author name from the object or use the string directly
      const authorObj = metadata['dc:creator'] && metadata['dc:creator'][0];
      const author = typeof authorObj === 'string' ? authorObj : (authorObj ? authorObj['_'] : 'Unknown Author');

      extractCoverImage(zip)
        .then(coverImgBase64 => resolve({ title, author, coverImgBase64 }))
        .catch(err => reject(err));
    });
  });
}

function fileIncludes(fileName: string, extensions: string[]): boolean {
  return extensions.some(extension => fileName.includes(extension));
}

function extractCoverImage(zip: AdmZip): Promise<string> {
  return new Promise((resolve, reject) => {
    const files = zip.getEntries();
    const coverImageExtensions = ['cover.jpg', 'cover.jpeg'];

    for (const file of files) {
      const fileName = file.entryName.toLowerCase();
      if (fileIncludes(fileName, coverImageExtensions)) {
        const coverImageBuffer = file.getData();
        const coverImageBase64 = coverImageBuffer.toString('base64');
        resolve(coverImageBase64);
        return;
      }
    }

    resolve('');
  });
}

export async function consumeEpub(epubFile: File) {
  const tempDir = tmpdir(); // Get system temp directory
  const tempFilePath = path.join(tempDir, epubFile.name); 
  fs.writeFileSync(tempFilePath, Buffer.from(await epubFile.arrayBuffer()));

  const loader = new EPubLoader(tempFilePath);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 256,
    chunkOverlap: 64
  });

  const docs = await loader.load();
  const splitDocs = splitter.splitDocuments(docs);

  return splitDocs;
}