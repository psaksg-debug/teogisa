import { runScheduledOrganizationActivities, publishDuePosts } from "../../../lib/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Publish all due/scheduled/draft posts automatically
    await publishDuePosts();

    // 2. Run due content agents and member activities automatically 24/7
    const result = await runScheduledOrganizationActivities();

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
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
