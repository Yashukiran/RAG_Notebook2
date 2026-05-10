import pdfParse from 'pdf-parse';

function cleanText(text) {
  return text.replace(/\0/g, '').replace(/\s+/g, ' ').trim();
}

function decodePdfString(text) {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

function extractTextFromPdfObjects(buffer) {
  const raw = buffer.toString('latin1');
  const regex = /\(([^)]+)\)/gs;
  const matches = [];
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const decoded = decodePdfString(match[1]);
    if (decoded.trim().length >= 5) {
      matches.push(decoded);
    }
  }
  if (!matches.length) return '';
  return cleanText(matches.join(' '));
}

function extractTextFromRawPdf(buffer) {
  const raw = buffer.toString('latin1');
  const matches = raw.match(/[\x20-\x7E]{5,}/g);
  if (!matches) return '';
  return cleanText(matches.join(' '));
}

export async function parsePdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    if (data && data.text && data.text.trim()) {
      return cleanText(data.text);
    }
  } catch (error) {
    console.warn('pdf-parse failed, trying fallback parser:', error);
  }

  try {
    const pdfjs = await import('pdf-parse/lib/pdf.js/v2.0.550/build/pdf.js');
    const loadingTask = pdfjs.getDocument({
      data: buffer,
      disableRange: true,
      disableStream: true,
      verbosity: 0,
      stopAtErrors: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum += 1) {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += `${pageText}\n`;
    }

    if (fullText.trim()) {
      return cleanText(fullText);
    }
  } catch (error) {
    console.warn('PDF fallback parser failed:', error);
  }

  const rawTextFromObjects = extractTextFromPdfObjects(buffer);
  if (rawTextFromObjects) {
    return rawTextFromObjects;
  }

  const rawText = extractTextFromRawPdf(buffer);
  if (rawText) {
    return rawText;
  }

  console.error('Error parsing PDF: no parsers succeeded');
  throw new Error('Failed to parse PDF document.');
}
