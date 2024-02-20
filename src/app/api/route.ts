import { NextRequest, NextResponse } from 'next/server'; 
import { promises as fs } from 'fs';
import PDFParser from 'pdf2json'; 
import { getEmbeddingsTransformer, vectorStore, searchArgs } from '@/utils/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/community/vectorstores/mongodb_atlas';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { BufferWindowMemory } from 'langchain/memory';

const formatChatHistory = (
  human: string | null,
  ai: string ,
  previousChatHistory?: string
) => {
  const newInteraction = `Human: ${human}\nAI: ${ai}`;
  if (!previousChatHistory) {
    return newInteraction;
  }
  return `${previousChatHistory}\n\n${newInteraction}`;
};

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll('filepond');
  let fileName = '';
  let parsedText = '';

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile = uploadedFiles[1];
    console.log('Uploaded file:', uploadedFile);

    // Check if uploadedFile is of type File
    if (uploadedFile instanceof File) {
      // Generate a unique filename
      fileName = "uuidv4";

      // Convert the uploaded file into a temporary file
      const tempFilePath = `/tmp/${fileName}.pdf`;

      // Convert ArrayBuffer to Buffer
      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

      // Save the buffer as a file
      await fs.writeFile(tempFilePath, fileBuffer);

      const pdfParser = new (PDFParser as any)(null, 1);

      // See pdf2json docs for more info on how the below works.
      pdfParser.on('pdfParser_dataError', (errData: any) =>
        console.log(errData.parserError)
      );

      pdfParser.on('pdfParser_dataReady', async () => {
        parsedText = (pdfParser as any).getRawTextContent();
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

      pdfParser.loadPDF(tempFilePath);
    } else {
      console.log('Uploaded file is not in the expected format.');
    }
  } else {
    console.log('No files found.');
  }

  const response = new NextResponse(parsedText);
  response.headers.set('FileName', fileName);
  return response;
}


export async function GET(req: NextRequest) {
  const query  = req.nextUrl.searchParams.get('query');
  console.log(query)
  const llm = new ChatOpenAI();
  const retriever = vectorStore().asRetriever(
    { searchType: "mmr", searchKwargs: { "fetchK": 10, "lambda": 0.25 } }
  )

  const memory = new BufferWindowMemory({
    "memoryKey": "chat_history",
    "k": 5,
    "returnMessages": true
  })

  const conversationChain = ConversationalRetrievalQAChain.fromLLM(llm,retriever, memory)
  const res = await conversationChain.invoke({
    "question" : query, 
    "chat_history" : formatChatHistory("my name is Utsav", "sure")
  })
  // const mem = formatChatHistory(query, JSON.stringify(res))
  // console.log(mem)
  return new NextResponse(JSON.stringify(res))
}