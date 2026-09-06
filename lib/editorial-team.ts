/** 편집자 이름은 사람 이름이 아니라 담당 업무를 가리키는 편집실 운영명이다.
 * 실존 인물로 오인될 수 있는 성+이름 형태는 쓰지 않는다. 글 화면과 /author
 * 양쪽에 AI 편집 사실을 함께 표시해 작성 주체를 숨기지 않는다. */
export const AI_EDITORIAL_NOTICE = "이 글은 퇴직생활연구소 편집실이 생성형 AI 도구로 초안을 만들고, 공식 출처를 사람이 확인한 뒤 발행했습니다. 편집자 이름은 담당 업무를 가리키는 운영명이며 실존 인물이 아닙니다.";

export function authorMetaName(author: EditorialAuthor) {
  return `퇴직생활연구소 편집실 ${author.name} · ${author.role} (AI 편집)`;
}

export type EditorialAuthor = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  agentId?: string;
};

export const EDITOR_IN_CHIEF: EditorialAuthor = {
  id: "editor-in-chief",
  name: "데스크",
  role: "콘텐츠편집팀장 · 책임편집자",
  specialty: "주제 배정, 출처 검증, 발행 승인과 정정 책임",
};

export const editorialAuthors: EditorialAuthor[] = [
  { id: "income-editor", agentId: "income-challenge", name: "원", role: "수익실험 편집자", specialty: "수입 실험, 실행 기록과 워크북" },
  { id: "benefit-editor", agentId: "benefit-tax", name: "가드", role: "지원금·세무·노무 편집자", specialty: "공식 제도, 세금과 근로관계 확인" },
  { id: "tools-editor", agentId: "tool-lab", name: "툴", role: "생활도구 편집자", specialty: "계산기, 기록표와 반복 업무 개선" },
  { id: "tool-guide-editor", name: "픽", role: "유용한 도구 편집자", specialty: "사진·문서·업무 도구의 실제 사용법과 개인정보·비용 점검" },
  { id: "local-editor", agentId: "local-keyword", name: "로컬", role: "지역정보 편집자", specialty: "지역별 일자리와 공공 지원 창구" },
  { id: "health-editor", agentId: "health-column", name: "케어", role: "건강·예방 편집자", specialty: "공공기관 기반 건강·예방 정보" },
  { id: "pension-insurance-editor", name: "노후", role: "연금·보험 편집자", specialty: "국민연금, 퇴직연금, 건강보험 자격과 보험료 검증" },
  { id: "tax-insurance-editor", name: "절세", role: "세금·보험 편집자", specialty: "퇴직 후 세금, 절세와 보험 고정비 점검" },
  { id: "investment-editor", name: "자산", role: "투자·재테크 편집자", specialty: "예금, 금리, 자산배분과 투자위험 검증" },
  { id: "economy-editor", name: "살림", role: "생활경제 편집자", specialty: "퇴직자의 생활비, 연금, 부채와 현금흐름 해설" },
  { id: "video-editor", agentId: "video-curator", name: "큐", role: "영상 큐레이터", specialty: "공식 영상의 출처·최신성·관련성 검토" },
];

export const allEditorialAuthors = [EDITOR_IN_CHIEF, ...editorialAuthors];

export function getEditorialAuthor(name?: string | null) {
  return allEditorialAuthors.find((author) => author.name === name) ?? EDITOR_IN_CHIEF;
}

export function getEditorialAuthorByAgentId(agentId: string) {
  return editorialAuthors.find((author) => author.agentId === agentId);
}
