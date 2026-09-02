export type PortalMenuItem = {
  /** 화면에 보이는 이름. 상단 메뉴·홈 칩·모바일 메뉴·푸터가 모두 이 이름을 쓴다. */
  label: string;
  /** lib/content.ts 의 글 카테고리 값. 홈 칩의 글 수와 이동 위치를 이 값으로 찾는다. */
  category: string;
  /** 주제 허브 페이지. 없으면 홈의 해당 카테고리 구역으로 보낸다. */
  href?: string;
  description: string;
};

// 상단 메뉴와 홈 카테고리 칩이 서로 다른 이름을 쓰던 것을 여기 한 곳으로 모았다.
// (예전: 상단 "도구모음"·"지역별 생활정보" ↔ 칩 "유용한 도구"·"지역 생활정보")
// label 과 category 를 따로 두는 이유: 카테고리 값은 편집자 역할명, 콘텐츠 에이전트 설정,
// 마이그레이션 스크립트, 이미 발행된 글의 바이라인까지 묶여 있어 값을 바꾸면 파급이 크다.
// 데이터는 그대로 두고 화면에 보이는 이름만 통일한다.
export const portalMenu: PortalMenuItem[] = [
  { label:"정부지원·실업급여", category:"정부지원·실업급여", href:"/official-info", description:"실업급여·지원금·직업훈련을 공식 원문으로 확인합니다." },
  { label:"연금·세금·보험", category:"연금·세금·보험", description:"국민연금, 종합소득세, 건강보험료를 순서대로 정리합니다." },
  { label:"재취업·N잡", category:"재취업·N잡", description:"경력을 다시 쓰는 방법과 중장년 일자리 경로를 봅니다." },
  { label:"수익화 실험", category:"실제 수익실험", href:"/challenge", description:"월 100만원 챌린지와 숫자로 공개하는 수익 실험 기록입니다." },
  { label:"도구모음", category:"유용한 도구", href:"/tools", description:"퇴직금·생활비 계산기와 무료 업무 도구 모음입니다." },
  { label:"지역 생활정보", category:"지역 생활정보", href:"/keyword-lab", description:"사는 곳에 따라 달라지는 일자리·지원 정보입니다." },
  { label:"건강·예방", category:"건강·예방", href:"/health", description:"놓치기 쉬운 위험 신호와 공공 건강 정보입니다." },
];

/** 홈의 카테고리 구역 id. 칩과 상단 메뉴가 같은 자리를 가리키도록 한 곳에서 만든다. */
export function categoryAnchor(category:string){ return `cat-${encodeURIComponent(category)}`; }

/** 메뉴 항목의 이동 위치. 허브 페이지가 있으면 그쪽으로, 없으면 홈의 카테고리 구역으로. */
export function menuHref(item:PortalMenuItem){ return item.href ?? `/#${categoryAnchor(item.category)}`; }

/** 글 카테고리를 메뉴와 같은 이름으로 보여준다. 메뉴에 없는 카테고리는 원래 이름 그대로. */
export function categoryLabel(category:string){ return portalMenu.find((item)=>item.category===category)?.label ?? category; }

/** 홈 칩과 주제별 목록의 순서. 메뉴에 있는 카테고리가 메뉴 순서대로 먼저 온다. */
export const menuCategoryOrder = portalMenu.map((item)=>item.category);

