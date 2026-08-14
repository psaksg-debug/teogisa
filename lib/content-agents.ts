export type ContentAgentProfile = {
  id:string; name:string; category:string; mission:string; cadenceHours:number;
  sources:Array<{name:string;url:string}>;
  topics:string[];
  video?:{title:string;embedUrl:string;sourceUrl:string};
};

// 16시간 간격이면 각 분야에서 하루에 1~2개의 검토용 초안이 생성됩니다.
const DAILY_DRAFT_CADENCE_HOURS = 16;

export const contentAgentProfiles:ContentAgentProfile[] = [
  {id:"income-challenge",name:"월 100만원 챌린지 코치",category:"실제 수익실험",mission:"30일 워크북과 수입실험 회고를 관리합니다.",cadenceHours:DAILY_DRAFT_CADENCE_HOURS,sources:[{name:"고용24",url:"https://www.work24.go.kr/"},{name:"국세청",url:"https://www.nts.go.kr/"}],topics:["월 100만원 목표를 주간 행동으로 나누는 법","첫 고객을 찾는 2주 검증 워크북","부업 시간당 수익을 계산하는 기록법"]},
  {id:"benefit-tax",name:"지원금·세무·노무 리서처",category:"정부지원·세무",mission:"지원금·세무와 근로관계 분쟁 정보를 공식 원문으로 확인하고 대응 순서를 정리합니다.",cadenceHours:DAILY_DRAFT_CADENCE_HOURS,sources:[{name:"고용24",url:"https://www.work24.go.kr/"},{name:"국세청",url:"https://www.nts.go.kr/"},{name:"국세법령정보시스템",url:"https://taxlaw.nts.go.kr/"},{name:"고용노동부 노동포털",url:"https://labor.moel.go.kr/"},{name:"중앙노동위원회",url:"https://www.nlrc.go.kr/"},{name:"대한법률구조공단",url:"https://www.klac.or.kr/"}],topics:["퇴직 후 받을 수 있는 지원금 확인 순서","N잡 수입 종합소득세 기록 체크리스트","3.3% 원천징수 뒤 확인할 신고 항목","근로계약서를 쓰지 않았거나 실제 조건과 다를 때 확인할 순서","임금체불이 발생했을 때 자료를 정리하고 공식 창구를 찾는 법","갑작스러운 해고 통보를 받았을 때 확인할 문서와 공식 구제 창구","직장 내 괴롭힘을 겪었을 때 사실관계 기록과 신고 창구 확인법","퇴직금·미지급 수당 분쟁 전에 모아둘 자료 체크리스트","사업주와 근로조건 분쟁이 생겼을 때 대화·증거·상담 기록 정리법"]},
  {id:"tool-lab",name:"생활도구 기획자",category:"유용한 도구",mission:"퇴직자의 반복 업무를 줄이는 계산기와 정리 도구를 개선합니다.",cadenceHours:DAILY_DRAFT_CADENCE_HOURS,sources:[{name:"고용노동부",url:"https://www.moel.go.kr/"},{name:"국민연금공단",url:"https://www.nps.or.kr/"}],topics:["퇴직금 계산 전에 확인할 평균임금 항목","부업 영수증을 월별로 정리하는 기준","검색용 블로그 썸네일 체크리스트"]},
  {id:"local-keyword",name:"지역 키워드 에디터",category:"지역 생활정보",mission:"지역명과 세부 질문을 결합하되 고유 정보가 있는 페이지만 만듭니다.",cadenceHours:DAILY_DRAFT_CADENCE_HOURS,sources:[{name:"고용24",url:"https://www.work24.go.kr/"},{name:"정부24",url:"https://www.gov.kr/"}],topics:["서울 중장년 일자리 공식 창구 모음","부산 퇴직자 지원사업 확인 순서","인천 중장년 직업훈련 검색법"]},
  {id:"health-column",name:"건강·예방 칼럼 에이전트",category:"건강·예방",mission:"질병 증상·예방법·공공 이벤트를 공공기관 자료로만 정리합니다.",cadenceHours:DAILY_DRAFT_CADENCE_HOURS,sources:[{name:"국가건강정보포털",url:"https://health.kdca.go.kr/"},{name:"국민건강보험",url:"https://www.nhis.or.kr/"},{name:"건강보험심사평가원",url:"https://www.hira.or.kr/"}],topics:["50대 이후 혈압 수치를 기록하는 법","국가건강검진 결과표에서 다시 확인할 항목","대상포진 증상과 진료 시점 공식정보 정리"],video:{title:"간염 파악하고 해결하자, 우리 함께 간.파.해!",embedUrl:"https://www.youtube-nocookie.com/embed/vX2nQeSuoFE",sourceUrl:"https://www.youtube.com/watch?v=vX2nQeSuoFE"}},
  {id:"video-curator",name:"공식 인기영상 큐레이터",category:"영상 큐레이션",mission:"관련성이 높고 출처가 분명한 인기 영상을 검토해 글에 연결합니다.",cadenceHours:DAILY_DRAFT_CADENCE_HOURS,sources:[{name:"질병관리청 아프지마TV",url:"https://www.youtube.com/@KDCA"},{name:"정책브리핑",url:"https://www.korea.kr/"}],topics:["이번 주 공식기관 인기영상 검토","건강 칼럼에 연결할 공식 영상 검증","지원제도 설명 영상 출처 점검"],video:{title:"혈당 수치, 어떻게 관리하면 좋을까요?",embedUrl:"https://www.youtube-nocookie.com/embed/SrzUxu1lBk0",sourceUrl:"https://www.youtube.com/watch?v=SrzUxu1lBk0"}},
];
