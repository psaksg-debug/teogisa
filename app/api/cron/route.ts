import { runScheduledOrganizationActivities, publishDuePosts } from "../../../lib/repository";
import { getAdminSession } from "../../../lib/site-admin";
import { ADMIN_ENABLED, disabledSurfaceResponse } from "../../../lib/feature-flags";

export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

// 이 엔드포인트는 모든 초안을 즉시 공개하고 전 자동화를 실행하므로 공개 상태로 두면
// 주소를 아는 누구나 발행을 강제할 수 있다.
// Vercel Cron은 CRON_SECRET 환경변수가 등록돼 있을 때만 Authorization: Bearer $CRON_SECRET을
// 붙여 보낸다. 등록 전에 차단하면 자동화가 조용히 멈추므로, 비밀값이 없는 동안은
// 통과시키되 응답에 경고를 남겨 미설정 상태가 눈에 보이도록 한다.
async function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: true, warning: "CRON_SECRET이 등록되지 않아 이 엔드포인트가 공개 상태입니다. Vercel 환경변수에 등록하면 즉시 잠깁니다." };
  }
  const header = request.headers.get("authorization") ?? "";
  if (safeEqual(header, `Bearer ${secret}`)) return { ok: true, warning: null };
  if (await getAdminSession(request)) return { ok: true, warning: null };
  return { ok: false, warning: null };
}

export async function GET(request: Request) {
  // 자동화가 꺼져 있으면 실행 경로 자체를 닫는다. CRON_SECRET 없이도 완전히 잠긴다.
  if (!ADMIN_ENABLED) return disabledSurfaceResponse();
  const auth = await authorizeCron(request);
  if (!auth.ok) {
    return Response.json({ success: false, error: "자동화 실행 권한이 없습니다." }, { status: 401 });
  }
  try {
    // 1. Publish all due/scheduled/draft posts automatically
    await publishDuePosts();

    // 2. Run due content agents and member activities automatically 24/7
    const result = await runScheduledOrganizationActivities();

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...(auth.warning ? { warning: auth.warning } : {}),
      result,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cron execution failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
