export async function askGrok(prompt, systemInstruction) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not defined in environment variables.');
  }

  // Detect if the user accidentally provided a Groq API key instead of an xAI Grok API key
  const isGroq = apiKey.trim().startsWith('gsk_');
  
  const url = isGroq 
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';

  // Use llama-3.3-70b-versatile for Groq, and grok-beta for xAI (grok-2-latest may be restricted)
  const model = isGroq 
    ? 'llama-3.3-70b-versatile'
    : 'grok-beta';

  const body = {
    model: model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2, // low temp for factual answers
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('API Error Response:', errText);
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No answer returned from API');
    }
  } catch (error) {
    console.error('Failed to communicate with API:', error);
    throw error;
  }
}
