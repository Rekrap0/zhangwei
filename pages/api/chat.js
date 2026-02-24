/**
 * Moonshot Chat API Route
 * Proxies chat requests to Moonshot AI (Kimi)
 */

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
    ? 'moonshot-v1-8k'
    : 'kimi-k2-0905-preview';

  const apiKey = process.env.MOONSHOT_API_KEY;
  
  if (!apiKey) {
    console.error('[Chat API] MOONSHOT_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_completion_tokens: purpose === 'summarize' ? 512 : 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chat API] Moonshot API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Moonshot API request failed', details: errorText });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    // Strip <think>...</think> blocks from thinking models (e.g. qwen3)
    content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();

    return res.status(200).json({ content });
  } catch (error) {
    console.error('[Chat API] Moonshot request failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
