import https from 'https';

export default function handler(req, res) {
  const { uin } = req.query;

  if (!uin || !/^\d{5,12}$/.test(uin)) {
    return res.status(400).json({ error: 'Invalid QQ number' });
  }

  const url = `https://users.qzone.qq.com/fcg-bin/cgi_get_portrait.fcg?uins=${uin}`;

  return new Promise((resolve) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        try {
          // The QQ server now returns UTF-8 (charset=UTF-8 header),
          // but Chinese nicknames stored as GBK get corrupted server-side
          // (GBK bytes that aren't valid UTF-8 become U+FFFD replacement chars).
          // We decode as UTF-8 and detect corruption.
          const raw = Buffer.concat(chunks);
          const text = raw.toString('utf-8');

          // Parse JSONP: portraitCallBack({"uin":[...]})
          const match = text.match(/portraitCallBack\((\{.*\})\)/);
          if (!match) {
            res.status(200).json({ nickname: null });
            return resolve();
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

            res.status(200).json({ nickname });
          } else {
            res.status(200).json({ nickname: null });
          }
          resolve();
        } catch (error) {
          console.error('QQ portrait parse error:', error);
          res.status(200).json({ nickname: null });
          resolve();
        }
      });
      response.on('error', () => {
        res.status(200).json({ nickname: null });
        resolve();
      });
    }).on('error', () => {
      res.status(200).json({ nickname: null });
      resolve();
    });
  });
}
