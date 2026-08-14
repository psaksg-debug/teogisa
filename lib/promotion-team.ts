export type PromotionTeamMember = {
  id: string;
  name: string;
  title: string;
  scope: string;
  cadence: string;
  kpis: string[];
};

export type SearchProgram = {
  id: string;
  engine: string;
  ownerId: string;
  routine: string[];
  successMetric: string;
};

// 역할이 바로 연상되는 짧은 닉네임을 사용하는 AI 실무자 조직입니다.
export const promotionTeam: PromotionTeamMember[] = [
  { id: "seo-lead", name: "픽", title: "홍보마케팅팀장 · 검색 성장 총괄", scope: "검색엔진별 우선순위를 정하고 주간 개선안과 월간 성과 보고를 승인합니다.", cadence: "주간 지휘 · 월간 회고", kpis: ["자연검색 유입", "핵심 질의 노출", "검토 대기 개선안"] },
  { id: "google-seo", name: "랭크", title: "Google SEO 리드", scope: "색인, 사이트맵, Core Web Vitals, 검색 의도와 주제 클러스터를 관리합니다.", cadence: "매주 월요일", kpis: ["유효 색인율", "검색 클릭률", "상위 10위 질의"] },
  { id: "naver-seo", name: "네오", title: "Naver 검색 리드", scope: "Search Advisor 기준, 문서 품질, 출처 신뢰도와 한국어 질의 적합성을 점검합니다.", cadence: "매주 화요일", kpis: ["네이버 유입", "수집·색인 상태", "브랜드 질의"] },
  { id: "bing-seo", name: "빙고", title: "Bing · Copilot 검색 리드", scope: "Bing 색인, IndexNow 적용 가능성, Copilot이 인용하기 쉬운 페이지 구조를 관리합니다.", cadence: "매주 수요일", kpis: ["Bing 노출", "색인 발견 속도", "Copilot 출처 노출"] },
  { id: "ai-search", name: "소스", title: "AI 검색 · 인용 최적화 리드", scope: "ChatGPT, Perplexity, Claude, Gemini에서 핵심 질의의 인용 여부와 출처 경쟁력을 점검합니다.", cadence: "매주 목요일", kpis: ["AI 인용률", "출처 페이지 수", "경쟁 출처 격차"] },
  { id: "technical-seo", name: "크롤", title: "기술 SEO 엔지니어", scope: "robots, canonical, 구조화 데이터, 내부 링크, 오류 페이지와 렌더링 품질을 검사합니다.", cadence: "매주 금요일", kpis: ["치명 오류 0건", "구조화 데이터 통과", "깨진 링크 0건"] },
  { id: "seo-analytics", name: "펄스", title: "검색 성과 분석가", scope: "검색엔진별 기준선을 유지하고 개선 전후 수치, 콘텐츠 감가와 갱신 우선순위를 분석합니다.", cadence: "매주 집계 · 매월 분석", kpis: ["비브랜드 클릭", "콘텐츠 갱신 성과", "전환 기여"] },
];

export const searchPrograms: SearchProgram[] = [
  { id: "google", engine: "Google · Gemini · AI Overviews", ownerId: "google-seo", routine: ["색인·사이트맵·canonical 점검", "핵심 질의와 검색 의도 비교", "E-E-A-T와 원문 출처 갱신"], successMetric: "유효 색인율과 비브랜드 클릭의 동반 상승" },
  { id: "naver", engine: "Naver 통합검색", ownerId: "naver-seo", routine: ["Search Advisor 수집 상태 확인", "한국어 제목·요약·본문 정합성 점검", "중복·저품질 문서 정리"], successMetric: "네이버 자연검색 유입과 브랜드 검색의 월간 증가" },
  { id: "bing", engine: "Bing · Copilot", ownerId: "bing-seo", routine: ["Bing 색인·robots 확인", "빠른 URL 발견 방식 검토", "표·FAQ·직접 답변 구조 개선"], successMetric: "신규 글 발견 시간 단축과 Copilot 출처 노출 증가" },
  { id: "ai", engine: "ChatGPT · Perplexity · Claude", ownerId: "ai-search", routine: ["핵심 20개 질문의 인용 여부 표본 점검", "독립적으로 이해되는 답변·표·출처 보강", "llms.txt와 AI 크롤러 접근 확인"], successMetric: "핵심 질문 중 사이트 인용률의 월간 상승" },
];

export function getPromotionMember(id: string) {
  return promotionTeam.find((member) => member.id === id);
}
