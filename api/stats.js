/**
 * Vercel Serverless Function — 질병관리청 API 프록시
 * 파일 위치: /api/stats.js
 *
 * 배포 방법:
 * 1. GitHub 저장소에 index.html과 함께 /api/stats.js 업로드
 * 2. vercel.com 에서 해당 저장소 import
 * 3. Region을 icn1 (Seoul)로 설정
 * 4. Deploy
 */

const API_KEY = '9e644bbc9679873e697c8e70127dc6c6d1073968698887cef1fc34aba8e0a36c';
const API_BASE = 'https://apis.data.go.kr/1790387/infectdiseasestats/infectdiseasestatsservice/getInfectdiseaseStats';

export default async function handler(req, res) {
  /* CORS 헤더 */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ ok: false, error: 'year, month 파라미터가 필요합니다' });
  }

  const apiUrl = `${API_BASE}?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=1&numOfRows=100&resultType=json&year=${year}&month=${month}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message });
  }
}
