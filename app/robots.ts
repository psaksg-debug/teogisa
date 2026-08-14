import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:"*",allow:"/",disallow:["/admin","/api/"]},{userAgent:["OAI-SearchBot","ChatGPT-User","GPTBot","PerplexityBot","ClaudeBot","Google-Extended","bingbot","Yeti"],allow:"/",disallow:["/admin","/api/"]}],sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL};}
