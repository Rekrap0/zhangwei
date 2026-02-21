export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const response = await fetch(
      `https://websearch.miyami.tech/search-api?query=${encodeURIComponent(query)}&language=zh-CN&categories=general`
    );
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Search API proxy error:', error);
    return res.status(500).json({ error: 'Search request failed' });
  }
}
