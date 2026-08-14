import type { Post } from "./content";

export type ManagementMember = {
  id: "policy-lead" | "operations-guard" | "site-safety";
  name: string;
  role: string;
  mission: string;
};

export type PolicyFinding = {
  code: string;
  severity: "critical" | "warning";
  title: string;
  details: string;
};

export const managementDepartment: ManagementMember[] = [
  { id: "policy-lead", name: "강한결", role: "경영관리팀장 · 감사책임자", mission: "발행정책과 전사 감사계획을 승인하고 중대 지적사항을 대표에게 보고합니다." },
  { id: "operations-guard", name: "윤서진", role: "운영관리 매니저 · 시정조치 관리자", mission: "검토 지연·자동화 실패를 관리하고 감사 지적사항의 담당자·기한·재점검을 추적합니다." },
  { id: "site-safety", name: "박지안", role: "품질감사 매니저 · 상시감사 담당", mission: "전 프로젝트 업무와 리소스를 감사하고 증거·발견사항·조치 결과를 문서화합니다." },
];

const HIGH_RISK_CATEGORIES = new Set(["정부지원·실업급여", "정부지원·세무", "투자·재테크", "건강·예방"]);
const GUARANTEE_PATTERN = /(무조건\s*(수익|승인|합격)|100%\s*(보장|수익)|원금\s*보장|확실한\s*수익)/i;

export function inspectPublicationPolicy(post: Omit<Post, "id"> | Post): PolicyFinding[] {
  const text = post.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const hasOfficialSource = /https?:\/\//i.test(post.body);
  const headingCount = (post.body.match(/<h[23][^>]*>/gi) ?? []).length + (post.body.match(/^#{2,3}\s+/gm) ?? []).length;
  const findings: PolicyFinding[] = [];

  if (text.length < 700) findings.push({ code: "body-too-short", severity: "warning", title: "본문 근거가 부족합니다", details: "발행 전 사례·조건·확인 절차를 보강해 본문을 700자 이상으로 작성하세요." });
  if (headingCount < 2) findings.push({ code: "structure-missing", severity: "warning", title: "읽기 구조가 부족합니다", details: "독자의 질문, 확인 기준, 실행 순서를 구분하는 소제목을 2개 이상 추가하세요." });
  if (!post.excerpt.trim()) findings.push({ code: "excerpt-missing", severity: "warning", title: "검색 요약이 없습니다", details: "글의 대상과 답을 설명하는 한 줄 요약을 입력하세요." });
  if (HIGH_RISK_CATEGORIES.has(post.category) && !hasOfficialSource) findings.push({ code: "official-source-missing", severity: "critical", title: "고위험 정보의 공식 출처가 없습니다", details: "정부지원·세무·투자·건강 정보는 발행 전에 공식기관 원문 주소를 연결해야 합니다." });
  if (GUARANTEE_PATTERN.test(text)) findings.push({ code: "guarantee-language", severity: "critical", title: "보장·과장 표현이 감지되었습니다", details: "수익·승인·치료 결과를 보장하는 표현을 삭제하고 조건과 한계를 함께 설명하세요." });
  return findings;
}

export function assertPublicationReady(post: Omit<Post, "id"> | Post) {
  const findings = inspectPublicationPolicy(post);
  if (findings.length) throw new Error(`발행정책 점검이 필요합니다: ${findings.map(item => item.title).join(", ")}`);
}
