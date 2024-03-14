
# RAG Based Chat-bot using Langchain and MongoDB Atlas
This starter template implements a Retrieval-Augmented Generation (RAG) chatbot using LangChain and MongoDB Atlas. RAG combines AI language generation with knowledge retrieval for more informative responses. LangChain simplifies building the chatbot logic, while MongoDB Atlas' Vector database capability provides a powerful platform for storing and searching the knowledge base that fuels the chatbot's responses.

#### Deploy your versions on PaaS               
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FutsavMongoDB%2FMongoDB-RAG-NextJS&env=OPENAI_API_KEY,FIELD_KEY,EMBEDDING_KEY&demo-title=RAG%20with%20MongoDB%20Atlas%20and%20OpenAI&demo-url=https%3A%2F%2Fmonogodb-rag.vercel.app%2F&integration-ids=oac_jnzmjqM10gllKmSrG0SGrHOH)

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/utsavMongoDB/MongoDB-RAG-NextJS&env=OPENAI_API_KEY,MONGODB_URI)


## Setup 
### Prerequisites

Before you begin, make sure you have the following installed on your system:

- **MongoDB Atlas URI**: Setup your account if you don't already have one ([Create Account](https://www.mongodb.com/docs/guides/atlas/account/))
  
- Create **vector embeddings** for your data ([Blog](https://www.mongodb.com/developer/products/atlas/building-generative-ai-applications-vector-search-open-source-models/))
  
- **Node.js** (https://nodejs.org/)
   - npm (Node Package Manager, comes with Node.js)
     
- **Git** (https://git-scm.com/)
  
- **OpenAI API Key** (https://platform.openai.com/api-keys)



### Steps to Deploy

#### Step 1: Clone the Repository

- Clone this repository to your local machine using Git:

```
git clone <repository-url>
```


#### Step 2: Install Dependencies

- Navigate to your project directory and install dependencies using npm:

```
cd <project-directory>
npm install
```

#### Step 3: Add Environment Variables

- Create a `.env.local` in the parent folder and add the below environment variables, so you can run the application:

````
OPENAI_API_KEY = "<YOUR_OPENAI_KEY>"              # API Key copied from the OpenAI portal
MONGODB_URI = "<YOUR_MONGODB_URI>"                # Connection URI to MongoDB Instance
FIELD_KEY = "<YOUR_DATA_FIELD>"                   # The data field on which you created vectors.
EMBEDDING_KEY = "<FIELD_EMBEDDING_FIELD>"         # The field with vectorized data information.
````

#### Step 3: Serve Locally

- Start running the application locally.
```
npm run dev
```


## Reference Architechture 

![Ref. Arch (1)](https://github.com/utsavMongoDB/MongoDB-RAG-NextJS/assets/114057324/35caff96-0d7a-447c-95a7-b96910528b48)


This architecture depicts a Retrieval-Augmented Generation (RAG) chatbot system built with LangChain, OpenAI, and MongoDB Atlas Vector Search. Let's break down its key players:

- **PDF File**: This serves as the knowledge base, containing the information the chatbot draws from to answer questions. The RAG system extracts and processes this data to fuel the chatbot's responses.
- **Text Chunks**: These are meticulously crafted segments extracted from the PDF. By dividing the document into smaller, targeted pieces, the system can efficiently search and retrieve the most relevant information for specific user queries.
- **LangChain**: This acts as the central control unit, coordinating the flow of information between the chatbot and the other components. It preprocesses user queries, selects the most appropriate text chunks based on relevance, and feeds them to OpenAI for response generation.
- **Query Prompt**: This signifies the user's question or input that the chatbot needs to respond to.
- **Actor**: This component acts as the trigger, initiating the retrieval and generation process based on the user query. It instructs LangChain and OpenAI to work together to retrieve relevant information and formulate a response.
- **OpenAI Embeddings**: OpenAI, a powerful large language model (LLM), takes centre stage in response generation. By processing the retrieved text chunks (potentially converted into numerical representations or embeddings), OpenAI crafts a response that aligns with the user's query and leverages the retrieved knowledge.
- **MongoDB Atlas Vector Store**: This specialized database is optimized for storing and searching vector embeddings. It efficiently retrieves the most relevant text chunks from the knowledge base based on the query prompt's embedding. These retrieved knowledge nuggets are then fed to OpenAI to inform its response generation.


This RAG-based architecture seamlessly integrates retrieval and generation. It retrieves the most relevant knowledge from the database and utilizes OpenAI's language processing capabilities to deliver informative and insightful answers to user queries.


## Implementation 

The below components are used to build up the bot, which can retrieve the required information from the vector store, feed it to the chain and stream responses to the client.

#### LLM Model 

        const model = new ChatOpenAI({
            temperature: 0.8,
            streaming: true,
            callbacks: [handlers],
        });


#### Vector Store

        const retriever = vectorStore().asRetriever({ 
            "searchType": "mmr", 
            "searchKwargs": { "fetchK": 10, "lambda": 0.25 } 
        })

#### Chain

       const conversationChain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
            memory: new BufferMemory({
              memoryKey: "chat_history",
            }),
          })
        conversationChain.invoke({
            "question": question
        })
