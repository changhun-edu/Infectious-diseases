const API_KEY = '9e644bbc9679873e697c8e70127dc6c6d1073968698887cef1fc34aba8e0a36c';
const API_BASE = 'https://apis.data.go.kr/1790387/infectdiseasestats/infectdiseasestatsservice/getInfectdiseaseStats';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const year  = req.query.year  || '2025';
  const month = req.query.month || '07';

  const apiUrl = `${API_BASE}?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=1&numOfRows=100&resultType=json&year=${year}&month=${month}`;

  try {
    const response = await fetch(apiUrl);
    const text = await response.text();

    /* 응답 텍스트 그대로 반환 (디버깅용) */
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Api-Url', apiUrl);
    res.setHeader('X-Response-Status', String(response.status));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    /* JSON 파싱 시도 */
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      /* JSON 아니면 텍스트 그대로 래핑해서 반환 */
      return res.status(200).json({
        ok: false,
        rawStatus: response.status,
        rawText: text.slice(0, 500),
        apiUrl,
      });
    }
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message, apiUrl });
  }
}
