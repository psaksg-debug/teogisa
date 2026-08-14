import { organizationChartDepartments } from "./organization-chart";

export type ActivityFrequency="hourly"|"daily";
export type ActivityAction="planning-scan"|"editorial-review"|"quality-review"|"promotion-prepare"|"management-monitor"|"management-audit";
export type MemberActivityPlanDefinition={id:string;memberId:string;memberName:string;teamId:string;teamName:string;role:string;frequency:ActivityFrequency;intervalHours:number|null;dailyHourKst:number|null;minuteOffset:number;action:ActivityAction;taskTitle:string;instruction:string;safeOutput:string;requiresApproval:boolean};

const teamDefaults:Record<string,{action:ActivityAction;taskTitle:string;instruction:string;safeOutput:string}>={
  "content-planning":{action:"planning-scan",taskTitle:"주제·브리프 점검",instruction:"독자 질문, 콘텐츠 공백과 검토대기 현황을 점검하고 다음 제작 후보를 기록합니다.",safeOutput:"기획 점검 기록"},
  editorial:{action:"editorial-review",taskTitle:"편집·출처 준비",instruction:"검토대기 초안과 공식출처 필요 항목을 확인하고 편집 우선순위를 기록합니다. 원문 복사는 금지합니다.",safeOutput:"편집 준비 기록"},
  "quality-design":{action:"quality-review",taskTitle:"품질 게이트 점검",instruction:"공개·예약 글의 구조, 메타데이터, 접근성과 품질 신호를 점검해 보완 대상을 기록합니다.",safeOutput:"품질 점검 기록"},
  promotion:{action:"promotion-prepare",taskTitle:"홍보안 준비 점검",instruction:"승인된 공개 글과 준비된 홍보안을 확인합니다. 외부 채널 게시 없이 검토용 준비 기록만 남깁니다.",safeOutput:"홍보 준비 기록"},
  management:{action:"management-monitor",taskTitle:"운영·정책 감시",instruction:"사이트, 자동화, 발행정책과 미해결 문제를 점검하고 필요한 보고·안전조치를 기록합니다.",safeOutput:"관리 점검 또는 감사 기록"},
};

export const memberActivityPlans:MemberActivityPlanDefinition[]=organizationChartDepartments.flatMap(department=>department.members.map((member,index)=>{
  const defaults=teamDefaults[department.id];
  const isHourly=department.id==="management"||index===0;
  const intervalHours=department.id==="management"?(member.id==="site-safety"?24:6):isHourly?12:null;
  return {id:`${department.id}:${member.id}`,memberId:member.id,memberName:member.name,teamId:department.id,teamName:department.name,role:member.title,frequency:isHourly?"hourly":"daily",intervalHours,dailyHourKst:isHourly?null:7+index,minuteOffset:(index%2)*30,action:member.id==="site-safety"?"management-audit":defaults.action,taskTitle:defaults.taskTitle,instruction:defaults.instruction,safeOutput:defaults.safeOutput,requiresApproval:department.id==="editorial"||department.id==="promotion"||department.id==="quality-design"};
}));

const KST_OFFSET=9*60*60*1000;
export function nextMemberActivityRunAt(plan:Pick<MemberActivityPlanDefinition,"frequency"|"intervalHours"|"dailyHourKst"|"minuteOffset">,from=new Date()){
  if(plan.frequency==="hourly")return new Date(from.getTime()+(plan.intervalHours??6)*60*60*1000).toISOString();
  const kst=new Date(from.getTime()+KST_OFFSET);
  let candidate=Date.UTC(kst.getUTCFullYear(),kst.getUTCMonth(),kst.getUTCDate(),(plan.dailyHourKst??9)-9,plan.minuteOffset);
  if(candidate<=from.getTime())candidate+=24*60*60*1000;
  return new Date(candidate).toISOString();
}
