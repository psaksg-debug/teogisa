import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getPost, getPublishedPosts } from "../../../lib/repository";
import { publisher, SITE_NAME, SITE_URL } from "../../../lib/site";
import { Brand, SiteFooter } from "../../components/SiteChrome";
import { ArticleSupport, ArticleThumbnail } from "../../components/ArticleMedia";
import { enrichArticle, getThumbnailSeo } from "../../../lib/article-enrichment";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const post=await getPost(slug);if(!post)return{};const image=getThumbnailSeo(post);return{title:post.title,description:post.excerpt,keywords:post.tags,authors:[{name:publisher.authorName,url:"/author"}],alternates:{canonical:`/posts/${post.slug}`},openGraph:{type:"article",title:post.title,description:post.excerpt,url:`/posts/${post.slug}`,publishedTime:post.publishedAt,modifiedTime:post.publishedAt,authors:[publisher.authorName],section:post.category,tags:post.tags,images:[{url:"/og-v2.png",width:1200,height:630,alt:post.title},{url:image.src,width:image.width,height:image.height,alt:image.alt}]}};}

type GlossaryLink = { term: string; url: string };

function linkGlossaryTerms(text:string, glossary:GlossaryLink[], linked:Set<string>):ReactNode {
  const terms=glossary.map(item=>item.term).sort((a,b)=>b.length-a.length);
  if(terms.length===0)return text;
  const escaped=terms.map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  const pattern=new RegExp(`(${escaped.join("|")})`,"g");
  return text.split(pattern).map((part,index)=>{
    const item=glossary.find(candidate=>candidate.term===part);
    if(!item||linked.has(part))return part;
    linked.add(part);
    return <a className="glossary-link" href={item.url} target="_blank" rel="noreferrer" title={`${part} 뜻을 위키백과에서 확인`} key={`${part}-${index}`}>{part}</a>;
  });
}

function paragraphWithSource(text:string,glossary:GlossaryLink[],linked:Set<string>){const match=text.match(/\n\n출처: (https?:\/\/\S+)$/);if(!match)return <p>{linkGlossaryTerms(text,glossary,linked)}</p>;return <><p>{linkGlossaryTerms(text.slice(0,match.index).trim(),glossary,linked)}</p><a className="source-link" href={match[1]} target="_blank" rel="noreferrer">공식 자료 원문 확인 ↗</a></>}
function renderBody(body:string,glossary:GlossaryLink[]){const linked=new Set<string>();return body.split(/\n(?=## )/).map((part,i)=>{const [first,...rest]=part.split("\n");return first.startsWith("## ")?<section key={i}><h2>{first.slice(3)}</h2>{paragraphWithSource(rest.join("\n").trim(),glossary,linked)}</section>:<div key={i}>{paragraphWithSource(part.trim(),glossary,linked)}</div>});}

export default async function PostPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const [post,all]=await Promise.all([getPost(slug),getPublishedPosts()]);if(!post)notFound();
  const related=all.filter(item=>item.slug!==post.slug&&(item.category===post.category||item.tags.some(tag=>post.tags.includes(tag)))).slice(0,3);
  const url=`${SITE_URL}/posts/${post.slug}`;
  const image=getThumbnailSeo(post);
  const glossary=enrichArticle(post).glossary;
  const imageUrl=`${SITE_URL}${image.src}`;
  const jsonLd={"@context":"https://schema.org","@graph":[{"@type":"BlogPosting","@id":`${url}#article`,headline:post.title,description:post.excerpt,url,mainEntityOfPage:{"@type":"WebPage","@id":url},image:{"@type":"ImageObject",url:imageUrl,contentUrl:imageUrl,width:image.width,height:image.height,caption:image.alt},thumbnailUrl:imageUrl,datePublished:post.publishedAt,dateModified:post.publishedAt,inLanguage:"ko-KR",articleSection:post.category,keywords:post.tags.join(", "),author:{"@type":"Person",name:publisher.authorName,url:`${SITE_URL}/author`},publisher:{"@type":"Organization",name:SITE_NAME,url:SITE_URL,logo:{"@type":"ImageObject",url:`${SITE_URL}/favicon.svg`}}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"홈",item:SITE_URL},{"@type":"ListItem",position:2,name:post.category,item:`${SITE_URL}/search?category=${encodeURIComponent(post.category)}`},{"@type":"ListItem",position:3,name:post.title,item:url}]}]};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><header className="inner-header article-header"><Brand/><nav className="breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span>›</span><a href={`/search?category=${encodeURIComponent(post.category)}`}>{post.category}</a></nav><p className="eyebrow">{post.category} · {post.readingMinutes}분</p><h1>{post.title}</h1><p className="inner-description">{post.excerpt}</p><div className="byline"><a href="/author">{publisher.authorName}</a><span>발행 {post.publishedAt}</span><span>사람이 검토한 콘텐츠</span></div></header><main className="content-shell"><ArticleThumbnail post={post} variant="hero"/><div className="article-layout"><article className="article-copy">{renderBody(post.body,glossary)}<ArticleSupport post={post}/></article><aside className="article-aside"><strong>이 글의 원칙</strong><p>공식 자료와 직접 계산을 구분해 작성합니다.</p><a className="aside-link" href="/editorial-policy">편집 원칙 보기 →</a><strong>관련 태그</strong><div>{post.tags.map(t=><span className="chip" key={t}>#{t}</span>)}</div></aside></div>{related.length>0&&<section className="related-posts" aria-labelledby="related-title"><p className="eyebrow">KEEP READING</p><h2 id="related-title">이어서 보면 좋은 글</h2><div>{related.map(item=><a href={`/posts/${item.slug}`} key={item.slug}><ArticleThumbnail post={item} variant="search"/><span>{item.category}</span><strong>{item.title}</strong><p>{item.excerpt}</p></a>)}</div></section>}</main><SiteFooter/></>;
}