export const workbookDays = [
  ["현재 수입·지출 한 장 정리", "최근 3개월 통장과 카드 내역에서 월 최소생활비를 적습니다."],
  ["월 100만원을 주 단위로 쪼개기", "주 25만원, 하루 목표로 나누고 가능한 작업 시간을 적습니다."],
  ["내가 팔 수 있는 경험 20개", "다른 사람이 자주 부탁했던 일과 결과물을 적습니다."],
  ["고객 한 사람 정하기", "누구의 어떤 불편을 해결할지 한 문장으로 씁니다."],
  ["후보 수입원 3개 점수 매기기", "첫 수익 속도·비용·경험 적합도·반복성을 5점 척도로 봅니다."],
  ["첫 실험 하나 선택", "2주 안에 판매 행동까지 할 수 있는 후보 하나를 고릅니다."],
  ["1주차 회고", "완료한 일, 막힌 이유, 다음 주에 버릴 일을 기록합니다."],
  ["고객 질문 10개 수집", "검색어·커뮤니티·주변 대화에서 실제 질문만 모읍니다."],
  ["무료 샘플 만들기", "체크리스트·진단표·전후 비교 중 하나를 만듭니다."],
  ["가격의 기준 정하기", "투입 시간과 고객이 얻는 결과를 기준으로 테스트 가격을 씁니다."],
  ["소개 문장 3개 작성", "누구에게 무엇을 어떤 결과로 제공하는지 세 버전으로 만듭니다."],
  ["판매 페이지 초안", "문제·해결·결과물·가격·신청 방법만 한 화면에 적습니다."],
  ["실제 5명에게 보여주기", "좋아요가 아니라 질문·거절 이유·결제 의향을 기록합니다."],
  ["2주차 회고", "반응을 계속·수정·중단 세 칸으로 분류합니다."],
  ["첫 콘텐츠 주제 정하기", "고객 질문 중 가장 구체적인 하나를 글이나 영상 주제로 고릅니다."],
  ["공식 자료 3개 찾기", "정부·공공기관·원문 자료를 저장하고 기준일을 적습니다."],
  ["검색 의도에 맞춘 목차", "대상·방법·비용·주의사항·다음 행동 순서로 구성합니다."],
  ["나만의 경험 추가", "직접 계산·실패·비교표 중 하나를 넣습니다."],
  ["발행 전 검토", "숫자·날짜·조건·출처 링크를 다시 확인합니다."],
  ["첫 콘텐츠 공개", "완벽함보다 독자가 바로 실행할 한 가지 행동을 남깁니다."],
  ["두 번째 제안 만들기", "첫 반응을 바탕으로 제목·구성·가격 중 하나만 수정합니다."],
  ["3주차 회고", "조회보다 문의·저장·신청 같은 행동 지표를 확인합니다."],
  ["반복 작업 찾기", "매번 하는 일을 템플릿·문구·체크리스트로 분리합니다."],
  ["자동화 후보 1개", "자료 정리·초안·예약 중 사람 판단이 덜 필요한 단계를 고릅니다."],
  ["수입·비용 장부 만들기", "입금일·지급처·총수입·원천징수·비용을 한 줄로 기록합니다."],
  ["시간당 수익 계산", "준비·이동·수정까지 포함한 총시간으로 나눕니다."],
  ["다음 30일 목표", "유지할 채널 하나와 중단할 채널 하나를 정합니다."],
  ["리스크 점검", "지원금 신고·세금·저작권·개인정보 확인 항목을 체크합니다."],
  ["월 100만원 조합표", "빠른 현금형과 축적형 수입원을 무리 없는 비율로 조합합니다."],
  ["30일 최종 회고", "매출·문의·콘텐츠·작업시간을 기록하고 다음 실험을 결정합니다."],
] as const;

export const officialSections = [
  { title:"지원금·일자리", description:"실업급여, 국민취업지원제도, 직업훈련과 지역 일자리를 확인합니다.", links:[
    ["고용24", "https://www.work24.go.kr/"], ["정부24 보조금24", "https://www.gov.kr/portal/rcvfvrSvc/main/nonLogin"], ["복지로", "https://www.bokjiro.go.kr/"]
  ]},
  { title:"세무·신고", description:"N잡·콘텐츠 수입과 종합소득세는 국세청 원문을 우선 확인합니다.", links:[
    ["국세청", "https://www.nts.go.kr/"], ["국세법령정보시스템", "https://taxlaw.nts.go.kr/"], ["홈택스", "https://www.hometax.go.kr/"]
  ]},
  { title:"연금·퇴직", description:"국민연금, 퇴직급여와 노후 준비 기준을 확인합니다.", links:[
    ["국민연금공단", "https://www.nps.or.kr/"], ["고용노동부", "https://www.moel.go.kr/"], ["중앙노후준비지원센터", "https://csa.nps.or.kr/"]
  ]},
  { title:"건강·보험", description:"건강검진, 보험료, 질병 통계와 예방정보를 공공기관 자료로 확인합니다.", links:[
    ["국가건강정보포털", "https://health.kdca.go.kr/"], ["국민건강보험", "https://www.nhis.or.kr/"], ["건강보험심사평가원", "https://www.hira.or.kr/"]
  ]},
] as const;

