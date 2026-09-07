import data from "@/data/affiliate-links.json";

export type AffiliateLink = {
  key: string;
  category: string;
  label: string;
  cta: string;
  url: string;
  network: string;
  status: "active" | "review";
  issue?: string;
  updated: string;
};

const links = data.links as AffiliateLink[];
const byKey = new Map(links.map((l) => [l.key, l]));
const rawData = data as Record<string, any>;
const slugMap = (rawData.slug_map || {}) as Record<string, string>;
const prefixMap = (rawData.slug_prefix_map || {}) as Record<string, string>;

/** link_key로 링크를 가져온다. 없는 키는 빌드/런타임에서 즉시 드러나도록 throw. */
export function getLink(key: string): AffiliateLink {
  const link = byKey.get(key);
  if (!link) throw new Error(`[affiliate] unknown link_key: ${key}`);
  return link;
}

/** url만 필요할 때 */
export function linkUrl(key: string): string {
  return getLink(key).url;
}

/** 글 슬러그로 연결된 링크를 찾는다. slug_map → slug_prefix_map 순. */
export function getLinkBySlug(slug: string): AffiliateLink | undefined {
  const key =
    slugMap[slug] ??
    Object.entries(prefixMap).find(([prefix]) => slug.startsWith(prefix))?.[1];
  return key ? getLink(key) : undefined;
}

export function getLinksByCategory(category: string): AffiliateLink[] {
  return links.filter((l) => l.category === category);
}

/** 제휴링크 앵커에 항상 붙여야 하는 속성 (구글 정책) */
export const affiliateRel = "sponsored nofollow noopener";
export const affiliateTarget = "_blank";

/** JSON에 등록된 제휴 링크들의 호스트 집합 */
export const affiliateHosts = new Set(
  links
    .map((l) => {
      try {
        return new URL(l.url).host.toLowerCase();
      } catch {
        return "";
      }
    })
    .filter(Boolean)
);

/**
 * 이 URL이 제휴 링크인지 판정한다.
 * 본문 마크다운 링크에 rel="sponsored"를 붙일지 결정할 때 쓴다.
 * 하드코딩된 도메인 목록 대신 JSON을 기준으로 하므로, 새 제휴사가 추가돼도 자동 반영된다.
 */
export function isAffiliateUrl(href: string): boolean {
  try {
    return affiliateHosts.has(new URL(href).host.toLowerCase());
  } catch {
    return false;
  }
}

/** 현재 링크 데이터의 버전. 포스팅에 붙일 때 최신 반영 여부를 확인하는 기준. */
export const affiliateVersion = {
  version: (data as any).version as string,   // 예: "2026.09.05-02"
  build: (data as any).build as string,       // 링크 내용 해시 (내용이 바뀌면 값이 바뀐다)
  updated: (data as any).updated as string,
  count: links.length,
};

/** 한 줄 표기: "v2026.09.05-02 (d24c05e0, 35개)" */
export function affiliateVersionLabel(): string {
  const v = affiliateVersion;
  return `v${v.version} (${v.build}, ${v.count}개)`;
}
