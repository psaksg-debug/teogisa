import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders the finished Korean content site", async () => {
  const [page, layout, search, article, media, enrichment, footer, mobileMenu, site, css, richEditor, articleHtml] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/posts/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ArticleMedia.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/article-enrichment.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MobileMenu.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/RichTextEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/article-html.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /퇴직생활 수익화 프로젝트/);
  assert.match(page, /퇴직 후 막막함을/);
  assert.match(page, /내 돈이 몇 달을 버틸지 계산하고/);
  assert.doesNotMatch(page, /공식 자료 검토/);
  assert.match(page, /project-hero-v2\.jpg/);
  assert.match(page, /hero-project-visual/);
  assert.match(page, /본문으로 바로가기/);
  assert.match(page, /hero-facts/);
  assert.match(page, /ContactPoint/);
  assert.match(page, /master@adbles\.com/);
  assert.match(page, /MobileMenu/);
  assert.match(mobileMenu, /전체 메뉴 열기/);
  assert.match(mobileMenu, /월 100만원 챌린지/);
  assert.match(mobileMenu, /지원금·세무·연금/);
  assert.match(mobileMenu, /유용한 도구/);
  assert.match(mobileMenu, /건강·예방/);
  assert.match(css, /mobile-menu-drawer/);
  assert.match(css, /trust-band/);
  assert.match(css, /grid-template-columns:1\.18fr \.82fr/);
  assert.match(layout, /project-og-v2\.jpg/);
  assert.match(footer, /brand-mark-v2\.png/);
  assert.match(css, /heroImageDrift/);
  assert.match(footer, /운영사/);
  assert.match(footer, /관리자<\/span><strong>어썸라이프/);
  assert.match(footer, /mailto:master@adbles\.com/);
  assert.match(footer, /개인정보처리방침/);
  assert.match(footer, /광고·이용 안내/);
  assert.match(footer, /이용약관/);
  assert.match(footer, /문의·오류 제보/);
  assert.match(footer, /애드블스가 운영합니다/);
  assert.match(site, /Adbles\.com/);
  assert.match(css, /footer-contact/);
  assert.match(layout, /fonts\.googleapis\.com\/css2/);
  assert.match(layout, /Noto\+Sans\+KR/);
  assert.equal((layout.match(/google-adsense-account/g) ?? []).length, 1);
  assert.match(layout, /<meta name="google-adsense-account" content="ca-pub-4030620718116834"\/>/);
  assert.match(media, /ArticleThumbnail/);
  assert.match(media, /읽기 전에 한눈에/);
  assert.doesNotMatch(media, /자동 구성된/);
  assert.match(enrichment, /wikipedia\.org/);
  assert.match(enrichment, /categoryOfficialLinks/);
  assert.match(enrichment, /z08sPVTv39M/);
  assert.match(media, /관련 공식 영상/);
  assert.match(enrichment, /youtube-nocookie/);
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

test("ships the challenge, official information, tools, health and agent desks", async()=>{
  const [home,chrome,challenge,workbook,official,portal,tools,severance,health,keyword,localPage,agentsApi,agentsData,repository,admin,sitemap]=await Promise.all([
    readFile(new URL("../app/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/components/SiteChrome.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/challenge/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/challenge/ChallengeWorkbook.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/official-info/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../lib/portal.ts",import.meta.url),"utf8"),
    readFile(new URL("../app/tools/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/tools/severance-pay/SeveranceCalculator.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/health/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/keyword-lab/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/local/[region]/[topic]/page.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/api/agents/route.ts",import.meta.url),"utf8"),
    readFile(new URL("../lib/content-agents.ts",import.meta.url),"utf8"),
    readFile(new URL("../lib/repository.ts",import.meta.url),"utf8"),
    readFile(new URL("../app/admin/AdminClient.tsx",import.meta.url),"utf8"),
    readFile(new URL("../app/sitemap.ts",import.meta.url),"utf8"),
  ]);
  assert.match(home,/30일 수입 챌린지/);
  assert.match(chrome,/portalMenu/);
  assert.match(challenge,/내 경험으로 월 100만원 수입에 도전하기/);
  assert.match(workbook,/30일 실행 워크북/);
  assert.match(workbook,/localStorage/);
  assert.match(official,/officialSections/);
  assert.match(portal,/국세법령정보시스템/);
  assert.match(tools,/toolCatalog/);
  assert.match(portal,/이미지 변환기/);
  assert.match(severance,/예상 퇴직금/);
  assert.match(health,/youtube-nocookie\.com/);
  assert.match(health,/갑작스러운 위험 신호는 119/);
  assert.match(health,/이번 달 건강 점검/);
  assert.match(keyword,/우리 동네에서 시작할 수 있는 일과 지원/);
  assert.match(keyword,/index:false/);
  assert.match(localPage,/전화하기 전에 준비하면 좋은 질문/);
  assert.match(localPage,/index:false/);
  assert.match(agentsApi,/requireOwnerApi/);
  assert.match(agentsData,/health-column/);
  assert.match(repository,/runDueContentAgents/);
  assert.match(repository,/status:"published"/);
  assert.match(repository,/공식 링크·사례·표·체크리스트 품질 기준을 통과해 자동 발행했습니다/);
  assert.match(repository,/콘텐츠 품질 기준을 충족하지 못해 발행하지 않았습니다/);
  assert.match(repository,/CONTENT_QUALITY_REVISION/);
  assert.match(repository,/preparePromotionCampaign/);
  assert.match(repository,/promotion_campaigns/);
  assert.doesNotMatch(repository,/tags:\[agent\.name,"공식 자료","검토 초안"\]/);
  assert.match(admin,/분야별 에이전트 운영실/);
  assert.match(admin,/자동 발행 주기/);
  assert.match(admin,/지금 발행하기/);
  assert.match(admin,/품질 기준에 미달하면 발행하지 않고 실패 기록으로 남깁니다/);
  assert.match(admin,/홍보 에이전트 작업실/);
  assert.match(admin,/SNS용 짧은 문구/);
  assert.match(admin,/게시 완료로 표시/);
  assert.match(sitemap,/challenge/);
  assert.doesNotMatch(sitemap,/keyword-lab/);
});

