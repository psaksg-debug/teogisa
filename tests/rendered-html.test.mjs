import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders the finished Korean content site", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /퇴직하고 부자되기/);
  assert.match(page, /퇴직은 끝이 아니라/);
  assert.match(page, /공식 자료 검토/);
  assert.match(page, /월 목표 현금흐름/);
  assert.match(css, /trust-band/);
  assert.doesNotMatch(`${page}\n${layout}`, /codex-preview|react-loading-skeleton/i);
});

test("keeps the editor and write APIs owner-protected", async () => {
  const [adminPage, postsApi, exportApi, automationApi] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/posts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/export/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/automation/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(adminPage, /requireSiteOwner/);
  assert.match(adminPage, /force-dynamic/);
  assert.match(postsApi, /requireOwnerApi/);
  assert.match(exportApi, /requireOwnerApi/);
  assert.match(automationApi, /requireOwnerApi/);
});
