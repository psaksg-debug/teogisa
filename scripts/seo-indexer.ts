// scripts/seo-indexer.ts
// 실시간 SEO 색인 요청 (Naver IndexNow & Google Indexing API)

export async function pingSeo(url: string) {
  console.log(`[SEO Indexer] 실시간 색인 요청 시작: ${url}`);
  
  // 1. Naver / Bing IndexNow
  try {
    console.log(`  - IndexNow 핑 전송 중...`);
    const host = new URL(url).hostname;
    // IndexNow API 요구사항: host, key, keyLocation, urlList
    // (사전에 public/ 키 텍스트 파일 등록 필요)
    const indexNowKey = process.env.INDEXNOW_KEY || 'default-key'; 
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: host,
        key: indexNowKey,
        keyLocation: `https://${host}/${indexNowKey}.txt`,
        urlList: [url]
      })
    });
    if (res.ok) {
      console.log(`  - IndexNow 전송 성공`);
    } else {
      console.error(`  - IndexNow 전송 실패: HTTP ${res.status}`);
    }
  } catch (error) {
    console.error(`  - IndexNow 전송 실패:`, error);
  }

  // 2. Google Search Console
  try {
    console.log(`  - Google Indexing API 핑 전송 준비...`);
    // Google API requires OAuth2 JWT with a Service Account.
    // For now, ping Google to crawl the sitemap as a lightweight alternative
    const sitemapUrl = `https://${new URL(url).hostname}/sitemap.xml`;
    const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    if (googleRes.ok) {
      console.log(`  - Google Sitemap Ping 전송 성공`);
    } else {
      console.error(`  - Google Sitemap Ping 실패: HTTP ${googleRes.status}`);
    }
  } catch (error) {
    console.error(`  - Google Indexing 전송 실패:`, error);
  }
}
