import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch, MongoDBAtlasVectorSearchLibArgs } from '@langchain/community/vectorstores/mongodb_atlas';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

let embeddingsInstance: OpenAIEmbeddings | null = null;
const client = new MongoClient(process.env.MONGODB_URI!);
const namespace = "rag.data";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

export function getEmbeddingsTransformer(): OpenAIEmbeddings {
    if (!embeddingsInstance) {
        embeddingsInstance = new OpenAIEmbeddings();
    }
    return embeddingsInstance;
}

export function vectorStore(): MongoDBAtlasVectorSearch {
    const vectorStore: MongoDBAtlasVectorSearch = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(),
        searchArgs());
    return vectorStore
}

export function searchArgs(): MongoDBAtlasVectorSearchLibArgs {
    const searchArgs: MongoDBAtlasVectorSearchLibArgs = {
        collection,
        indexName: "default",
        textKey: "line",
        embeddingKey: "vec",
    }
    return searchArgs;
}