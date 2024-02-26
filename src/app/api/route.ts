import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
// import PDFParser from 'pdf2json';
import pdf from "pdf-parse";


import { getEmbeddingsTransformer, vectorStore, searchArgs } from '@/utils/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/community/vectorstores/mongodb_atlas';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { BufferWindowMemory } from 'langchain/memory';

var chatHistory: string[] = [""]

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') || "";

  try {
    console.log("Request is here")
    const llm = new ChatOpenAI();
    const retriever = vectorStore().asRetriever(
      { searchType: "mmr", searchKwargs: { "fetchK": 10, "lambda": 0.25 } }
    )

    const memory = new BufferWindowMemory({
      "memoryKey": "chat_history",
      "k": 5,
      "returnMessages": true
    })

    const conversationChain = ConversationalRetrievalQAChain.fromLLM(llm, retriever, memory)
    const res = await conversationChain.invoke({
      "question": query,
      "chat_history": [
        chatHistory
      ],
    })
    chatHistory.push(query, res.text)
    console.log(chatHistory)
    return new NextResponse(JSON.stringify(res.text))
  }
  catch (e) {
    console.log("ERROR --- ", e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');
    let fileName = '';
    let parsedText = '';

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[1];
      console.log('Uploaded file:', uploadedFile);

      if (uploadedFile instanceof File) {
        fileName = "uuidv4";

        const tempFilePath = `/tmp/${fileName}.pdf`;

        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

        await fs.writeFile(tempFilePath, fileBuffer);
        let dataBuffer = fs.readFile(tempFilePath);

        pdf(await dataBuffer).then(async function (data: { text: any; }) {
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
          console.log("Addded to mongo!")
        });

      } else {
        console.log('Uploaded file is not in the expected format.');
      }
    } else {
      console.log('No files found.');
    }

    const response = new NextResponse(parsedText);
    response.headers.set('FileName', fileName);
    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    // Handle the error accordingly, for example, return an error response.
    return new NextResponse("An error occurred during processing.", { status: 500 });
  }

}


