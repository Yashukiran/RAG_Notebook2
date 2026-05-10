import { NextResponse } from 'next/server';
import { parsePdf } from '@/lib/pdf-parser';
import { parseCsv } from '@/lib/csv-parser';
import { chunkText } from '@/lib/chunking';
import { generateEmbeddingsBatch } from '@/lib/embeddings';
import { addDocumentToStore } from '@/lib/vector-store';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract and parse raw text depending on mime type
    let text = '';
    if (filename.endsWith('.pdf')) {
      text = await parsePdf(buffer);
    } else if (filename.endsWith('.csv')) {
      text = await parseCsv(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF or CSV.' }, { status: 400 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'File is empty or could not be parsed' }, { status: 400 });
    }

    // Process text into overlapping chunks for the semantic search index
    const chunks = chunkText(text, 700, 150);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Failed to extract valid chunks from file' }, { status: 400 });
    }

    // Batch generate embeddings
    const texts = chunks.map(c => c.text);
    const embeddings = await generateEmbeddingsBatch(texts);

    const chunksWithEmbeddings = chunks.map((c, i) => ({
      ...c,
      embedding: embeddings[i]
    }));

    // Persist to local JSON data store
    await addDocumentToStore(filename, chunksWithEmbeddings);

    return NextResponse.json({
      success: true,
      message: 'File processed and stored successfully',
      filename,
      chunksCount: chunks.length
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
