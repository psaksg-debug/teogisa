export type MarketingChannelPlan = {
  id: "naver-blog" | "naver-cafe" | "kakao" | "facebook" | "x";
  name: string;
  owner: string;
  trackedUrl: string;
  copy: string;
  actionUrl: string | null;
};

type CampaignInput = {
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  hashtags?: string[];
};

const SITE_ORIGIN = "https://adbles.com";

function trackedPostUrl(slug: string, source: string, medium: string, content: string) {
  const url = new URL(`/posts/${slug}`, SITE_ORIGIN);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", `always_on_${slug}`);
  url.searchParams.set("utm_content", content);
  return url.toString();
}

function compact(value: string, limit: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= limit ? normalized : `${normalized.slice(0, limit - 1).trim()}…`;
}

export function buildMarketingChannelPlans(input: CampaignInput): MarketingChannelPlan[] {
  const summary = compact(input.excerpt || `${input.title}의 핵심 기준과 바로 실행할 순서를 정리했습니다.`, 120);
  const tags = (input.hashtags || []).slice(0, 4).map((tag) => `#${tag}`).join(" ");
  const category = input.category || "퇴직 이후 준비";
  const naverBlogUrl = trackedPostUrl(input.slug, "naver_blog", "owned_social", "summary_post");
  const naverCafeUrl = trackedPostUrl(input.slug, "naver_cafe", "community", "helpful_answer");
  const kakaoUrl = trackedPostUrl(input.slug, "kakao", "messenger", "channel_message");
  const facebookUrl = trackedPostUrl(input.slug, "facebook", "social", "feed_post");
  const xUrl = trackedPostUrl(input.slug, "x", "social", "short_post");

  const facebookCopy = `${input.title}\n\n${summary}\n\n확인하기: ${facebookUrl}\n${tags}`.trim();
  const xCopy = compact(`${input.title} — ${summary} ${xUrl} ${tags}`, 270);

  return [
    {
      id: "naver-blog",
      name: "네이버 블로그",
      owner: "네오",
      trackedUrl: naverBlogUrl,
      copy: `[${category}] ${input.title}\n\n${summary}\n\n본문에서는 확인 기준과 실행 순서를 함께 정리했습니다.\n${naverBlogUrl}\n\n${tags}`.trim(),
      actionUrl: null,
    },
    {
      id: "naver-cafe",
      name: "네이버 카페",
      owner: "네오",
      trackedUrl: naverCafeUrl,
      copy: `${input.title} 때문에 확인할 자료를 찾다가 핵심 기준을 정리해 봤습니다.\n\n${summary}\n\n비슷한 상황인 분은 아래 내용에서 본인 조건에 맞는지 먼저 확인해 보세요.\n${naverCafeUrl}\n\n※ 광고성 도배를 피하고, 관련 질문에 도움이 되는 경우에만 공유합니다.`.trim(),
      actionUrl: null,
    },
    {
      id: "kakao",
      name: "카카오톡",
      owner: "픽",
      trackedUrl: kakaoUrl,
      copy: `${input.title}\n${summary}\n▶ ${kakaoUrl}`,
      actionUrl: null,
    },
    {
      id: "facebook",
      name: "Facebook",
      owner: "픽",
      trackedUrl: facebookUrl,
      copy: facebookCopy,
      actionUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}`,
    },
    {
      id: "x",
      name: "X",
      owner: "펄스",
      trackedUrl: xUrl,
      copy: xCopy,
      actionUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(xCopy)}`,
    },
  ];
}
