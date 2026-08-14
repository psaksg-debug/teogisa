import { allEditorialAuthors } from "./editorial-team";
import { managementDepartment } from "./management-department";
import { promotionTeam } from "./promotion-team";
import { qualityDesignTeam } from "./quality-design-team";
import { companyRules } from "./company-rules";
import { contentPlanningTeam } from "./content-planning-team";

export type OrganizationPolicyRecipient = { id:string; name:string; title:string; department:string; applied:true };

export const organizationNotice = {
  id: "organization-policy-2026-08-14-team-v2",
  title: "전사 사이트 운영·발행정책 준수 공지",
  issuedBy: "강한결 경영관리팀장",
  effectiveDate: "2026-08-14",
  message: "퇴.기.사 전 구성원은 공식 출처와 독자 안전을 우선하며, 검토되지 않은 콘텐츠나 외부 홍보물을 임의로 공개하지 않습니다.",
  rules: companyRules.coreRules,
} as const;

export const organizationPolicyRecipients:OrganizationPolicyRecipient[] = [
  ...contentPlanningTeam.map(member=>({id:`content-planning:${member.id}`,name:member.name,title:member.title,department:"콘텐츠기획팀",applied:true as const})),
  ...allEditorialAuthors.map(member=>({id:`editorial:${member.id}`,name:member.name,title:member.role,department:"콘텐츠편집팀",applied:true as const})),
  ...promotionTeam.map(member=>({id:`promotion:${member.id}`,name:member.name,title:member.title,department:"홍보마케팅팀",applied:true as const})),
  ...qualityDesignTeam.map(member=>({id:`quality-design:${member.id}`,name:member.name,title:member.title,department:"품질디자인팀",applied:true as const})),
  ...managementDepartment.map(member=>({id:`management:${member.id}`,name:member.name,title:member.role,department:"경영관리팀",applied:true as const})),
];

export const organizationPolicyCoverage = {
  total: organizationPolicyRecipients.length,
  applied: organizationPolicyRecipients.filter(member=>member.applied).length,
  departments: ["콘텐츠기획팀", "콘텐츠편집팀", "품질디자인팀", "홍보마케팅팀", "경영관리팀"].map(department=>({department,count:organizationPolicyRecipients.filter(member=>member.department===department).length})),
};
