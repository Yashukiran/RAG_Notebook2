import { NextResponse } from 'next/server';
import { processChat } from '@/lib/rag-pipeline';

export async function POST(req) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Empty query provided' }, { status: 400 });
    }

    const result = await processChat(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
