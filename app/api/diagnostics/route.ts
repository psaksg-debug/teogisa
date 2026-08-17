import { storageDiagnostics } from "@/lib/repository";
import { requireOwnerApi } from "@/lib/site-admin";

export async function GET(request: Request) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  try {
    return Response.json({ storage: await storageDiagnostics() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "진단 정보를 확인하지 못했습니다." }, { status: 500 });
  }
}
