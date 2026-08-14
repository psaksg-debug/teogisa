import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders the finished Korean content site", async () => {
  const [page, layout, search, article, media, enrichment, footer, site, css, richEditor, articleHtml] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/posts/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ArticleMedia.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/article-enrichment.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/RichTextEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/article-html.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /퇴직하고 부자되기/);
  assert.match(page, /퇴직은 끝이 아니라/);
  assert.match(page, /공식 자료 검토/);
  assert.match(page, /월 목표 현금흐름/);
  assert.match(page, /본문으로 바로가기/);
  assert.match(page, /hero-facts/);
  assert.match(page, /mobile-home-nav/);
  assert.match(css, /trust-band/);
  assert.match(css, /grid-template-columns:1\.18fr \.82fr/);
  assert.match(layout, /og-v2\.png/);
  assert.match(footer, /운영사/);
  assert.match(footer, /애드블스가 운영합니다/);
  assert.match(site, /Adbles\.com/);
  assert.match(css, /footer-company/);
  assert.match(layout, /fonts\.googleapis\.com\/css2/);
  assert.match(layout, /Noto\+Sans\+KR/);
  assert.equal((layout.match(/google-adsense-account/g) ?? []).length, 1);
  assert.match(layout, /<meta name="google-adsense-account" content="ca-pub-4030620718116834"\/>/);
  assert.match(media, /ArticleThumbnail/);
  assert.match(media, /AUTOMATIC READING GUIDE/);
  assert.match(enrichment, /wikipedia\.org/);
  assert.match(enrichment, /article-thumbnails/);
  assert.match(media, /alt=\{image\.alt\}/);
  assert.match(enrichment, /thumbnailCatalog/);
  assert.match(enrichment, /체크 표시가 된 퇴직 준비 체크리스트/);
  assert.match(media, /loading=\{variant === "hero" \? "eager" : "lazy"\}/);
  assert.match(css, /object-fit:cover/);
  assert.match(css, /object-fit:contain/);
  assert.match(css, /article-flow/);
  assert.match(search, /<a href={`\/posts\/\$\{p\.slug\}`}/);
  assert.match(article, /<a href={`\/posts\/\$\{item\.slug\}`}/);
  assert.match(article, /className="glossary-link"/);
  assert.match(article, /linkGlossaryTerms/);
  assert.doesNotMatch(media, /어려운 용어/);
  assert.match(css, /glossary-link:hover/);
  assert.match(richEditor, /HTML 보기/);
  assert.match(richEditor, /링크 카드·영상/);
  assert.match(richEditor, /addImage/);
  assert.match(richEditor, /addTable/);
  assert.match(article, /renderRichBody/);
  assert.match(articleHtml, /sanitizeArticleHtml/);
  assert.match(articleHtml, /blockedElements/);
  assert.match(articleHtml, /youtube-nocookie/);
  assert.doesNotMatch(`${page}\n${search}\n${article}\n${footer}`, /next\/link|<Link/);
  assert.doesNotMatch(`${page}\n${layout}`, /codex-preview|react-loading-skeleton/i);
});

test("keeps the independent editor and write APIs session-protected", async () => {
  const [adminPage, adminClient, loginPage, sessionRoute, siteAdmin, postsApi, postUpdateApi, exportApi, automationApi] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/session/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/site-admin.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/posts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/posts/[id]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/export/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/automation/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(adminPage, /getAdminSession/);
  assert.match(loginPage, /독립 편집실 로그인/);
  assert.match(sessionRoute, /authenticateAdmin/);
  assert.match(siteAdmin, /PBKDF2/);
  assert.match(siteAdmin, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(siteAdmin, /ADMIN_PASSWORD_HASH/);
  assert.doesNotMatch(`${adminPage}\n${sessionRoute}\n${siteAdmin}`, /getChatGPTUser|requireChatGPTUser|hardcoded-password/);
  assert.match(adminPage, /force-dynamic/);
  assert.match(postsApi, /requireOwnerApi/);
  assert.match(postsApi, /appendSourceUrl/);
  assert.match(postUpdateApi, /appendSourceUrl/);
  assert.match(adminClient, /공식자료 주소/);
  assert.match(adminClient, /전용 썸네일/);
  assert.match(adminClient, /function openEditor\(post: Post\)/);
  assert.match(adminClient, /scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.match(adminClient, /aria-label={`\$\{post\.title\} 글 편집하기`}/);
  assert.match(adminClient, /new URLSearchParams\(window\.location\.search\)\.get\("post"\)/);
  assert.match(exportApi, /requireOwnerApi/);
  assert.match(automationApi, /requireOwnerApi/);
});

test("ships mobile-first SEO, GEO, trust and original-value pages", async () => {
  const [layout, post, sitemap, robots, llms, calculator, privacy, policy, css] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/posts/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../app/tools/retirement-runway/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/editorial-policy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /max-image-preview/);
  assert.match(post, /BlogPosting/);
  assert.match(post, /ImageObject/);
  assert.match(post, /thumbnailUrl/);
  assert.match(post, /BreadcrumbList/);
  assert.match(post, /related-posts/);
  assert.match(sitemap, /retirement-runway/);
  assert.match(sitemap, /images:/);
  assert.match(robots, /GPTBot/);
  assert.match(llms, /대표 가이드/);
  assert.match(calculator, /입력값은 저장하지 않습니다/);
  assert.match(privacy, /개인정보처리방침/);
  assert.match(policy, /AI 초안은 검토 후 발행/);
  assert.match(css, /scroll-snap-type:x mandatory/);
  assert.match(css, /overflow-x:hidden/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(css, /iPhone article rendering guard/);
  assert.match(css, /-webkit-text-size-adjust:100%/);
  assert.match(css, /padding-left:max\(18px,env\(safe-area-inset-left\)\)/);
  assert.match(css, /\.related-posts \.thumbnail-search\{width:100%;height:126px;margin:0 0 20px\}/);
  assert.match(css, /font-family:"Noto Sans KR","Apple SD Gothic Neo",-apple-system/);
});
