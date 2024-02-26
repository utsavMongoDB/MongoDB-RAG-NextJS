import { NextRequest } from 'next/server';
import { Message as VercelChatMessage, StreamingTextResponse, LangChainStream, Message } from 'ai';

import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BytesOutputParser, XML_FORMAT_INSTRUCTIONS } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';

import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { getEmbeddingsTransformer, vectorStore, searchArgs } from '@/utils/openai';
import { BufferWindowMemory } from 'langchain/memory';
import { RunnableSequence } from "langchain/schema/runnable";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const STANDALONE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say i dont know.
##Context:{context}
##Question:{question} \n\
##Chat History: {chat_history}
##AI Assistant Response:\n`;


export async function POST(req: Request) {
    try {
        const { stream, handlers } = LangChainStream();
        const body = await req.json();
        const messages: Message[] = body.messages ?? [];
        console.log("Messages ", messages);
        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const question = messages[messages.length - 1].content;

        const model = new ChatOpenAI({
            temperature: 0.8,
            streaming: true
        });

        const retriever = vectorStore().asRetriever(
            { searchType: "mmr", searchKwargs: { "fetchK": 10, "lambda": 0.25 } }
        )

        console.log(messages)
        const memory = new BufferWindowMemory({
            "memoryKey": "chat_history",
            "k": 5,
            "returnMessages": true
        })

        const conversationChain = ConversationalRetrievalQAChain.fromLLM(
            model, retriever, {
            // qaChainOptions: {
            //     prompt: PromptTemplate.fromTemplate(QA_TEMPLATE)
            // }
        })
        // {
        //     memory : memory,
        //     qaTemplate: QA_TEMPLATE,
        //     questionGeneratorTemplate: STANDALONE_QUESTION_TEMPLATE,
        // })

        conversationChain.call(
            {
                question: question,
                chat_history: formattedPreviousMessages.join("\n"),
                context: retriever
            },
            [handlers]
        )


        return new StreamingTextResponse(stream);
    }
    catch (e) {
        console.log("Errro", e)
    }
}