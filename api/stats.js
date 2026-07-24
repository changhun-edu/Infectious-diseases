const API_KEY = '9e644bbc9679873e697c8e70127dc6c6d1073968698887cef1fc34aba8e0a36c';
const BASE = 'https://apis.data.go.kr/1790387/EIDAPIService';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const year = (req.query && req.query.year) || '2024';

  /* /Disease — 감염병별 감염병 발생 현황
     serviceKey, resType(2=json), searchType(1=발생수),
     searchYear(연도), patntType(1=전체), pageNo, numOfRows */
  const url = BASE + '/Disease'
    + '?serviceKey=' + API_KEY
    + '&resType=2'
    + '&searchType=1'
    + '&searchYear=' + year
    + '&patntType=1'
    + '&pageNo=1&numOfRows=300';

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json, text/xml, */*' } });
    const text = await r.text();

    if (r.status === 200) {
      try {
        const json = JSON.parse(text);
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.status(200).json(json);
      } catch (e) {
        return res.status(200).json({ ok: false, parseError: e.message, status: r.status, snippet: text.slice(0, 500) });
      }
    }
    return res.status(200).json({ ok: false, status: r.status, snippet: text.slice(0, 500) });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
};
