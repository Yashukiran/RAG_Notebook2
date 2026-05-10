/**
 * A manual implementation of RecursiveCharacterTextSplitter.
 * Splits text into chunks of a given size with overlap.
 */
export function chunkText(text, chunkSize = 700, chunkOverlap = 150) {
  if (!text || text.trim().length === 0) return [];
  
  // Try to split by double newline (paragraphs) first
  let splits = text.split(/\n\n+/);
  let chunks = [];
  let currentChunk = '';

  for (const split of splits) {
    // If the split itself is larger than the chunk size, we need to split it by single newlines, then sentences, then words
    if (split.length > chunkSize) {
      const subSplits = split.split(/(?<=\.\s)/); // Split by sentences roughly
      for (const sub of subSplits) {
        if (currentChunk.length + sub.length > chunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          // Start new chunk with overlap
          const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
          currentChunk = currentChunk.substring(overlapStart) + ' ' + sub;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sub;
        }
      }
    } else {
      if (currentChunk.length + split.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
        currentChunk = currentChunk.substring(overlapStart) + '\n\n' + split;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + split;
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // Final pass: ensure strict limits and generate metadata objects
  const finalChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    let c = chunks[i];
    // Hard cutoff if somehow it's still too large
    while (c.length > chunkSize * 1.5) {
      finalChunks.push(c.substring(0, chunkSize));
      c = c.substring(chunkSize - chunkOverlap);
    }
    if (c.trim().length > 20) { // avoid tiny chunks
      finalChunks.push(c.trim());
    }
  }

  return finalChunks.map((text, index) => ({
    text,
    index
  }));
}
