import { updatePost } from "../../../../lib/repository";
import { slugify, type PostStatus } from "../../../../lib/content";
import { requireOwnerApi } from "../../../../lib/site-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    const payload = (await request.json()) as Record<string, string>;
    const status = (payload.status || "draft") as PostStatus;
    if (!payload.title?.trim() || !payload.body?.trim()) {
      return Response.json({ error: "제목과 본문을 입력하세요." }, { status: 400 });
    }
    const post = await updatePost(Number(id), {
      title: payload.title.trim(),
      slug: slugify(payload.slug || payload.title),
      excerpt: payload.excerpt?.trim() || payload.body.trim().slice(0, 120),
      body: payload.body.trim(),
      category: payload.category || "퇴직 준비",
      tags: (payload.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      status,
      publishedAt: status === "published" ? (payload.publishedAt || new Date().toISOString().slice(0, 10)) : "",
      scheduledAt: status === "scheduled" ? payload.scheduledAt || null : null,
      readingMinutes: Math.max(1, Math.ceil(payload.body.length / 700)),
      visual: payload.visual?.trim() || "NEW",
    });
    return Response.json({ post });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "글을 수정하지 못했습니다." }, { status: 500 });
  }
}
