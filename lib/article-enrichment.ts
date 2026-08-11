import type { Post } from "./content";

export type ArticleEnrichment = {
  flow: string[];
  checklist: Array<[string, string]>;
  officialLinks: Array<{ label: string; url: string }>;
  glossary: Array<{ term: string; url: string }>;
};

export type ThumbnailSeo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const flows: Record<string, string[]> = {
  "퇴직 준비": ["현재 자금 확인", "최소생활비 계산", "필수 일정 기록", "3개월 뒤 실제값 반영"],
  "정부지원·실업급여": ["공식 원문 확인", "대상 조건 점검", "신청기한 기록", "담당기관에 최종 확인"],
  "재취업·N잡": ["경험을 작은 서비스로 정의", "비용과 시간 제한", "2주간 실제 제안", "계속·수정·중단 결정"],
  "블로그·애드센스": ["독자 질문 선정", "원문 자료 수집", "직접 경험과 계산 추가", "검토 후 발행"],
  "AI 활용": ["자료는 사람이 선택", "AI로 구조와 초안 작성", "숫자·날짜 대조", "사람이 최종 발행"],
  "온라인 부업": ["후보 하나 선택", "작은 비용으로 시험", "시간당 수익 기록", "반복 가능성 판단"],
  "투자·재테크": ["목표와 기간 확인", "손실 가능성 점검", "보수적 시나리오 계산", "공식 설명서 재확인"],
  "실제 수익실험": ["가설과 기간 설정", "투입 비용 기록", "매출과 시간 측정", "다음 실험 기준 정리"],
};

const checklists: Record<string, Array<[string, string]>> = {
  "퇴직 준비": [["돈", "사용 가능한 자금과 월 최소생활비"], ["일정", "보험·연금·지원제도 신청일"], ["점검", "3개월 실제 지출과 예상의 차이"]],
  "정부지원·실업급여": [["대상", "연령·고용상태·소득 조건"], ["기한", "신청 시작일과 마감일"], ["증빙", "제출 서류와 담당기관 답변"]],
  "재취업·N잡": [["수요", "돈을 낼 고객의 구체적인 문제"], ["비용", "잃어도 되는 초기 실험비"], ["결과", "첫 수익까지 걸린 시간"]],
  "블로그·애드센스": [["독자", "검색 의도와 해결할 질문"], ["근거", "공식 출처와 직접 경험"], ["품질", "중복·오류·과장 표현 검토"]],
  "AI 활용": [["입력", "검증된 원문과 목적"], ["검토", "날짜·수치·대상 조건"], ["책임", "사람이 수정하고 최종 승인"]],
  "온라인 부업": [["시간", "주당 투입 가능한 시간"], ["비용", "도구·교육·광고비"], ["수익", "매출이 아닌 순수익과 반복성"]],
  "투자·재테크": [["기간", "돈이 필요한 시점"], ["위험", "감당 가능한 손실 범위"], ["확인", "수수료·세금·공식 설명서"]],
  "실제 수익실험": [["가설", "누구의 어떤 문제를 해결하는지"], ["측정", "시간·비용·문의·매출"], ["판단", "계속·수정·중단 기준"]],
};

const glossaryTerms = ["실업급여", "국민연금", "종합소득세", "인공지능", "블로그", "연금", "퇴직금", "재취업", "애드센스", "N잡"];

const thumbnailCatalog = [
  { file: "retirement-checklist.webp", description: "체크 표시가 된 퇴직 준비 체크리스트 일러스트" },
  { file: "second-career-side-job.webp", description: "노트북으로 재취업과 부업을 준비하는 중장년 일러스트" },
  { file: "ai-workflow.webp", description: "노트북과 인공지능을 활용하는 중장년 여성 일러스트" },
  { file: "application-process-timeline.webp", description: "서류와 사람 아이콘으로 구성된 신청 절차 일러스트" },
  { file: "retirement-pension-life.webp", description: "산과 해를 바라보는 은퇴 부부 일러스트" },
  { file: "income-tax-calculation.webp", description: "표와 계산기, 원그래프로 구성된 소득·세금 계산 일러스트" },
  { file: "retirement-asset-growth.webp", description: "집과 새싹, 사다리로 표현한 자산 성장 일러스트" },
  { file: "three-bucket-budget.webp", description: "주거·생활·보험을 나눈 3칸 예산 일러스트" },
  { file: "balanced-income-plan.webp", description: "여러 수입원을 균형 있게 쌓는 저울 일러스트" },
  { file: "content-quality-review.webp", description: "별점 체크리스트를 검토하는 중장년 일러스트" },
] as const;

function thumbnailHash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0);
}

export function getThumbnailIndex(post: Pick<Post, "id" | "slug">) {
  return post.id >= 1 && post.id <= 10 ? post.id - 1 : thumbnailHash(post.slug) % 10;
}

export function getThumbnailSeo(post: Pick<Post, "id" | "slug" | "title">): ThumbnailSeo {
  const image = thumbnailCatalog[getThumbnailIndex(post)];
  return {
    src: `/article-thumbnails/${image.file}`,
    alt: `${post.title} — ${image.description}`,
    width: 355,
    height: 444,
  };
}

export function appendSourceUrl(body: string, sourceUrl?: string) {
  const source = sourceUrl?.trim();
  if (!source || body.includes(source)) return body.trim();
  return `${body.trim()}\n\n출처: ${source}`;
}

export function enrichArticle(post: Post): ArticleEnrichment {
  const text = `${post.title} ${post.body} ${post.tags.join(" ")}`;
  const urls = Array.from(new Set((post.body.match(/https?:\/\/[^\s)]+/g) ?? []).map((url) => url.replace(/[.,;]+$/, ""))));
  const officialLinks = urls.slice(0, 3).map((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return { label: `${host} 공식자료`, url };
    } catch {
      return { label: "공식자료", url };
    }
  });
  const glossary = glossaryTerms.filter((term) => text.includes(term)).slice(0, 4).map((term) => ({
    term,
    url: `https://ko.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`,
  }));
  return {
    flow: flows[post.category] ?? flows["퇴직 준비"],
    checklist: checklists[post.category] ?? checklists["퇴직 준비"],
    officialLinks,
    glossary,
  };
}