export const toolCatalog = [
  { href:"/tools/retirement-runway", title:"퇴직생활비 계산기", description:"보유자금과 월 지출·고정수입으로 버틸 수 있는 기간을 계산합니다.", status:"사용 가능" },
  { href:"/tools/severance-pay", title:"퇴직금 간편 계산기", description:"평균임금과 재직일수를 이용해 예상 퇴직금을 계산합니다.", status:"사용 가능" },
  { href:"/tools/image-converter", title:"이미지 변환기", description:"사진을 WebP·JPG·PNG로 바꾸고 용량을 줄이는 도구입니다.", status:"준비 중" },
  { href:"https://myreceipt.adbles.com/", title:"영수증 정리도우미", description:"영수증 사진을 여러 장 올리면 금액을 합산하고 A4 크기의 정리 PDF로 저장합니다.", status:"사용 가능" },
  { href:"https://proshot.adbles.com/", title:"ProShot AI 사진 스튜디오", description:"휴대폰 셀카 한 장으로 깔끔한 증명사진·비즈니스 헤드샷·스튜디오 프로필을 무료로 만듭니다.", status:"사용 가능" },
  { href:"https://vpn.adbles.com/", title:"VPN 비교", description:"공용 와이파이에서 쓸 VPN을 노로그 정책·서버 위치·요금 기준으로 견주어 봅니다.", status:"사용 가능" },
  { href:"/tools/thumbnail-maker", title:"블로그 썸네일 만들기", description:"제목과 색상을 선택해 검색용 썸네일을 만듭니다.", status:"준비 중" },
] as const;

export const healthTopics = [
  ["고혈압", "초기에는 뚜렷한 증상이 없을 수 있어 측정과 꾸준한 관리가 중요합니다.", "https://health.kdca.go.kr/"],
  ["당뇨병", "갈증·잦은 소변·체중 변화뿐 아니라 검진 수치로 확인해야 합니다.", "https://health.kdca.go.kr/"],
  ["대상포진", "통증 뒤 띠 모양 발진이 생길 수 있으며 조기 진료가 중요합니다.", "https://www.hira.or.kr/ra/stcIlnsInfm/stcIlnsInfmView.do?pgmid=HIRAA030502000000&sortSno=196"],
  ["심뇌혈관질환", "갑작스러운 마비·언어장애·흉통은 즉시 119에 연락해야 하는 위험 신호입니다.", "https://health.kdca.go.kr/"],
  ["근골격계 통증", "통증 위치와 지속기간, 마비·근력저하 동반 여부를 기록합니다.", "https://health.kdca.go.kr/"],
  ["마음건강", "우울감이 지속되거나 일상 기능이 떨어지면 전문기관의 도움을 받습니다.", "https://www.mentalhealth.go.kr/"],
] as const;

// URL에 쓰는 slug·topic은 반드시 ASCII로 둔다. 한글을 그대로 쓰면 빌드 시점과
// 런타임의 퍼센트 인코딩 단계가 어긋나 /local/* 전체가 404가 된다.
// 화면에 보이는 이름은 region·topicLabel을 쓴다.
export const liveKeywordPages = [
  { slug:"seoul", topic:"midlife-jobs", region:"서울", topicLabel:"중장년 일자리", label:"서울 중장년 일자리 찾기" },
  { slug:"busan", topic:"retirement-support", region:"부산", topicLabel:"퇴직 지원금", label:"부산 퇴직자 지원금 확인" },
  { slug:"incheon", topic:"online-side-job", region:"인천", topicLabel:"온라인 부업", label:"인천에서 시작하는 온라인 부업" },
  { slug:"cheonan", topic:"midlife-jobs", region:"천안", topicLabel:"중장년 일자리", label:"천안 중장년 일자리 찾기" },
] as const;
