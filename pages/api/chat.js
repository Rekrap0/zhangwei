/**
 * Groq Chat API Route
 * Proxies chat requests to GroqCloud
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, persona, purpose } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid messages array' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Select model based on purpose
  const model = purpose === 'summarize'
    ? 'openai/gpt-oss-20b'
    : 'moonshotai/kimi-k2-instruct-0905';

  // process.env is polyfilled by @cloudflare/next-on-pages
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('[Chat API] GROQ_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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
      return new Response(JSON.stringify({ error: 'Groq API request failed', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Strip <think>...</think> blocks from thinking models (e.g. qwen3)
    content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Chat API] Request failed:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
