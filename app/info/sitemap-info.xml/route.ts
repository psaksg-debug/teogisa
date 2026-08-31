import { getPublishedPosts } from "../../../lib/repository";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";

// 지원금·세무·연금·건강 정보만 모은 부분 사이트맵이다. 서치콘솔·서치어드바이저에
// /sitemap.xml과 별도로 제출해 이 묶음의 색인 현황을 따로 볼 수 있게 한다.
// 카테고리 기준은 /official-info의 officialSections(지원금·일자리 / 세무·신고 /
// 연금·퇴직 / 건강·보험)와 맞춘다.
const INFO_CATEGORIES = new Set([
  "정부지원·실업급여",
  "정부지원·세무",
  "연금·세금·보험",
  "건강·예방",
]);

// noindex 페이지는 넣지 않는다. /keyword-lab, /local/*, /search는 robots meta가
// index:false라 사이트맵에 실으면 서치콘솔에서 충돌로 잡힌다.
const INFO_PAGES = [
  { path: "/official-info", priority: "0.9" },
  { path: "/health", priority: "0.9" },
] as const;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** publishedAt은 "YYYY-MM-DD"다. 사이트맵 lastmod는 그 형식을 그대로 쓸 수 있다. */
function lastModified(value: string) {
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
}

export function buildInfoSitemap(posts: ReadonlyArray<{ slug: string; category: string; publishedAt: string }>) {
  const entries = [
    ...INFO_PAGES.map((page) => ({ loc: `${SITE_URL}${page.path}`, lastmod: "2026-08-14", priority: page.priority, changefreq: "monthly" })),
    ...posts
      .filter((post) => INFO_CATEGORIES.has(post.category))
      .map((post) => ({ loc: `${SITE_URL}/posts/${post.slug}`, lastmod: lastModified(post.publishedAt), priority: "0.8", changefreq: "monthly" })),
  ];
  const urls = entries.map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export async function GET() {
  const posts = await getPublishedPosts();
  return new Response(buildInfoSitemap(posts), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
