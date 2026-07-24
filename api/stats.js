const API_KEY = '9e644bbc9679873e697c8e70127dc6c6d1073968698887cef1fc34aba8e0a36c';
const API_BASE = 'https://apis.data.go.kr/1790387/infectdiseasestats/infectdiseasestatsservice/getInfectdiseaseStats';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const year = (req.query && req.query.year) || '2025';
  const month = (req.query && req.query.month) || '06';

  const attempts = [
    API_BASE + '?serviceKey=' + API_KEY + '&pageNo=1&numOfRows=100&resultType=json&year=' + year + '&month=' + month,
    API_BASE + '?serviceKey=' + API_KEY + '&pageNo=1&numOfRows=100&year=' + year + '&month=' + month,
    API_BASE + '?serviceKey=' + encodeURIComponent(API_KEY) + '&pageNo=1&numOfRows=100&resultType=json&year=' + year + '&month=' + month
  ];

  const errors = [];

  for (let i = 0; i < attempts.length; i++) {
    const apiUrl = attempts[i];
    try {
      const r = await fetch(apiUrl, { headers: { Accept: 'application/json, text/xml, */*' } });
      const text = await r.text();

      if (r.status === 200) {
        try {
          const json = JSON.parse(text);
          if (json.response) {
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            return res.status(200).json(json);
          }
        } catch (parseErr) {
          errors.push({ attempt: i + 1, status: r.status, parseError: parseErr.message, snippet: text.slice(0, 200) });
          continue;
        }
      }
      errors.push({ attempt: i + 1, status: r.status, snippet: text.slice(0, 200) });
    } catch (e) {
      errors.push({ attempt: i + 1, error: e.message });
    }
  }

  return res.status(200).json({ ok: false, errors: errors });
};
