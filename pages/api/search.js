export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `https://websearch.miyami.tech/search-api?query=${encodeURIComponent(query)}&language=zh-CN&categories=general`
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search API proxy error:', error);
    return new Response(JSON.stringify({ error: 'Search request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
