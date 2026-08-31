import { seedPosts, type Post } from "../../lib/content";

const SERIES_TAG = "바이브코딩";
const PART_PATTERN = /^시리즈(\d+)$/;

function partNumber(post: Post) {
  for (const tag of post.tags) {
    const match = PART_PATTERN.exec(tag);
    if (match) return Number(match[1]);
  }
  return null;
}

/** 같은 시리즈에 속한 글을 순서대로 보여준다. 편이 늘어나면 자동으로 따라온다. */
export function seriesParts(seriesTag = SERIES_TAG) {
  return seedPosts
    .filter(post => post.status === "published" && post.tags.includes(seriesTag) && partNumber(post) !== null)
    .sort((a, b) => (partNumber(a) ?? 0) - (partNumber(b) ?? 0));
}

/** 시리즈에 속하지 않지만 함께 보면 좋은 같은 주제의 글. */
export function seriesCompanions(seriesTag = SERIES_TAG) {
  return seedPosts.filter(post => post.status === "published" && post.tags.includes(seriesTag) && partNumber(post) === null);
}

export function SeriesNav({ post }: { post: Post }) {
  if (!post.tags.includes(SERIES_TAG)) return null;
  const parts = seriesParts();
  if (parts.length < 2) return null;
  const companions = seriesCompanions().filter(item => item.slug !== post.slug);

  return (
    <nav className="series-nav" aria-labelledby="series-nav-title">
      <p className="eyebrow">바이브 코딩 입문 시리즈</p>
      <h2 id="series-nav-title">처음부터 순서대로 보기</h2>
      <ol>
        {parts.map((item, index) => (
          <li key={item.slug} aria-current={item.slug === post.slug ? "page" : undefined}>
            <span>{index + 1}편</span>
            {item.slug === post.slug ? <strong>{item.title}</strong> : <a href={`/posts/${item.slug}`}>{item.title}</a>}
          </li>
        ))}
      </ol>
      {companions.length > 0 && (
        <p className="series-nav-companion">
          함께 보기{" "}
          {companions.map((item, index) => (
            <span key={item.slug}>
              {index > 0 && " · "}
              <a href={`/posts/${item.slug}`}>{item.title}</a>
            </span>
          ))}
        </p>
      )}
    </nav>
  );
}
