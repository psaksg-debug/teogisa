#!/usr/bin/env node
/**
 * 이번 커밋에서 새로 발행·수정된 글의 URL만 IndexNow에 제출합니다.
 *
 * 매번 전체 URL을 다시 제출하면 검색엔진이 스팸으로 볼 수 있으므로,
 * git diff에서 실제로 바뀐 항목의 slug만 골라 보냅니다.
 *
 * 주의: IndexNow는 keyLocation에 있는 키 파일을 검증합니다. 그 주소가 다른
 * 호스트로 리다이렉트되면 제출이 거부될 수 있으므로, 제출 전에 키 파일이
 * 실제로 열리는 호스트를 확인하고 다르면 경고합니다.
 */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CONTENT_PATH = fileURLToPath(new URL("../lib/content.ts", import.meta.url));
const SITE_PATH = fileURLToPath(new URL("../lib/site.ts", import.meta.url));

export const INDEXNOW_ENDPOINTS = [
  { name: "네이버 서치어드바이저", url: "https://searchadvisor.naver.com/indexnow" },
  { name: "IndexNow.org", url: "https://api.indexnow.org/indexnow" },
  { name: "Bing", url: "https://www.bing.com/indexnow" },
];

/** git diff 출력에서 새로 추가된 줄의 slug만 뽑습니다. */
export function extractChangedSlugs(diff) {
  const slugs = new Set();
  for (const line of diff.split("\n")) {
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    for (const match of line.matchAll(/slug:"([a-z0-9-]+)"/g)) slugs.add(match[1]);
  }
  return [...slugs];
}

/** lib/content.ts에서 현재 status:"published"인 slug 목록을 돌려줍니다. */
export function publishedSlugs(source) {
  const slugs = new Set();
  for (const entry of source.split("\n  { id:")) {
    const slug = entry.match(/slug:"([a-z0-9-]+)"/);
    if (slug && /status:\s*"published"/.test(entry)) slugs.add(slug[1]);
  }
  return slugs;
}

export function buildPayload({ host, key, urls }) {
  return { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls };
}

/** 키 파일이 실제로 열리는 호스트를 확인합니다. 리다이렉트되면 그 호스트를 돌려줍니다. */
export async function resolveKeyHost(host, key, fetchImpl = fetch) {
  const url = `https://${host}/${key}.txt`;
  try {
    const response = await fetchImpl(url, { redirect: "manual" });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) return { host: new URL(location).hostname, redirected: true, status: response.status };
    }
    return { host, redirected: false, status: response.status };
  } catch (error) {
    return { host, redirected: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function gitDiff(base, head) {
  try {
    return execFileSync("git", ["diff", `${base}..${head}`, "--", "lib/content.ts"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return "";
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const argValue = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };

  const key = process.env.INDEXNOW_KEY || process.env.NAVER_INDEXNOW_KEY || "c740944f7b604e38b36e9270f2f5e182";
  const site = await readFile(SITE_PATH, "utf8");
  const siteUrl = site.match(/SITE_URL\s*=\s*"([^"]+)"/)?.[1] ?? "https://adbles.com";
  const declaredHost = new URL(siteUrl).hostname;

  const base = argValue("--base") || "HEAD~1";
  const head = argValue("--head") || "HEAD";
  const source = await readFile(CONTENT_PATH, "utf8");
  const published = publishedSlugs(source);
  const changed = extractChangedSlugs(gitDiff(base, head)).filter((slug) => published.has(slug));

  if (changed.length === 0) {
    console.log(`${base}..${head} 구간에 새로 발행된 글이 없습니다. 제출을 건너뜁니다.`);
    return;
  }

  const resolved = await resolveKeyHost(declaredHost, key);
  let host = declaredHost;
  if (resolved.redirected) {
    console.warn(`경고: 키 파일 https://${declaredHost}/${key}.txt 가 ${resolved.host} 로 ${resolved.status} 리다이렉트됩니다.`);
    console.warn(`      lib/site.ts의 SITE_URL(${siteUrl})과 실제 서비스 호스트가 어긋나 있습니다.`);
    console.warn(`      canonical·sitemap·RSS도 같은 문제를 겪습니다. 배포 도메인 설정을 확인하세요.`);
    console.warn(`      이번 제출은 키 파일이 실제로 열리는 ${resolved.host} 기준으로 보냅니다.`);
    host = resolved.host;
  } else if (resolved.error) {
    console.warn(`경고: 키 파일 확인 실패(${resolved.error}). ${declaredHost} 기준으로 진행합니다.`);
  } else if (resolved.status !== 200) {
    console.warn(`경고: 키 파일 https://${declaredHost}/${key}.txt 응답이 HTTP ${resolved.status}입니다.`);
    console.warn(`      IndexNow는 이 파일로 소유권을 확인하므로 200이 아니면 제출이 거부될 수 있습니다.`);
  }

  const urls = changed.map((slug) => `https://${host}/posts/${slug}`);
  const payload = buildPayload({ host, key, urls });
  console.log(`제출 대상 ${urls.length}건:`);
  for (const url of urls) console.log(`  ${url}`);

  if (dryRun) {
    console.log("[dry-run] 실제 전송은 하지 않습니다.");
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  let accepted = 0;
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const ok = response.status === 200 || response.status === 202;
      if (ok) accepted += 1;
      console.log(`  ${ok ? "성공" : "실패"} ${endpoint.name}: HTTP ${response.status}`);
    } catch (error) {
      console.log(`  실패 ${endpoint.name}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (accepted === 0) {
    console.error("모든 엔드포인트가 응답하지 않았습니다.");
    process.exitCode = 1;
    return;
  }
  console.log(`${INDEXNOW_ENDPOINTS.length}곳 중 ${accepted}곳이 수락했습니다.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
