import type { Post } from "../../lib/content";
import { enrichArticle, getThumbnailSeo } from "../../lib/article-enrichment";
import { categoryLabel } from "../../lib/portal";

export function ArticleThumbnail({ post, variant = "card" }: { post: Post; variant?: "card" | "search" | "hero" }) {
  const image = getThumbnailSeo(post);
  return <figure className={`article-thumbnail thumbnail-${variant}`}>
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={variant === "hero" ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={variant === "hero" ? "high" : "auto"}
    />
    <figcaption><span>{categoryLabel(post.category)}</span><strong>{post.visual}</strong></figcaption>
  </figure>;
}

export function ArticleSupport({ post }: { post: Post }) {
  const enrichment = enrichArticle(post);
  const supplementalImages = enrichment.images?.filter(image=>!post.body.includes(image.src)) ?? [];
  if (enrichment.officialLinks.length === 0 && supplementalImages.length === 0 && !enrichment.video) return null;
  return <section className="article-support" aria-labelledby="article-support-title">
    <h2 id="article-support-title">도움이 되는 공식자료</h2>
    {enrichment.officialLinks.length > 0 && <div className="article-reference-grid">
      {enrichment.officialLinks.length > 0 && <div><h3>공식자료와 추가 확인처</h3>{enrichment.officialLinks.map((link) => <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>{link.label} <span aria-hidden="true">↗</span></a>)}</div>}
    </div>}
    {supplementalImages.map(image=><figure className="article-image" key={image.src}><img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/><figcaption>{image.caption}</figcaption></figure>)}
    {enrichment.video&&<section className="article-video-feature" aria-labelledby="related-video-title">
      <div><p className="eyebrow">관련 설명 영상</p><h3 id="related-video-title">{enrichment.video.title}</h3><p>{enrichment.video.description}</p><small>{enrichment.video.channel}{enrichment.video.viewsNote?` · ${enrichment.video.viewsNote}`:""}</small><a href={enrichment.video.sourceUrl} target="_blank" rel="noopener noreferrer">YouTube에서 원본 영상 보기 ↗</a></div>
      <div className="embedded-video"><iframe src={enrichment.video.embedUrl} title={enrichment.video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div>
    </section>}
  </section>;
}
