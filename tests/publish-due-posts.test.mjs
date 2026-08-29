import assert from "node:assert/strict";
import test from "node:test";

import { findEntryRange, publishEntry } from "../scripts/publish-due-posts.mjs";

/** lib/content.ts와 같은 모양의 픽스처. body는 백틱 템플릿 리터럴입니다. */
const FIXTURE = [
  "export const seedPosts: Post[] = [",
  '  { id:1, title:"첫 글", slug:"first-post", excerpt:"요약", body:`<p>본문</p>`, category:"퇴직 준비", tags:["a"], status:"published", publishedAt:"2026-08-01", scheduledAt:null, readingMinutes:5, visual:"A" },',
  '  { id:2, title:"예약 글", slug:"scheduled-post", excerpt:"요약", body:`<p>예약 발행을 설명하면서 status:"scheduled" 와 scheduledAt:"2000-01-01" 을 본문에 그대로 적습니다.</p>`, category:"재취업·N잡", tags:["b"], status:"scheduled", publishedAt:"2026-08-20", scheduledAt:"2026-08-25T21:00:00.000Z", readingMinutes:6, visual:"B" },',
  '  { id:3, title:"마지막 글", slug:"last-post", excerpt:"요약", body:`<p>본문</p>`, category:"정부지원·실업급여", tags:["c"], status:"published", publishedAt:"2026-08-02", scheduledAt:null, readingMinutes:7, visual:"C" },',
  "];",
  "",
].join("\n");

test("findEntryRange는 해당 항목만 정확히 잘라낸다", () => {
  const range = findEntryRange(FIXTURE, "scheduled-post");
  assert.ok(range);
  const entry = FIXTURE.slice(range.start, range.end);
  assert.match(entry, /^ {2}\{ id:2,/);
  assert.match(entry, /visual:"B" \},$/);
  assert.doesNotMatch(entry, /first-post/);
  assert.doesNotMatch(entry, /last-post/);

  const last = findEntryRange(FIXTURE, "last-post");
  assert.ok(last);
  const lastEntry = FIXTURE.slice(last.start, last.end);
  assert.match(lastEntry, /^ {2}\{ id:3,/);
  assert.match(lastEntry, /visual:"C" \},$/);
  assert.doesNotMatch(lastEntry, /\n\];/);
});

test("publishEntry는 예약 항목을 발행 상태로 바꾼다", () => {
  const now = new Date("2026-08-26T21:00:00.000Z");
  const result = publishEntry(FIXTURE, "scheduled-post", now);
  assert.equal(result.changed, true);

  const range = findEntryRange(result.source, "scheduled-post");
  const entry = result.source.slice(range.start, range.end);
  assert.match(entry, /status:"published"/);
  assert.match(entry, new RegExp(`publishedAt:"${now.toISOString()}"`));
  assert.match(entry, /scheduledAt:null/);

  // 다른 항목은 그대로여야 합니다.
  assert.equal(
    result.source.slice(findEntryRange(result.source, "first-post").start, findEntryRange(result.source, "first-post").end),
    FIXTURE.slice(findEntryRange(FIXTURE, "first-post").start, findEntryRange(FIXTURE, "first-post").end),
  );
});

test("본문 안의 status:\"scheduled\" 문자열은 건드리지 않는다", () => {
  const result = publishEntry(FIXTURE, "scheduled-post", new Date("2026-08-26T21:00:00.000Z"));
  assert.equal(result.changed, true);

  const range = findEntryRange(result.source, "scheduled-post");
  const entry = result.source.slice(range.start, range.end);
  const body = entry.slice(entry.indexOf("body:`"), entry.indexOf("`,", entry.indexOf("body:`")));
  assert.match(body, /status:"scheduled"/);
  assert.match(body, /scheduledAt:"2000-01-01"/);

  // 필드 자리에서는 한 번씩만 바뀌어야 합니다.
  assert.equal((entry.match(/status:"published"/g) ?? []).length, 1);
  assert.equal((entry.match(/status:"scheduled"/g) ?? []).length, 1);
  assert.equal((entry.match(/scheduledAt:null/g) ?? []).length, 1);
});

test("없는 slug와 이미 발행된 글은 변경 없이 사유를 돌려준다", () => {
  const missing = publishEntry(FIXTURE, "no-such-post");
  assert.equal(missing.changed, false);
  assert.equal(missing.reason, "not-found");
  assert.equal(missing.source, FIXTURE);
  assert.equal(findEntryRange(FIXTURE, "no-such-post"), null);

  const alreadyPublished = publishEntry(FIXTURE, "first-post");
  assert.equal(alreadyPublished.changed, false);
  assert.equal(alreadyPublished.reason, "not-scheduled");
  assert.equal(alreadyPublished.source, FIXTURE);
});
