export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of same length for cosine similarity');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find top K most similar items
export function getTopMatches(queryEmbedding, records, topK = 5) {
  const scored = records.map(record => ({
    ...record,
    similarity: cosineSimilarity(queryEmbedding, record.embedding)
  }));
  
  // Sort descending
  scored.sort((a, b) => b.similarity - a.similarity);
  
  return scored.slice(0, topK);
}
