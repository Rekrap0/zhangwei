// Edge-compatible: using fetch instead of Node.js https module

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const uin = url.searchParams.get('uin');

  if (!uin || !/^\d{5,12}$/.test(uin)) {
    return new Response(JSON.stringify({ error: 'Invalid QQ number' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const qqUrl = `https://users.qzone.qq.com/fcg-bin/cgi_get_portrait.fcg?uins=${uin}`;

  try {
    const response = await fetch(qqUrl);
    const text = await response.text();

    // Parse JSONP: portraitCallBack({"uin":[...]})
    const match = text.match(/portraitCallBack\((\{.*\})\)/);
    if (!match) {
      return new Response(JSON.stringify({ nickname: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = JSON.parse(match[1]);
    const arr = data[uin];
    if (Array.isArray(arr) && arr.length > 6) {
      let nickname = arr[6] || null;

      // Detect server-side encoding corruption:
      // U+FFFD replacement chars, or classic "锟斤拷" mojibake pattern
      if (nickname && (/\uFFFD/.test(nickname) || /锟斤拷/.test(nickname))) {
        nickname = null; // corrupted, fall back to QQ number on client
      }

      return new Response(JSON.stringify({ nickname }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ nickname: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('QQ portrait fetch error:', error);
    return new Response(JSON.stringify({ nickname: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
