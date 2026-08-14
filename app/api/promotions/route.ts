import { executePromotionCampaign, getPromotionCampaigns, preparePromotionCampaign } from "../../../lib/repository";
import { requireOwnerApi } from "../../../lib/site-admin";
import { assertTeamPermission } from "../../../lib/team-permissions";

export async function GET(request:Request){const auth=await requireOwnerApi(request);if(auth.response)return auth.response;try{return Response.json({campaigns:await getPromotionCampaigns()});}catch(error){return Response.json({error:error instanceof Error?error.message:"홍보 작업을 불러오지 못했습니다."},{status:500});}}

export async function POST(request:Request){const auth=await requireOwnerApi(request);if(auth.response)return auth.response;try{const payload=await request.json() as {action?:"prepare"|"execute";postId?:number;id?:number};if(payload.action==="prepare"){assertTeamPermission("owner","promotion.prepare");return Response.json({campaign:await preparePromotionCampaign(payload.postId)},{status:201});}if(payload.action==="execute"&&payload.id){assertTeamPermission("owner","promotion.execute.record");return Response.json({campaign:await executePromotionCampaign(payload.id)});}return Response.json({error:"지원하지 않는 홍보 작업입니다."},{status:400});}catch(error){return Response.json({error:error instanceof Error?error.message:"홍보 작업을 처리하지 못했습니다."},{status:500});}}
