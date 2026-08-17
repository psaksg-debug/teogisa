import { deletePost, updatePost, verifyPublicationOriginality } from "@/lib/repository";
import { slugify, type PostStatus } from "@/lib/content";
import { requireOwnerApi } from "@/lib/site-admin";
import { appendSourceUrl } from "@/lib/article-enrichment";
import { ArticleMediaValidationError, articlePlainText, ensureArticleMedia, sanitizeArticleHtml, validateArticleMedia } from "@/lib/article-html";
import { extractSourceUrls, OriginalityCheckError } from "@/lib/originality-check";
import { EDITOR_IN_CHIEF, getEditorialAuthor } from "@/lib/editorial-team";
import { assertTeamPermission } from "@/lib/team-permissions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    const payload = (await request.json()) as Record<string, string>;
    const status = (payload.status || "draft") as PostStatus;
    assertTeamPermission("owner",status==="published"||status==="scheduled"?"content.publish":"content.draft.update");
    if (!payload.title?.trim() || !payload.body?.trim()) {
      return Response.json({ error: "제목과 본문을 입력하세요." }, { status: 400 });
    }
    const safeMediaBody = ensureArticleMedia(payload.body);
    if(status==="published"||status==="scheduled")validateArticleMedia(safeMediaBody);
    const body = sanitizeArticleHtml(appendSourceUrl(safeMediaBody, payload.sourceUrl));
    const plainBody = articlePlainText(body);
    if(status==="published"||status==="scheduled")await verifyPublicationOriginality({body,sourceUrls:extractSourceUrls(body,payload.sourceUrl),editorName:payload.authorName||"데스크",title:payload.title.trim(),postId:Number(id)});
    const post = await updatePost(Number(id), {
      title: payload.title.trim(),
      slug: slugify(payload.slug || payload.title),
      excerpt: payload.excerpt?.trim() || plainBody.slice(0, 120),
      body,
      category: payload.category || "퇴직 준비",
      tags: (payload.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      status,
      publishedAt: status === "published" ? (payload.publishedAt || new Date().toISOString().slice(0, 10)) : "",
      scheduledAt: status === "scheduled" ? payload.scheduledAt || null : null,
      readingMinutes: Math.max(1, Math.ceil(plainBody.length / 700)),
      visual: payload.visual?.trim() || "NEW",
      authorName: getEditorialAuthor(payload.authorName || EDITOR_IN_CHIEF.name).name,
    });
    return Response.json({ post });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "글을 수정하지 못했습니다." }, { status: error instanceof OriginalityCheckError ? 409 : error instanceof ArticleMediaValidationError ? 422 : 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    assertTeamPermission("owner", "content.publish");
    const result = await deletePost(Number(id));
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "글을 삭제하지 못했습니다." }, { status: 500 });
  }
}
