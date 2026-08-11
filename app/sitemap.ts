import type { MetadataRoute } from "next";
import { getPublishedPosts } from "../lib/repository";
import { SITE_URL } from "../lib/site";
import { getThumbnailSeo } from "../lib/article-enrichment";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const posts=await getPublishedPosts();const staticPages=["","/about","/author","/editorial-policy","/privacy","/disclosure","/tools/retirement-runway"];return [...staticPages.map((path,index)=>({url:`${SITE_URL}${path}`,lastModified:new Date("2026-08-11"),changeFrequency:(index===0?"weekly":"monthly") as "weekly"|"monthly",priority:index===0 ? 1 : (path.includes("/tools/") ? 0.9 : 0.5)})),...posts.map(p=>{const image=getThumbnailSeo(p);return{url:`${SITE_URL}/posts/${p.slug}`,lastModified:new Date(p.publishedAt),changeFrequency:"monthly" as const,priority:.8,images:[`${SITE_URL}${image.src}`]};})];}
