#!/usr/bin/env node
/**
 * 예약(status:"scheduled") 글 중 scheduledAt이 지난 항목을 발행 상태로 바꿉니다.
 *
 * lib/content.ts의 body는 백틱 템플릿 리터럴이라 본문 안에도 status:"scheduled"
 * 같은 문자열이 그대로 들어 있을 수 있습니다. 파일 전체를 정규식으로 치환하면
 * 본문이 망가지므로, slug로 항목의 시작·끝 경계를 먼저 잡고 그 범위 안에서만
 * 치환합니다. 필드는 body 뒤에 오므로 각 필드는 항목 안의 "마지막" 매치를 씁니다.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const CONTENT_PATH = fileURLToPath(new URL("../lib/content.ts", import.meta.url));

/** 항목 시작 경계. seedPosts의 한 줄짜리 항목은 모두 이 형태로 시작합니다. */
const ENTRY_START = "\n  { id:";
/** 끝 경계 후보: 다음 한 줄 항목, 여러 줄 항목, 배열 종료. */
const ENTRY_END_MARKERS = ["\n  { id:", "\n  {\n", "\n];"];

/**
 * slug를 가진 항목의 [start, end) 범위를 돌려줍니다. 못 찾으면 null.
 */
export function findEntryRange(source, slug) {
  const slugIndex = source.indexOf(`slug:"${slug}"`);
  if (slugIndex === -1) return null;
  const start = source.lastIndexOf(ENTRY_START, slugIndex);
  if (start === -1) return null;
  const ends = ENTRY_END_MARKERS
    .map((marker) => source.indexOf(marker, slugIndex))
    .filter((index) => index !== -1);
  if (ends.length === 0) return null;
  return { start: start + 1, end: Math.min(...ends) };
}

/** 항목 안에서 패턴의 마지막 매치만 replacer 결과로 바꿉니다. 매치가 없으면 null. */
function replaceLastMatch(entry, pattern, replacer) {
  const regex = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  let last = null;
  let match;
  while ((match = regex.exec(entry)) !== null) {
    last = match;
    if (match.index === regex.lastIndex) regex.lastIndex += 1;
  }
  if (!last) return null;
  return entry.slice(0, last.index) + replacer(last) + entry.slice(last.index + last[0].length);
}

const STATUS_SCHEDULED = /status:(\s*)"scheduled"/;
const PUBLISHED_AT = /publishedAt:(\s*)"[^"]*"/;
const SCHEDULED_AT = /scheduledAt:(\s*)("[^"]*"|null)/;

/**
 * slug 항목을 발행 상태로 바꾼 새 소스를 돌려줍니다.
 * @returns {{changed:boolean, source:string, reason?:string}}
 */
export function publishEntry(source, slug, now = new Date()) {
  const range = findEntryRange(source, slug);
  if (!range) return { changed: false, source, reason: "not-found" };

  const entry = source.slice(range.start, range.end);
  let updated = replaceLastMatch(entry, STATUS_SCHEDULED, (m) => `status:${m[1]}"published"`);
  if (updated === null) return { changed: false, source, reason: "not-scheduled" };

  const publishedAt = now.toISOString();
  const withPublishedAt = replaceLastMatch(updated, PUBLISHED_AT, (m) => `publishedAt:${m[1]}"${publishedAt}"`);
  if (withPublishedAt !== null) updated = withPublishedAt;

  const withScheduledAt = replaceLastMatch(updated, SCHEDULED_AT, (m) => `scheduledAt:${m[1]}null`);
  if (withScheduledAt !== null) updated = withScheduledAt;

  return { changed: true, source: source.slice(0, range.start) + updated + source.slice(range.end) };
}

/** 한 줄짜리 seedPosts 항목들을 훑어 slug/status/scheduledAt을 뽑습니다. */
export function listScheduledEntries(source) {
  const entries = [];
  let cursor = source.indexOf(ENTRY_START);
  while (cursor !== -1) {
    const ends = ENTRY_END_MARKERS
      .map((marker) => source.indexOf(marker, cursor + ENTRY_START.length))
      .filter((index) => index !== -1);
    const end = ends.length ? Math.min(...ends) : source.length;
    const entry = source.slice(cursor + 1, end);
    const slug = entry.match(/slug:"([^"]+)"/);
    if (slug && STATUS_SCHEDULED.test(entry)) {
      const scheduledAt = entry.match(/scheduledAt:\s*"([^"]*)"(?![\s\S]*scheduledAt:\s*")/);
      entries.push({ slug: slug[1], scheduledAt: scheduledAt ? scheduledAt[1] : null });
    }
    cursor = source.indexOf(ENTRY_START, cursor + ENTRY_START.length);
  }
  return entries;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const now = new Date();
  const original = await readFile(CONTENT_PATH, "utf8");

  const scheduled = listScheduledEntries(original);
  const due = scheduled.filter((entry) => {
    if (!entry.scheduledAt) return false;
    const at = new Date(entry.scheduledAt);
    return !Number.isNaN(at.getTime()) && at.getTime() <= now.getTime();
  });

  console.log(`기준 시각: ${now.toISOString()}`);
  console.log(`예약 글 ${scheduled.length}편 중 발행 대상 ${due.length}편`);

  let source = original;
  const published = [];
  for (const entry of due) {
    const result = publishEntry(source, entry.slug, now);
    if (result.changed) {
      source = result.source;
      published.push(entry.slug);
      console.log(`  발행: ${entry.slug} (예약 ${entry.scheduledAt})`);
    } else {
      console.warn(`  건너뜀: ${entry.slug} (${result.reason})`);
    }
  }

  if (source === original) {
    console.log("변경 없음.");
    return;
  }
  if (dryRun) {
    console.log(`[dry-run] ${published.length}편을 발행했을 것입니다. 파일은 그대로 둡니다.`);
    return;
  }
  await writeFile(CONTENT_PATH, source);
  console.log(`lib/content.ts 업데이트 완료: ${published.length}편 발행.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
