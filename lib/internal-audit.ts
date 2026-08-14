export type AuditOfficer = { id:string; name:string; title:string; responsibility:string };
export type AuditDomain = { id:string; name:string; owner:string; standard:string; evidence:string[] };

export const auditOfficers:AuditOfficer[] = [
  {id:"audit-executive",name:"강한결",title:"감사책임자 · 경영관리팀장",responsibility:"감사계획 승인, 독립성 확보, 중대사항 대표 보고와 최종 감사의견 확정"},
  {id:"continuous-auditor",name:"박지안",title:"상시감사 담당 · 품질감사 매니저",responsibility:"전 프로젝트 표본·정기감사 수행, 증거 수집, 감사조서와 발견사항 작성"},
  {id:"remediation-manager",name:"윤서진",title:"시정조치 관리자 · 운영관리 매니저",responsibility:"지적사항 담당자·기한 지정, 진행 추적, 재점검 요청과 완료 증거 관리"},
];

export const auditDomains:AuditDomain[] = [
  {id:"governance",name:"경영목표·사규·의사결정",owner:"강한결",standard:"MVP 비전, 사규 최신 버전과 승인체계가 모든 업무에 적용되어야 한다.",evidence:["사규 버전", "6대 경영목표", "전사 공지·적용률"]},
  {id:"people",name:"조직·인사·업무배정",owner:"강한결",standard:"모든 직원에게 소속·직책·책임·보고선과 가동상태가 지정되어야 한다.",evidence:["전 직원 명부", "팀별 역할", "가동·일시정지 기록"]},
  {id:"resources",name:"리소스·비용·권한",owner:"윤서진",standard:"모든 핵심 자원에 소유팀·관리자·사용기준과 승인절차가 있어야 한다.",evidence:["리소스 등록부", "API·비용 기준", "계정·권한 기준"]},
  {id:"content",name:"콘텐츠·출처·독창성",owner:"데스크",standard:"모든 공개물은 공식 출처, 독창성, 과장표현과 발행정책 검사를 통과해야 한다.",evidence:["게시물 상태", "원문 대조 기록", "발행 차단 기록"]},
  {id:"quality",name:"디자인·품질·접근성",owner:"결",standard:"발행 패키지는 디자인 일관성, 가독성, 시각자료, 모바일·접근성 기준을 충족해야 한다.",evidence:["품질 게이트", "결함 기록", "보완 이력"]},
  {id:"promotion",name:"홍보·검색·외부채널",owner:"픽",standard:"승인된 공개 글만 홍보하고 외부 게시·설정변경은 책임자 확인 뒤 실행해야 한다.",evidence:["홍보 캠페인", "실행 승인", "외부채널 기록"]},
  {id:"security",name:"계정·보안·개인정보",owner:"강한결",standard:"관리자 인증과 비밀정보는 최소권한으로 구성되고 노출 없이 관리되어야 한다.",evidence:["보안설정 구성 여부", "로그인 차단", "사고 기록"]},
  {id:"data",name:"데이터·백업·마이그레이션",owner:"박지안",standard:"데이터 변경은 이력과 마이그레이션을 남기고 백업·복구 가능성을 확인해야 한다.",evidence:["마이그레이션", "최근 백업", "내보내기 기록"]},
  {id:"automation",name:"자동화·장애·복구",owner:"윤서진",standard:"자동화는 승인된 주기와 검토절차로 작동하며 실패·지연을 보존하고 복구해야 한다.",evidence:["에이전트 상태", "실패 로그", "검토 대기시간"]},
  {id:"deployment",name:"변경·검증·배포",owner:"박지안",standard:"검증된 변경만 승인된 범위로 반영하고 원격 DB와 배포 승인을 분리해야 한다.",evidence:["빌드·테스트", "변경기록", "배포 승인·상태"]},
];

export const AUDIT_SCOPE = "퇴.기.사 전 프로젝트·전 팀·전 직원·자동화·리소스 업무";