test("keeps the independent editor and write APIs session-protected", async () => {
  const [adminPage, adminClient, loginPage, sessionRoute, siteAdmin, postsApi, postUpdateApi, exportApi, automationApi, promotionsApi] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/session/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/site-admin.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/posts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/posts/[id]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/export/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/automation/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/promotions/route.ts", import.meta.url), "utf8"),
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
  assert.match(promotionsApi, /requireOwnerApi/);
  assert.match(promotionsApi, /executePromotionCampaign/);
});

test("ships mobile-first SEO, GEO, trust and original-value pages", async () => {
  const [layout, post, sitemap, robots, llms, ads, calculator, privacy, policy, chrome, css, contact, terms, author, content, repository] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/posts/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../public/ads.txt", import.meta.url), "utf8"),
    readFile(new URL("../app/tools/retirement-runway/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/editorial-policy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteChrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/contact/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/author/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/repository.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /max-image-preview/);
  assert.match(post, /BlogPosting/);
  assert.match(post, /ImageObject/);
  assert.match(post, /thumbnailUrl/);
  assert.match(post, /BreadcrumbList/);
  assert.match(post, /wordCount/);
  assert.match(post, /citation/);
  assert.match(post, /related-posts/);
  assert.match(sitemap, /retirement-runway/);
  assert.match(sitemap, /images:/);
  assert.match(robots, /GPTBot/);
  assert.match(llms, /대표 가이드/);
  assert.match(llms, /https:\/\/adbles\.com\/challenge/);
  assert.match(ads, /google\.com, pub-4030620718116834, DIRECT, f08c47fec0942fa0/);
  assert.match(calculator, /입력값은 저장하지 않습니다/);
  assert.match(privacy, /개인정보처리방침/);
  assert.match(privacy, /Google 광고와 쿠키/);
  assert.match(privacy, /동의 안내와 맞춤 광고 선택/);
  assert.match(contact, /콘텐츠 오류와 끊어진 링크/);
  assert.match(contact, /master@adbles\.com/);
  assert.match(terms, /정보와 계산 결과의 한계/);
  assert.match(author, /책임 편집자는 어썸라이프/);
  assert.match(sitemap, /contact/);
  assert.match(sitemap, /terms/);
  assert.match(content, /unemployment-benefit-eight-steps/);
  assert.match(content, /월별 장부에는 일곱 칸/);
  assert.match(content, /90일 동안 매주 같은 숫자를 기록합니다/);
  assert.match(repository, /adsense-readiness-v2/);
  assert.match(policy, /창작 과정에서 AI를 보조적으로 사용합니다/);
  assert.match(chrome, /WebPage/);
  assert.match(chrome, /BreadcrumbList/);
  assert.match(css, /scroll-snap-type:x mandatory/);
  assert.match(css, /overflow-x:hidden/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(css, /iPhone article rendering guard/);
  assert.match(css, /-webkit-text-size-adjust:100%/);
  assert.match(css, /padding-left:max\(18px,env\(safe-area-inset-left\)\)/);
  assert.match(css, /\.related-posts \.thumbnail-search\{width:100%;height:126px;margin:0 0 20px\}/);
  assert.match(css, /font-family:"Noto Sans KR","Apple SD Gothic Neo",-apple-system/);
});
