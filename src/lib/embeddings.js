import { pipeline, env } from '@xenova/transformers';

// Configure transformers not to use local cache if in Vercel to avoid filesystem issues
env.allowLocalModels = false;
env.useBrowserCache = false;

// We use a singleton pattern for the pipeline to avoid re-loading the model
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    // all-MiniLM-L6-v2 produces 384-dimensional embeddings
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true, // use quantized to save memory
    });
  }
  return extractor;
}

// Implements a deterministic hash-based sparse vectorization mapped to 384 dimensions.
// This serves as a failover strategy to guarantee embedding generation if Vercel serverless functions time out fetching the ONNX runtime.
function fallbackEmbedding(text) {
  const vector = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\W+/);
  for (const word of words) {
    if (!word) continue;
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash |= 0; 
    }
    const index = Math.abs(hash) % 384;
    vector[index] += 1;
  }
  
  // Normalize vector
  let magnitude = 0;
  for (let i = 0; i < 384; i++) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude);
  if (magnitude > 0) {
    for (let i = 0; i < 384; i++) {
      vector[i] /= magnitude;
    }
  }
  
  return vector;
}

export async function generateEmbedding(text) {
  try {
    const ext = await getExtractor();
    const output = await ext(text, { pooling: 'mean', normalize: true });
    // output.data is a Float32Array
    return Array.from(output.data);
  } catch (error) {
    console.warn("Transformers failed, falling back to TF-IDF hashing...", error);
    return fallbackEmbedding(text);
  }
}

export async function generateEmbeddingsBatch(texts) {
  const embeddings = [];
  for (const text of texts) {
    const emb = await generateEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
}
