import { createPost, getAllPosts } from "../../../lib/repository";
import { slugify, type PostStatus } from "../../../lib/content";

export async function GET(){try{return Response.json({posts:await getAllPosts()});}catch(error){return Response.json({error:error instanceof Error?error.message:"글을 불러오지 못했습니다."},{status:500});}}
export async function POST(request:Request){
  try{
    const p=await request.json() as Record<string,string>;
    if(!p.title?.trim()||!p.body?.trim()) return Response.json({error:"제목과 본문을 입력하세요."},{status:400});
    const status=(p.status||"draft") as PostStatus;
    const post=await createPost({title:p.title.trim(),slug:slugify(p.slug||p.title),excerpt:p.excerpt?.trim()||p.body.trim().slice(0,120),body:p.body.trim(),category:p.category||"퇴직 준비",tags:(p.tags||"").split(",").map(x=>x.trim()).filter(Boolean),status,publishedAt:status==="published"?new Date().toISOString().slice(0,10):"",scheduledAt:status==="scheduled"?p.scheduledAt||null:null,readingMinutes:Math.max(1,Math.ceil(p.body.length/700)),visual:p.visual?.trim()||"NEW"});
    return Response.json({post},{status:201});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"저장하지 못했습니다."},{status:500});}
}
