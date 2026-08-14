export type TeamId = "content-planning" | "editorial" | "quality-design" | "promotion" | "management" | "owner";

export type TeamCapability =
  | "brief.propose"
  | "analytics.read"
  | "content.read"
  | "content.draft.create"
  | "content.draft.update"
  | "content.review.request"
  | "content.quality.review"
  | "content.publish"
  | "assets.propose"
  | "promotion.prepare"
  | "promotion.execute.record"
  | "automation.run"
  | "automation.manage"
  | "audit.run"
  | "audit.resolve"
  | "release.candidate.create"
  | "release.approve"
  | "release.deploy";

export type TeamPermission = {
  id: TeamId;
  name: string;
  responsibility: string;
  capabilities: readonly TeamCapability[];
  restrictions: readonly string[];
};

export const teamPermissions: readonly TeamPermission[] = [
  {
    id: "content-planning",
    name: "콘텐츠기획팀",
    responsibility: "독자 질문, 주제 지도와 제작 브리프를 제안합니다.",
    capabilities: ["brief.propose", "analytics.read", "content.read"],
    restrictions: ["본문 직접 수정 금지", "발행·배포 금지"],
  },
  {
    id: "editorial",
    name: "콘텐츠편집팀 · 콘텐츠 부장",
    responsibility: "공식 출처를 바탕으로 초안을 만들고 편집·검토 요청합니다.",
    capabilities: ["content.read", "content.draft.create", "content.draft.update", "content.review.request"],
    restrictions: ["검토 없는 공개 금지", "운영 배포 금지"],
  },
  {
    id: "quality-design",
    name: "품질디자인팀",
    responsibility: "디자인, 모바일, 접근성, 이미지와 발행 패키지를 검수합니다.",
    capabilities: ["content.read", "content.quality.review", "assets.propose", "release.candidate.create"],
    restrictions: ["사실관계 임의 변경 금지", "운영 배포 금지"],
  },
  {
    id: "promotion",
    name: "홍보마케팅팀",
    responsibility: "이미 발행된 글의 홍보안을 준비하고 실행 결과를 기록합니다.",
    capabilities: ["content.read", "analytics.read", "promotion.prepare", "promotion.execute.record"],
    restrictions: ["비공개 글 홍보 금지", "콘텐츠 수정·운영 배포 금지"],
  },
  {
    id: "management",
    name: "경영관리팀",
    responsibility: "자동화, 정책, 품질, 장애와 배포 후보를 감사하고 승인합니다.",
    capabilities: ["content.read", "automation.run", "automation.manage", "audit.run", "audit.resolve", "release.approve"],
    restrictions: ["대표 승인 없는 운영 배포 금지", "검증 실패 버전 승인 금지"],
  },
  {
    id: "owner",
    name: "대표 · 최고관리자",
    responsibility: "최종 발행과 운영 배포를 승인하고 이전 버전 복구를 결정합니다.",
    capabilities: [
      "brief.propose", "analytics.read", "content.read", "content.draft.create", "content.draft.update",
      "content.review.request", "content.quality.review", "content.publish", "assets.propose", "promotion.prepare",
      "promotion.execute.record", "automation.run", "automation.manage", "audit.run", "audit.resolve",
      "release.candidate.create", "release.approve", "release.deploy",
    ],
    restrictions: ["검증 기록 없이 배포 금지", "운영 중인 안정 버전 직접 덮어쓰기 금지"],
  },
] as const;

export function hasTeamPermission(teamId:TeamId, capability:TeamCapability) {
  return teamPermissions.find(team=>team.id===teamId)?.capabilities.includes(capability) ?? false;
}

export function assertTeamPermission(teamId:TeamId, capability:TeamCapability) {
  if (!hasTeamPermission(teamId, capability)) throw new Error(`${teamId} 팀에는 ${capability} 권한이 없습니다.`);
}

export const productionDeployAuthority = "owner" satisfies TeamId;
