import { createPost, getAllPosts, verifyPublicationOriginality } from "@/lib/repository";
import { slugify, type PostStatus } from "@/lib/content";
import { requireOwnerApi } from "@/lib/site-admin";
import { appendSourceUrl } from "@/lib/article-enrichment";
import { articlePlainText, ensureArticleMedia, sanitizeArticleHtml } from "@/lib/article-html";
import { extractSourceUrls, OriginalityCheckError } from "@/lib/originality-check";
import { EDITOR_IN_CHIEF, getEditorialAuthor } from "@/lib/editorial-team";
import { assertTeamPermission } from "@/lib/team-permissions";

export async function GET(request: Request) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    return Response.json({ posts: await getAllPosts() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "글을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    const p = (await request.json()) as Record<string, string>;
    if (!p.title?.trim() || !p.body?.trim()) return Response.json({ error: "제목과 본문을 입력하세요." }, { status: 400 });
    const status = (p.status || "draft") as PostStatus;
    assertTeamPermission("owner", status === "published" || status === "scheduled" ? "content.publish" : "content.draft.create");
    const safeMediaBody = ensureArticleMedia(p.body);
    const body = sanitizeArticleHtml(appendSourceUrl(safeMediaBody, p.sourceUrl));
    const plainBody = articlePlainText(body);
    if (status === "published" || status === "scheduled") {
      try {
        await verifyPublicationOriginality({ body, sourceUrls: extractSourceUrls(body, p.sourceUrl), editorName: p.authorName || "데스크", title: p.title.trim() });
      } catch (origError) {
        if (origError instanceof OriginalityCheckError) {
          return Response.json({ error: origError.message }, { status: 409 });
        }
      }
    }
    const post = await createPost({
      title: p.title.trim(),
      slug: slugify(p.slug || p.title),
      excerpt: p.excerpt?.trim() || plainBody.slice(0, 120),
      body,
      category: p.category || "퇴직 준비",
      tags: (p.tags || "").split(",").map(x => x.trim()).filter(Boolean),
      status,
      publishedAt: status === "published" ? new Date().toISOString().slice(0, 10) : "",
      scheduledAt: status === "scheduled" ? p.scheduledAt || null : null,
      readingMinutes: Math.max(1, Math.ceil(plainBody.length / 700)),
      visual: p.visual?.trim() || "NEW",
      authorName: getEditorialAuthor(p.authorName || EDITOR_IN_CHIEF.name).name,
    });
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "저장하지 못했습니다." }, { status: 500 });
  }
}
