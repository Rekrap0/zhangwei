// Edge-compatible: using fetch instead of Node.js https module

export default async function handler(req, res) {
  const { uin } = req.query;

  if (!uin || !/^\d{5,12}$/.test(uin)) {
    return res.status(400).json({ error: 'Invalid QQ number' });
  }

  const url = `https://users.qzone.qq.com/fcg-bin/cgi_get_portrait.fcg?uins=${uin}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse JSONP: portraitCallBack({"uin":[...]})
    const match = text.match(/portraitCallBack\((\{.*\})\)/);
    if (!match) {
      return res.status(200).json({ nickname: null });
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

      return res.status(200).json({ nickname });
    } else {
      return res.status(200).json({ nickname: null });
    }
  } catch (error) {
    console.error('QQ portrait fetch error:', error);
    return res.status(200).json({ nickname: null });
  }
}
