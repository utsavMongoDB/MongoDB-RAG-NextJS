import { Message as VercelChatMessage, StreamingTextResponse, LangChainStream, Message } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { vectorStore } from '@/utils/openai';
import { NextResponse } from 'next/server';


const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};


export async function POST(req: Request) {
    try {
        const { stream, handlers } = LangChainStream();
        const body = await req.json();
        const messages: Message[] = body.messages ?? [];

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const question = messages[messages.length - 1].content;

        const model = new ChatOpenAI({
            temperature: 0.8,
            streaming: true,
            callbacks: [handlers],
        }); 

        const retriever = vectorStore().asRetriever({ 
            "searchType": "mmr", searchKwargs: { "fetchK": 10, "lambda": 0.25 } })
        const conversationChain = ConversationalRetrievalQAChain.fromLLM(model, retriever)
        conversationChain.invoke({
            question: question,
            chat_history: formattedPreviousMessages.join("\n"),
        })

        return new StreamingTextResponse(stream);
    }
    catch (e) {
        return NextResponse.error()
    }
}