import Papa from 'papaparse';

export async function parseCsv(buffer) {
  try {
    const csvString = buffer.toString('utf-8');
    const result = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing generated warnings:', result.errors);
    }

    // Convert rows into readable sentences/text blocks
    const lines = result.data.map(row => {
      return Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    });

    return lines.join('\n\n');
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error('Failed to parse CSV document.');
  }
}
