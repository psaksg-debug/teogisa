import { exportAll } from "../../../lib/repository";
import { requireOwnerApi } from "../../../lib/site-admin";
export async function GET(){const auth=await requireOwnerApi();if(auth.response)return auth.response;try{const data=await exportAll();return new Response(JSON.stringify(data,null,2),{headers:{"content-type":"application/json; charset=utf-8","content-disposition":`attachment; filename="retire-rich-backup-${new Date().toISOString().slice(0,10)}.json"`}});}catch(error){return Response.json({error:error instanceof Error?error.message:"백업을 만들지 못했습니다."},{status:500});}}
