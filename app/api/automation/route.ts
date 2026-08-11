import { createAutomationDraft, getPostingQueue } from "../../../lib/repository";
import { requireOwnerApi } from "../../../lib/site-admin";

export async function GET(request:Request) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try { return Response.json({ queue: await getPostingQueue() }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "발행 대기열을 불러오지 못했습니다." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    const payload = (await request.json()) as Record<string, string>;
    if (!payload.topic?.trim() || !payload.sourceUrl?.trim()) {
      return Response.json({ error: "글 주제와 공식 자료 주소를 입력하세요." }, { status: 400 });
    }
    const post = await createAutomationDraft({
      topic: payload.topic.trim(),
      category: payload.category || "정부지원·실업급여",
      sourceUrl: payload.sourceUrl.trim(),
      scheduledAt: payload.scheduledAt || null,
    });
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "자동 초안을 만들지 못했습니다." }, { status: 500 });
  }
}
