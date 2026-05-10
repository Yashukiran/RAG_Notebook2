import fs from 'fs';
import { VECTOR_STORE_PATH, ensureDataDir } from '@/utils/constants';

// Store structure:
// {
//   documents: [{ filename, chunkCount, ...metadata }],
//   chunks: [{ text, embedding, filename, index }]
// }

export async function initStore() {
  ensureDataDir();
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify({ documents: [], chunks: [] }), 'utf-8');
  }
}

export async function readStore() {
  await initStore();
  const data = fs.readFileSync(VECTOR_STORE_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeStore(data) {
  await initStore();
  fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function addDocumentToStore(filename, newChunks) {
  const store = await readStore();
  
  // Remove older chunks for the same filename to avoid duplicates
  store.chunks = store.chunks.filter(c => c.filename !== filename);
  store.documents = store.documents.filter(d => d.filename !== filename);
  
  // Add new
  store.documents.push({
    filename,
    chunkCount: newChunks.length,
    uploadedAt: new Date().toISOString()
  });
  
  store.chunks.push(...newChunks.map(c => ({
    ...c,
    filename
  })));
  
  await writeStore(store);
}

export async function getAllChunks() {
  const store = await readStore();
  return store.chunks;
}

export async function getDocuments() {
  const store = await readStore();
  return store.documents;
}
