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
    <p className="eyebrow">AUTOMATIC READING GUIDE</p>
    <h2 id="article-support-title">한눈에 보는 핵심 흐름</h2>
    <ol className="article-flow">{enrichment.flow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}</ol>
    <h3>읽으면서 확인할 표</h3>
    <div className="article-table-wrap"><table><thead><tr><th>구분</th><th>확인할 내용</th></tr></thead><tbody>{enrichment.checklist.map(([label, detail]) => <tr key={label}><th>{label}</th><td>{detail}</td></tr>)}</tbody></table></div>
    {(enrichment.officialLinks.length > 0 || enrichment.glossary.length > 0) && <div className="article-reference-grid">
      {enrichment.officialLinks.length > 0 && <div><h3>공식자료</h3>{enrichment.officialLinks.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} <span aria-hidden="true">↗</span></a>)}</div>}
      {enrichment.glossary.length > 0 && <div><h3>어려운 용어</h3>{enrichment.glossary.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.term}>{item.term} · 위키백과에서 확인 <span aria-hidden="true">↗</span></a>)}</div>}
    </div>}
    <p className="support-note">표와 흐름은 글의 카테고리를 기준으로 자동 구성된 읽기 보조자료입니다. 제도 신청과 금융 판단은 연결된 공식자료의 최신 내용을 우선하세요.</p>
  </section>;
}
