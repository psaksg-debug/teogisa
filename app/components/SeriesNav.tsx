import { seedPosts, type Post } from "../../lib/content";

const SERIES_TAG = "바이브코딩";
const PART_PATTERN = /^시리즈(\d+)$/;

const BOOTCAMP_TAG = "1인창업부트캠프";
const BOOTCAMP_PART_PATTERN = /^부트캠프(\d+)$/;

type SeriesDefinition = { tag: string; label: string; heading: string; pattern: RegExp };

/** 시리즈가 둘 이상이라 태그로 갈라 놓는다. 위에 있는 것이 먼저 잡힌다. */
const seriesDefinitions: readonly SeriesDefinition[] = [
  { tag: BOOTCAMP_TAG, label: "바이브 코딩 1인 창업 시리즈", heading: "1주차부터 순서대로 보기", pattern: BOOTCAMP_PART_PATTERN },
  { tag: SERIES_TAG, label: "바이브 코딩 입문 시리즈", heading: "처음부터 순서대로 보기", pattern: PART_PATTERN },
];

function partNumber(post: Post, pattern: RegExp) {
  for (const tag of post.tags) {
    const match = pattern.exec(tag);
    if (match) return Number(match[1]);
  }
  return null;
}

/** 기존 입문 시리즈 판별. 태그 하나로 시리즈 소속이 정해진다. */
function belongsToBasicsSeries(post: Post) {
  return post.tags.includes(SERIES_TAG);
}

function seriesOf(post: Post) {
  return seriesDefinitions.find(series => (series.tag === SERIES_TAG ? belongsToBasicsSeries(post) : post.tags.includes(series.tag))) ?? null;
}

/** 같은 시리즈에 속한 글을 순서대로 보여준다. 편이 늘어나면 자동으로 따라온다. */
export function seriesParts(seriesTag = SERIES_TAG) {
  const series = seriesDefinitions.find(item => item.tag === seriesTag) ?? seriesDefinitions[seriesDefinitions.length - 1];
  return seedPosts
    .filter(post => post.status === "published" && post.tags.includes(series.tag) && partNumber(post, series.pattern) !== null)
    .sort((a, b) => (partNumber(a, series.pattern) ?? 0) - (partNumber(b, series.pattern) ?? 0));
}

/** 시리즈에 속하지 않지만 함께 보면 좋은 같은 주제의 글. */
export function seriesCompanions(seriesTag = SERIES_TAG) {
  const series = seriesDefinitions.find(item => item.tag === seriesTag) ?? seriesDefinitions[seriesDefinitions.length - 1];
  return seedPosts.filter(post => post.status === "published" && post.tags.includes(series.tag) && partNumber(post, series.pattern) === null);
}

export function SeriesNav({ post }: { post: Post }) {
  const series = seriesOf(post);
  if (!series) return null;
  const parts = seriesParts(series.tag);
  if (parts.length < 2) return null;
  const companions = seriesCompanions(series.tag).filter(item => item.slug !== post.slug);

  return (
    <nav className="series-nav" aria-labelledby="series-nav-title">
      <p className="eyebrow">{series.label}</p>
      <h2 id="series-nav-title">{series.heading}</h2>
      <ol>
        {parts.map(item => (
          <li key={item.slug} aria-current={item.slug === post.slug ? "page" : undefined}>
            <span>{partNumber(item, series.pattern)}편</span>
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
