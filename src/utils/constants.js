import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import os from 'os';

// Constants for vector store
// We conditionally route to /tmp in production.
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
export const DATA_DIR = isVercel ? join(os.tmpdir(), 'rag-data') : join(process.cwd(), 'src', 'data');
export const VECTOR_STORE_PATH = join(DATA_DIR, 'vector-store.json');

// Ensure data directory exists
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
