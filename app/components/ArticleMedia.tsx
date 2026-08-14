import type { Post } from "../../lib/content";
import { enrichArticle, getThumbnailSeo } from "../../lib/article-enrichment";

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
    <figcaption><span>{post.category}</span><strong>{post.visual}</strong></figcaption>
  </figure>;
}

export function ArticleSupport({ post }: { post: Post }) {
  const enrichment = enrichArticle(post);
  return <section className="article-support" aria-labelledby="article-support-title">
    <p className="eyebrow">읽기 전에 한눈에</p>
    <h2 id="article-support-title">한눈에 보는 핵심 흐름</h2>
    <ol className="article-flow">{enrichment.flow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}</ol>
    <h3>읽으면서 확인할 표</h3>
    <div className="article-table-wrap"><table><thead><tr><th>구분</th><th>확인할 내용</th></tr></thead><tbody>{enrichment.checklist.map(([label, detail]) => <tr key={label}><th>{label}</th><td>{detail}</td></tr>)}</tbody></table></div>
    {enrichment.officialLinks.length > 0 && <div className="article-reference-grid">
      {enrichment.officialLinks.length > 0 && <div><h3>공식자료와 추가 확인처</h3>{enrichment.officialLinks.map((link) => <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>{link.label} <span aria-hidden="true">↗</span></a>)}</div>}
    </div>}
    {enrichment.video&&<section className="article-video-feature" aria-labelledby="related-video-title">
      <div><p className="eyebrow">관련 공식 영상</p><h3 id="related-video-title">{enrichment.video.title}</h3><p>{enrichment.video.description}</p><small>{enrichment.video.channel}{enrichment.video.viewsNote?` · ${enrichment.video.viewsNote}`:""}</small><a href={enrichment.video.sourceUrl} target="_blank" rel="noopener noreferrer">YouTube에서 원본 영상 보기 ↗</a></div>
      <div className="embedded-video"><iframe src={enrichment.video.embedUrl} title={enrichment.video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div>
    </section>}
    <p className="support-note">이 표는 핵심 내용을 빠르게 확인하기 위한 요약입니다. 중요한 신청과 금융 결정은 본문에 연결된 최신 안내를 함께 확인하세요.</p>
  </section>;
}
