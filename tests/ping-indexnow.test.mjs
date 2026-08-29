import assert from "node:assert/strict";
import test from "node:test";

import { buildPayload, extractChangedSlugs, publishedSlugs, resolveKeyHost, INDEXNOW_ENDPOINTS } from "../scripts/ping-indexnow.mjs";

const DIFF = [
  "diff --git a/lib/content.ts b/lib/content.ts",
  "--- a/lib/content.ts",
  "+++ b/lib/content.ts",
  '-  { id:9, title:"삭제된 글", slug:"removed-post", status:"published" },',
  '+  { id:10, title:"새 글", slug:"brand-new-post", excerpt:"요약", status:"published" },',
  '+  { id:11, title:"예약 글", slug:"still-scheduled-post", excerpt:"요약", status:"scheduled" },',
  " 변경 없는 줄 slug:\"untouched-post\"",
].join("\n");

const CONTENT = [
  '  { id:10, title:"새 글", slug:"brand-new-post", body:`<p>본문</p>`, status:"published", publishedAt:"2026-08-29" },',
  '  { id:11, title:"예약 글", slug:"still-scheduled-post", body:`<p>본문</p>`, status:"scheduled", publishedAt:"2026-09-01" },',
  '  { id:12, title:"기존 글", slug:"untouched-post", body:`<p>본문</p>`, status:"published", publishedAt:"2026-08-01" },',
].join("\n");

test("추가된 줄의 slug만 뽑고 삭제·문맥 줄은 무시한다", () => {
  const slugs = extractChangedSlugs(DIFF);
  assert.deepEqual(slugs.sort(), ["brand-new-post", "still-scheduled-post"]);
  assert.ok(!slugs.includes("removed-post"), "삭제된 줄은 제외해야 한다");
  assert.ok(!slugs.includes("untouched-post"), "변경 없는 문맥 줄은 제외해야 한다");
  assert.deepEqual(extractChangedSlugs(""), []);
});

test("발행 상태인 slug만 제출 대상이 된다", () => {
  const published = publishedSlugs("\n  { id:" + CONTENT.replace(/^ {2}\{ id:/, ""));
  assert.ok(published.has("brand-new-post"));
  assert.ok(published.has("untouched-post"));
  assert.ok(!published.has("still-scheduled-post"), "예약 글은 아직 제출하면 안 된다");

  const submitted = extractChangedSlugs(DIFF).filter((slug) => published.has(slug));
  assert.deepEqual(submitted, ["brand-new-post"]);
});

test("payload는 IndexNow 규격대로 host·key·keyLocation·urlList를 담는다", () => {
  const payload = buildPayload({ host: "adbles.com", key: "abc123", urls: ["https://adbles.com/posts/a"] });
  assert.deepEqual(payload, {
    host: "adbles.com",
    key: "abc123",
    keyLocation: "https://adbles.com/abc123.txt",
    urlList: ["https://adbles.com/posts/a"],
  });
  assert.equal(INDEXNOW_ENDPOINTS.length, 3);
  for (const endpoint of INDEXNOW_ENDPOINTS) assert.match(endpoint.url, /^https:\/\/.+\/indexnow$/);
});

test("키 파일이 다른 호스트로 리다이렉트되면 그 호스트를 알려준다", async () => {
  const redirecting = async () => ({
    status: 308,
    headers: { get: (name) => (name === "location" ? "https://www.adbles.com/abc123.txt" : null) },
  });
  assert.deepEqual(await resolveKeyHost("adbles.com", "abc123", redirecting), {
    host: "www.adbles.com",
    redirected: true,
    status: 308,
  });

  const ok = async () => ({ status: 200, headers: { get: () => null } });
  assert.deepEqual(await resolveKeyHost("adbles.com", "abc123", ok), {
    host: "adbles.com",
    redirected: false,
    status: 200,
  });
});
