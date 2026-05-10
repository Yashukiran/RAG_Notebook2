# Google NotebookLM RAG Clone

This project is a custom-built, full-stack application inspired by Google NotebookLM. It implements a complete Retrieval-Augmented Generation (RAG) pipeline allowing users to upload unseen documents (PDF or CSV) and ask natural language questions about them. The system strictly grounds its answers based solely on the provided document content, eliminating hallucinations.

## Assignment Requirements Fulfilled

1. **Working Interface**: Features a modern, Next.js web application UI where users can easily upload files and chat via a conversational interface.
2. **End-to-End RAG Pipeline**: Implements the full flow: Ingestion -> Chunking -> Embedding -> Storage -> Retrieval -> Generation.
3. **Chunking Strategy Documented**: Implements a custom "Recursive Character Text Splitting" algorithm (documented below).
4. **Vector Database**: Uses a custom-built local JSON vector database for storing and querying text embeddings and metadata.
5. **Grounded Generation**: Connects to the Groq LLM API with a strict system prompt that forces the AI to only answer using the retrieved context chunks.
6. **Unseen Documents**: The system dynamically processes, embeds, and indexes any new PDF or CSV file at runtime, allowing it to accurately answer questions on documents it has never seen before.

## The RAG Pipeline Workflow

### 1. Ingestion
The user uploads a document (PDF or CSV). The Next.js backend parses the file buffer directly in memory. PDFs are parsed using `pdf-parse`, and CSVs are parsed row-by-row into readable text blocks using `papaparse`.

### 2. Chunking Strategy
The project uses a custom **Recursive Character Text Splitter**. 
- **Goal**: To preserve semantic meaning without cutting off sentences abruptly.
- **Implementation**: The algorithm first attempts to split the text by double newlines (paragraphs). If a paragraph exceeds the maximum chunk size (700 characters), it recursively splits by single newlines, then by sentences, and finally by words if necessary.
- **Overlap**: It applies a 150-character overlap between sequential chunks to ensure that context spanning across boundaries is not lost.

### 3. Embedding
The chunks are mapped into mathematical vectors. The application uses `@xenova/transformers` to run the `all-MiniLM-L6-v2` model locally, creating 384-dimensional dense vectors. A deterministic hashing algorithm is included as a fallback for strict serverless environments.

### 4. Storage
A custom local vector database (`vector-store.json`) is used. It stores the raw text, the generated 384-dimensional embedding, and file metadata. This acts as the vector store to query against.

### 5. Retrieval
When a user asks a question, the query is embedded using the same MiniLM model. The system then runs a Mathematical Cosine Similarity Search across all stored vectors in the database, ranking them and returning the top 5 most relevant chunks.

### 6. Generation
The top 5 chunks are injected into a strict system prompt. The prompt explicitly commands the LLM to base its answer entirely on the provided chunks and to state "Answer not found in uploaded document" if the data is missing. The payload is sent to the Groq API (using the `llama-3.3-70b-versatile` model), which returns the grounded answer to the user via a smooth typing interface.

## Folder Structure

```text
notebooklm-rag/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.js     (Handles ingestion, chunking, embedding)
│   │   │   └── chat/route.js       (Handles similarity search & LLM fetch)
│   │   ├── globals.css             (Tailwind configuration variables)
│   │   ├── layout.js               (Next.js root layout)
│   │   └── page.jsx                (Main application UI)
│   ├── components/                 (Reusable React UI components)
│   │   ├── Header.jsx
│   │   ├── UploadPanel.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── SourceViewer.jsx
│   │   ├── EmptyState.jsx
│   │   └── LoadingSpinner.jsx
│   ├── lib/
│   │   ├── pdf-parser.js           (PDF extraction service)
│   │   ├── csv-parser.js           (CSV parsing service)
│   │   ├── chunking.js             (Recursive Character Text Splitter)
│   │   ├── embeddings.js           (MiniLM model embedding logic)
│   │   ├── cosine-similarity.js    (Math operations for semantic search)
│   │   ├── vector-store.js         (JSON vector DB logic)
│   │   ├── grok.js                 (LLM API communication)
│   │   └── rag-pipeline.js         (Orchestrates the entire RAG flow)
│   ├── utils/
│   │   └── constants.js
│   └── data/
│       └── vector-store.json       (Generated database file)
├── package.json
└── README.md
```

## Local Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Setup Environment Variables:
Create a `.env` file in the root directory and add your Groq API Key:
```env
XAI_API_KEY=gsk_your_groq_api_key_here
```
Note: The variable is named `XAI_API_KEY` for legacy reasons, but the system dynamically detects `gsk_` prefixes and correctly routes to the Groq API.

3. Start the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Deployment

This application is fully compatible with Vercel. 
1. Push the code to a public GitHub repository.
2. Import the repository into Vercel.
3. Add the `XAI_API_KEY` environment variable in the Vercel dashboard.
4. Deploy. The configuration files handle necessary node-module exclusions automatically for serverless environments.
