const requestedUrl = process.argv.find((value) => value.startsWith("http")) ?? "https://adbles.com";
const baseUrl = new URL(requestedUrl);
const findings = [];

function report(severity, scope, message, evidence) {
  findings.push({ severity, scope, message, evidence });
}

async function fetchPage(path, options = {}) {
  const url = new URL(path, baseUrl);
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15_000), ...options });
    return { url, response, text: await response.text() };
  } catch (error) {
    report("critical", url.pathname, "페이지를 확인하지 못했습니다.", error instanceof Error ? error.message : String(error));
    return null;
  }
}

function tagContent(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? "";
}

function inspectIndexablePage(path, html, options = {}) {
  const title = tagContent(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = tagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || tagContent(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical = tagContent(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
    || tagContent(html, /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);

  if (!title) report("critical", path, "title 태그가 없습니다.");
  else if (title.length > 65) report("warning", path, "제목이 검색 결과에서 잘릴 수 있습니다.", `${title.length}자: ${title}`);
  if (options.home && !/(퇴직|은퇴|생활비|지원제도|수입)/.test(title)) report("warning", path, "홈 제목에 핵심 검색 의도가 없습니다.", title);
  if (!description) report("critical", path, "meta description이 없습니다.");
  else if (description.length < 45 || description.length > 170) report("warning", path, "검색 설명 길이를 점검하세요.", `${description.length}자`);
  if (!canonical) report("critical", path, "canonical URL이 없습니다.");
  if (!/application\/ld\+json/i.test(html)) report("warning", path, "JSON-LD 구조화 데이터가 없습니다.");
}

const home = await fetchPage("/");
if (home) {
  if (!home.response.ok) report("critical", "/", "홈페이지가 정상 응답하지 않습니다.", String(home.response.status));
  inspectIndexablePage("/", home.text, { home: true });
}

const robots = await fetchPage("/robots.txt");
if (robots) {
  if (!robots.response.ok) report("critical", "robots.txt", "robots.txt가 정상 응답하지 않습니다.", String(robots.response.status));
  if (!/Sitemap:\s*https?:\/\//i.test(robots.text)) report("critical", "robots.txt", "사이트맵 위치가 선언되지 않았습니다.");
  if (/Disallow:\s*\/search\?/i.test(robots.text)) report("warning", "robots.txt", "noindex 검색 결과를 robots에서 차단하고 있습니다.", "검색로봇이 noindex를 읽을 수 있도록 쿼리 URL 차단을 제거하세요.");
  for (const crawler of ["OAI-SearchBot", "bingbot", "Yeti"]) {
    if (!robots.text.includes(crawler)) report("warning", "robots.txt", `${crawler} 관리 규칙이 명시되지 않았습니다.`);
  }
}

const sitemap = await fetchPage("/sitemap.xml");
let articlePath = "/posts/first-30-days-after-retirement";
if (sitemap) {
  if (!sitemap.response.ok) report("critical", "sitemap.xml", "사이트맵이 정상 응답하지 않습니다.", String(sitemap.response.status));
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (urls.length < 5) report("warning", "sitemap.xml", "사이트맵 URL 수가 비정상적으로 적습니다.", String(urls.length));
  if (new Set(urls).size !== urls.length) report("warning", "sitemap.xml", "중복 URL이 있습니다.");
  if (urls.some((url) => /\/(admin|api|search)(?:[/?]|$)/.test(url))) report("critical", "sitemap.xml", "비색인 URL이 사이트맵에 포함되어 있습니다.");
  const articleUrl = urls.find((url) => url.includes("/posts/"));
  if (articleUrl) articlePath = new URL(articleUrl).pathname;
}

const search = await fetchPage("/search?q=%ED%87%B4%EC%A7%81");
if (search) {
  if (!search.response.ok) report("warning", "/search", "내부 검색이 정상 응답하지 않습니다.", String(search.response.status));
  if (!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(search.text)) report("critical", "/search", "내부 검색 결과에 noindex가 없습니다.");
}

const article = await fetchPage(articlePath);
if (article) {
  if (!article.response.ok) report("critical", articlePath, "대표 글이 정상 응답하지 않습니다.", String(article.response.status));
  inspectIndexablePage(articlePath, article.text);
  if (!/"@type":"BlogPosting"/.test(article.text)) report("critical", articlePath, "BlogPosting 구조화 데이터가 없습니다.");
  if (!/"author":\{/.test(article.text)) report("critical", articlePath, "구조화 데이터에 작성자가 없습니다.");
}

const author = await fetchPage("/author");
if (author) {
  if (!author.response.ok) report("warning", "/author", "편집부 소개 페이지가 정상 응답하지 않습니다.", String(author.response.status));
  if (!/편집부장/.test(author.text) || !/AI 기반 실무자/.test(author.text)) report("warning", "/author", "편집 책임과 AI 편집자 공개 정보가 최신 작업본과 다릅니다.");
}

const wwwUrl = new URL(baseUrl);
wwwUrl.hostname = `www.${baseUrl.hostname.replace(/^www\./, "")}`;
try {
  const response = await fetch(wwwUrl, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  const location = response.headers.get("location") ?? "";
  if (![301, 302, 307, 308].includes(response.status) || !location.includes(baseUrl.hostname.replace(/^www\./, ""))) {
    report("warning", "대표 도메인", "www 호스트가 대표 도메인으로 리디렉션되지 않습니다.", `HTTP ${response.status}${location ? ` → ${location}` : ""}`);
  }
} catch (error) {
  report("warning", "대표 도메인", "www 호스트를 확인하지 못했습니다.", error instanceof Error ? error.message : String(error));
}

const order = { critical: 0, warning: 1, info: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity]);
const criticalCount = findings.filter((finding) => finding.severity === "critical").length;
const warningCount = findings.filter((finding) => finding.severity === "warning").length;

console.log(`SEO 감사: ${baseUrl.origin}`);
console.log(`치명 ${criticalCount}건 · 경고 ${warningCount}건`);
for (const finding of findings) {
  console.log(`- [${finding.severity.toUpperCase()}] ${finding.scope}: ${finding.message}${finding.evidence ? ` (${finding.evidence})` : ""}`);
}
if (findings.length === 0) console.log("- 발견된 문제가 없습니다.");

process.exitCode = criticalCount > 0 ? 1 : 0;
