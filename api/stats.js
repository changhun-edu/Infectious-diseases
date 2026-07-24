const API_KEY = '9e644bbc9679873e697c8e70127dc6c6d1073968698887cef1fc34aba8e0a36c';
const BASE = 'https://apis.data.go.kr/1790387/EIDAPIService';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const mode = (req.query && req.query.mode) || 'disease';
  const year = (req.query && req.query.year) || '2024';
  const startYear = (req.query && req.query.startYear) || String(Number(year) - 2);

  let url;

  if (mode === 'period') {
    /* /PeriodBasic — 기간별 감염병 발생 현황 (월별)
       파라미터: gubun(분류), periodType(기간분류), searchStartYear, searchEndYear */
    url = BASE + '/PeriodBasic'
      + '?serviceKey=' + API_KEY
      + '&resType=2'
      + '&gubun=1'            /* 1: 미선택 */
      + '&periodType=2'       /* 1:연도별 2:월별 3:주별 */
      + '&searchStartYear=' + startYear
      + '&searchEndYear=' + year
      + '&pageNo=1&numOfRows=1000';
  } else {
    /* /Disease — 감염병별 발생 현황 (연도별) */
    url = BASE + '/Disease'
      + '?serviceKey=' + API_KEY
      + '&resType=2'
      + '&searchType=1'
      + '&searchYear=' + year
      + '&patntType=1'
      + '&pageNo=1&numOfRows=300';
  }

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json, text/xml, */*' } });
    const text = await r.text();

    if (r.status === 200) {
      try {
        const json = JSON.parse(text);
        res.setHeader('Cache-Control', 'public, max-age=21600, s-maxage=21600');
        return res.status(200).json(json);
      } catch (e) {
        return res.status(200).json({ ok: false, mode, parseError: e.message, snippet: text.slice(0, 600) });
      }
    }
    return res.status(200).json({ ok: false, mode, status: r.status, snippet: text.slice(0, 600) });
  } catch (e) {
    return res.status(200).json({ ok: false, mode, error: e.message });
  }
};
