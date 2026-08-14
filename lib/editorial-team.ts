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
  role: "책임 편집부장",
  specialty: "주제 배정, 출처 검증, 발행 승인과 정정 책임",
};

export const editorialAuthors: EditorialAuthor[] = [
  { id: "income-editor", agentId: "income-challenge", name: "원", role: "수익실험 편집자", specialty: "수입 실험, 실행 기록과 워크북" },
  { id: "benefit-editor", agentId: "benefit-tax", name: "가드", role: "지원금·세무·노무 편집자", specialty: "공식 제도, 세금과 근로관계 확인" },
  { id: "tools-editor", agentId: "tool-lab", name: "툴", role: "생활도구 편집자", specialty: "계산기, 기록표와 반복 업무 개선" },
  { id: "local-editor", agentId: "local-keyword", name: "로컬", role: "지역정보 편집자", specialty: "지역별 일자리와 공공 지원 창구" },
  { id: "health-editor", agentId: "health-column", name: "케어", role: "건강·예방 편집자", specialty: "공공기관 기반 건강·예방 정보" },
  { id: "pension-insurance-editor", name: "김연수", role: "연금·보험 편집자", specialty: "국민연금, 퇴직연금, 건강보험 자격과 보험료 검증" },
  { id: "tax-insurance-editor", name: "박세온", role: "세금·보험 편집자", specialty: "퇴직 후 세금, 절세와 보험 고정비 점검" },
  { id: "video-editor", agentId: "video-curator", name: "큐", role: "영상 큐레이터", specialty: "공식 영상의 출처·최신성·관련성 검토" },
];

export const allEditorialAuthors = [EDITOR_IN_CHIEF, ...editorialAuthors];

export function getEditorialAuthor(name?: string | null) {
  return allEditorialAuthors.find((author) => author.name === name) ?? EDITOR_IN_CHIEF;
}

export function getEditorialAuthorByAgentId(agentId: string) {
  return editorialAuthors.find((author) => author.agentId === agentId);
}
