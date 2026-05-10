import { generateEmbedding } from './embeddings';
import { getAllChunks } from './vector-store';
import { getTopMatches } from './cosine-similarity';
import { askGrok } from './grok';

const SYSTEM_PROMPT = `You are an AI Assistant who helps resolving the user query based on the available context provided to you from the uploaded document.

Rules:
- ONLY answer based on the available context from the file.
- NEVER hallucinate or use outside general knowledge.
- If the answer is not found in the uploaded document context, say exactly: "Answer not found in uploaded document."
- Keep your answers conversational, concise, and accurate. Do not mention "chunks" or cite source indices in your response.`;

export async function processChat(query) {
  if (!query) throw new Error('Query is empty');

  const queryEmbedding = await generateEmbedding(query);
  const allChunks = await getAllChunks();
  
  if (allChunks.length === 0) {
    throw new Error('No documents uploaded. Please upload a document first.');
  }

  // Retrieve the top 5 most relevant document chunks
  const topChunks = getTopMatches(queryEmbedding, allChunks, 5);

  // Construct context payload for the LLM
  let contextText = topChunks.map((c, i) => `--- Chunk ${i + 1} (File: ${c.filename}) ---\n${c.text}\n`).join('\n');
  const userPrompt = `Context Information:\n${contextText}\n\nQuestion: ${query}\n\nAnswer based ONLY on the context above.`;

  const answer = await askGrok(userPrompt, SYSTEM_PROMPT);

  return {
    answer,
    sources: topChunks.map(c => ({
      text: c.text,
      filename: c.filename,
      similarity: c.similarity
    }))
  };
}
