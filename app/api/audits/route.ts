import { getAuditDashboard, resolveAuditFinding, runOrganizationAudit } from "../../../lib/repository";
import { requireOwnerApi } from "../../../lib/site-admin";

export async function GET(request:Request){
  const auth=await requireOwnerApi(request);if(auth.response)return auth.response;
  try{return Response.json(await getAuditDashboard());}
  catch(error){return Response.json({error:error instanceof Error?error.message:"감사 현황을 불러오지 못했습니다."},{status:500});}
}

export async function POST(request:Request){
  const auth=await requireOwnerApi(request);if(auth.response)return auth.response;
  try{
    const payload=await request.json() as {action?:string;id?:number;resolution?:string};
    if(payload.action==="run")return Response.json({run:await runOrganizationAudit()});
    if(payload.action==="resolve"&&payload.id)return Response.json({finding:await resolveAuditFinding(payload.id,payload.resolution??"")});
    return Response.json({error:"지원하지 않는 감사 작업입니다."},{status:400});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"감사 작업을 처리하지 못했습니다."},{status:500});}
}
