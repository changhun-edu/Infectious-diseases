const API_KEY = '9e644bbc9679873e697c8e70127dc6c6d1073968698887cef1fc34aba8e0a36c';
const BASE = 'https://apis.data.go.kr/1790387/EIDAPIService';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const year = (req.query && req.query.year) || '2024';

  /* 정의서 기준 파라미터
     serviceKey, resType(2=json), searchType(1=발생수),
     searchYear(연도 4자리), patntType(1=전체), pageNo, numOfRows */
  const params = 'serviceKey=' + API_KEY
    + '&resType=2'
    + '&searchType=1'
    + '&searchYear=' + year
    + '&patntType=1'
    + '&pageNo=1&numOfRows=200';

  /* 오퍼레이션명 후보 — 감염병별 발생현황 */
  const operations = [
    'getIcdStats',
    'getIcdNmStats',
    'getEIDIcdStats',
    'getDiseaseStats',
    'getStatsByDisease',
    'getIcdStatsList',
    'getEIDStats',
    'getStats',
    'getInfectdiseaseStats',
    ''
  ];

  const errors = [];

  for (const op of operations) {
    const url = BASE + (op ? '/' + op : '') + '?' + params;
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json, text/xml, */*' } });
      const text = await r.text();

      if (r.status === 200) {
        try {
          const json = JSON.parse(text);
          if (json.response || json.body || json.items) {
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            res.setHeader('X-Operation', op || '(none)');
            return res.status(200).json(json);
          }
        } catch (e) { /* JSON 아님 */ }
      }
      errors.push({ op: op || '(none)', status: r.status, snippet: text.slice(0, 200) });
    } catch (e) {
      errors.push({ op: op || '(none)', error: e.message });
    }
  }

  return res.status(200).json({ ok: false, endpoint: BASE, params: params.replace(API_KEY, '***'), errors: errors });
};
