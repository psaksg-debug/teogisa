import { contentPlanningTeam } from "./content-planning-team";
import { allEditorialAuthors } from "./editorial-team";
import { managementDepartment } from "./management-department";
import { promotionTeam } from "./promotion-team";
import { qualityDesignTeam } from "./quality-design-team";

export type OrganizationChartMember={id:string;name:string;title:string;responsibility:string};
export type OrganizationChartDepartment={id:string;name:string;shortName:string;lead:string;reportsTo:string;responsibility:string;workflow:string;members:OrganizationChartMember[]};

export const ORGANIZATION_CHART_AS_OF="2026-08-14";
export const ORGANIZATION_CHART_VERSION="2026.08.14-current-v1";

export const organizationExecutive={id:"owner",name:"대표",title:"대표 · 최고관리자",responsibility:"경영목표, 최종 발행, 운영 배포와 주요 자원 변경을 승인합니다."} as const;

export const organizationChartDepartments:OrganizationChartDepartment[]=[
  {id:"content-planning",name:"콘텐츠기획팀",shortName:"기획",lead:"판",reportsTo:"대표",responsibility:"독자 질문과 사업목표를 제작 가능한 주제 포트폴리오와 브리프로 바꿉니다.",workflow:"독자 질문 → 주제 지도 → 제작 브리프 → 편집부 인계",members:contentPlanningTeam.map(member=>({id:member.id,name:member.name,title:member.title,responsibility:member.mission}))},
  {id:"editorial",name:"편집부",shortName:"편집",lead:"데스크",reportsTo:"대표",responsibility:"공식 출처를 확인하고 퇴.기.사만의 설명·사례·표와 행동 안내로 작성합니다.",workflow:"브리프 인수 → 취재·집필 → 출처·독창성 검토 → 품질검수 요청",members:allEditorialAuthors.map(member=>({id:member.id,name:member.name,title:member.role,responsibility:member.specialty}))},
  {id:"quality-design",name:"품질디자인팀",shortName:"품질",lead:"결",reportsTo:"대표",responsibility:"디자인·가독성·시각자료·모바일·접근성과 발행 패키지를 독립 검수합니다.",workflow:"디자인 검수 → 콘텐츠 구조 → 접근성 → 발행 패키지 확인",members:qualityDesignTeam.map(member=>({id:member.id,name:member.name,title:member.title,responsibility:member.mission}))},
  {id:"promotion",name:"홍보부",shortName:"홍보",lead:"픽",reportsTo:"대표",responsibility:"승인된 공개 콘텐츠의 검색 노출과 외부채널 홍보안을 관리합니다.",workflow:"발행물 확인 → 채널별 홍보안 → 책임자 확인 → 실행·성과 기록",members:promotionTeam.map(member=>({id:member.id,name:member.name,title:member.title,responsibility:member.scope}))},
  {id:"management",name:"관리부",shortName:"관리",lead:"강한결",reportsTo:"대표",responsibility:"전사 사규, 발행정책, 자동화, 리소스, 감사와 시정조치를 통제합니다.",workflow:"상시감시 → 전사감사 → 즉시보고 → 시정조치·재점검",members:managementDepartment.map(member=>({id:member.id,name:member.name,title:member.role,responsibility:member.mission}))},
];

export const organizationChartSummary={departments:organizationChartDepartments.length,employees:organizationChartDepartments.reduce((sum,department)=>sum+department.members.length,0),positions:1+organizationChartDepartments.reduce((sum,department)=>sum+department.members.length,0)};

export function getOrganizationDepartment(id:string){return organizationChartDepartments.find(department=>department.id===id);}
