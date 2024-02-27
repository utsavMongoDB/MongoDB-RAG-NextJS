import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import pdf from "pdf-parse";

import { getEmbeddingsTransformer, searchArgs } from '@/utils/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/community/vectorstores/mongodb_atlas';
import { CharacterTextSplitter } from 'langchain/text_splitter';

var chatHistory: string[] = [""]


export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');
    let fileName = '';
    let parsedText = '';
    let uploaded = false;

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[1];
      console.log('Uploaded file:', uploadedFile);

      if (uploadedFile instanceof File) {
        fileName = uploadedFile.name.toLowerCase();

        const tempFilePath = `/tmp/${fileName}.pdf`;

        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

        await fs.writeFile(tempFilePath, fileBuffer);
        let dataBuffer = fs.readFile(tempFilePath);

        await pdf(await dataBuffer).then(async function (data: { text: any; }) {
          console.log(data.text);
          parsedText = data.text;
          const chunks = await new CharacterTextSplitter({
            separator: "\n",
            chunkSize: 1000,
            chunkOverlap: 100
          }).splitText(parsedText)
          console.log(chunks.length)
          await MongoDBAtlasVectorSearch.fromTexts(
            chunks, [],
            getEmbeddingsTransformer(),
            searchArgs()
          )
        });
        uploaded = true
        return NextResponse.json({ message: uploaded }, { status: 200 });

      } else {
        console.log('Uploaded file is not in the expected format.');
        return NextResponse.json({ message: 'Uploaded file is not in the expected format' }, { status: 500 });
      }
    } else {
      console.log('No files found.');
      return NextResponse.json({ message: 'No files found' }, { status: 500 });

    }

  } catch (error) {
    console.error('Error processing request:', error);
    // Handle the error accordingly, for example, return an error response.
    return new NextResponse("An error occurred during processing.", { status: 500 });
  }

}


