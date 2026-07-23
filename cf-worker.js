/**
 * Cloudflare Workers CORS 프록시
 * 감염병 등교중지 안내 앱 — 질병관리청 API 중계
 *
 * 배포 방법:
 * 1. https://workers.cloudflare.com 접속 (무료 가입)
 * 2. "Create Worker" 클릭
 * 3. 이 파일 내용 전체를 붙여넣기
 * 4. "Save and Deploy" 클릭
 * 5. 발급된 Worker URL(예: https://disease-proxy.XXX.workers.dev)을
 *    index.html 의 PROXY_BASE 상수에 입력
 */

const ALLOWED_ORIGIN = '*'; // 필요 시 자신의 GitHub Pages 도메인으로 제한
const TARGET_BASE = 'https://apis.data.go.kr';

export default {
  async fetch(request) {
    // CORS 프리플라이트 대응
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    // /proxy?path=... 형태로 경로 수신
    const targetPath = url.searchParams.get('path');
    if (!targetPath) {
      return new Response('path 파라미터가 필요합니다', { status: 400 });
    }

    const targetUrl = TARGET_BASE + targetPath;

    try {
      const res = await fetch(targetUrl, {
        headers: { 'Accept': 'application/json' },
      });
      const body = await res.text();

      return new Response(body, {
        status: res.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Cache-Control': 'public, max-age=3600', // 1시간 캐시
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    }
  },
};
