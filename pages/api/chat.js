/**
 * Groq Chat API Route
 * Proxies chat requests to GroqCloud
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, persona, purpose } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  // Select model based on purpose
  const model = purpose === 'summarize'
    ? 'openai/gpt-oss-20b'
    : 'moonshotai/kimi-k2-instruct-0905';

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Chat API] GROQ_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: purpose === 'summarize' ? 512 : 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chat API] Groq API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Groq API request failed', details: errorText });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Strip <think>...</think> blocks from thinking models (e.g. qwen3)
    content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();

    return res.status(200).json({ content });
  } catch (error) {
    console.error('[Chat API] Request failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
