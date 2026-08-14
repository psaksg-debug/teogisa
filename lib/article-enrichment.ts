import type { Post } from "./content";

export type ArticleEnrichment = {
  flow: string[];
  checklist: Array<[string, string]>;
  officialLinks: Array<{ label: string; url: string }>;
  glossary: Array<{ term: string; url: string }>;
  images?: Array<{ src:string; alt:string; caption:string; width:number; height:number }>;
  video?: { title:string; embedUrl:string; sourceUrl:string; description:string; channel:string; viewsNote?:string };
};

export type ThumbnailSeo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const flows: Record<string, string[]> = {
  "퇴직 준비": ["현재 자금 확인", "최소생활비 계산", "필수 일정 기록", "3개월 뒤 실제값 반영"],
  "정부지원·실업급여": ["공식 원문 확인", "대상 조건 점검", "신청기한 기록", "담당기관에 최종 확인"],
  "재취업·N잡": ["경험을 작은 서비스로 정의", "비용과 시간 제한", "2주간 실제 제안", "계속·수정·중단 결정"],
  "블로그·애드센스": ["독자 질문 선정", "원문 자료 수집", "직접 경험과 계산 추가", "검토 후 발행"],
  "AI 활용": ["자료는 사람이 선택", "AI로 구조와 초안 작성", "숫자·날짜 대조", "사람이 최종 발행"],
  "연금·세금·보험": ["자격과 기준일 확인", "예상 금액 비교", "신청기한 기록", "공식기관에 최종 확인"],
  "온라인 부업": ["후보 하나 선택", "작은 비용으로 시험", "시간당 수익 기록", "반복 가능성 판단"],
  "투자·재테크": ["목표와 기간 확인", "손실 가능성 점검", "보수적 시나리오 계산", "공식 설명서 재확인"],
  "실제 수익실험": ["가설과 기간 설정", "투입 비용 기록", "매출과 시간 측정", "다음 실험 기준 정리"],
  "유용한 도구": ["용도와 입력자료 확인", "사진 업로드·스타일 선택", "비용·결과 비교", "다운로드·개인정보 정리"],
};

const checklists: Record<string, Array<[string, string]>> = {
  "퇴직 준비": [["돈", "사용 가능한 자금과 월 최소생활비"], ["일정", "보험·연금·지원제도 신청일"], ["점검", "3개월 실제 지출과 예상의 차이"]],
  "정부지원·실업급여": [["대상", "연령·고용상태·소득 조건"], ["기한", "신청 시작일과 마감일"], ["증빙", "제출 서류와 담당기관 답변"]],
  "재취업·N잡": [["수요", "돈을 낼 고객의 구체적인 문제"], ["비용", "잃어도 되는 초기 실험비"], ["결과", "첫 수익까지 걸린 시간"]],
  "블로그·애드센스": [["독자", "검색 의도와 해결할 질문"], ["근거", "공식 출처와 직접 경험"], ["품질", "중복·오류·과장 표현 검토"]],
  "AI 활용": [["입력", "검증된 원문과 목적"], ["검토", "날짜·수치·대상 조건"], ["책임", "사람이 수정하고 최종 승인"]],
  "연금·세금·보험": [["자격", "가입 유형과 적용 시작일"], ["금액", "보험료·세금의 산정 자료"], ["기한", "신청·납부 마감일과 접수증"]],
  "온라인 부업": [["시간", "주당 투입 가능한 시간"], ["비용", "도구·교육·광고비"], ["수익", "매출이 아닌 순수익과 반복성"]],
  "투자·재테크": [["기간", "돈이 필요한 시점"], ["위험", "감당 가능한 손실 범위"], ["확인", "수수료·세금·공식 설명서"]],
  "실제 수익실험": [["가설", "누구의 어떤 문제를 해결하는지"], ["측정", "시간·비용·문의·매출"], ["판단", "계속·수정·중단 기준"]],
  "유용한 도구": [["입력", "정면 얼굴이 선명한 원본 사진"], ["비용", "결제 전 가격·해상도·제공 파일"], ["주의", "공식 신분증 규격과 업로드 사진 삭제정책"]],
};

const glossaryTerms = ["실업급여", "국민연금", "종합소득세", "인공지능", "블로그", "연금", "퇴직금", "재취업", "애드센스", "N잡"];

const categoryOfficialLinks:Record<string,Array<{label:string;url:string}>>={
  "퇴직 준비":[{label:"국민건강보험공단 자격·보험료 확인",url:"https://www.nhis.or.kr/"},{label:"국민연금공단 노후준비 안내",url:"https://www.nps.or.kr/"}],
  "정부지원·실업급여":[{label:"고용24 실업급여·취업지원 안내",url:"https://www.work24.go.kr/"},{label:"국민연금공단 제도 안내",url:"https://www.nps.or.kr/"}],
  "재취업·N잡":[{label:"고용24 중장년 일자리·훈련 검색",url:"https://www.work24.go.kr/"},{label:"국세청 소득 신고 안내",url:"https://www.nts.go.kr/"}],
  "AI 활용":[{label:"Google 사람 중심 콘텐츠 작성 지침",url:"https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko"},{label:"Google 생성형 AI 콘텐츠 지침",url:"https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=ko"}],
  "연금·세금·보험":[{label:"국민건강보험공단 자격·보험료 확인",url:"https://www.nhis.or.kr/"},{label:"국세청 세금 신고 안내",url:"https://www.nts.go.kr/"},{label:"국민연금공단 연금 안내",url:"https://www.nps.or.kr/"}],
  "실제 수익실험":[{label:"고용24 일자리·직업훈련 검색",url:"https://www.work24.go.kr/"},{label:"소상공인24 지원사업 확인",url:"https://www.sbiz24.kr/"}],
  "투자·재테크":[{label:"금융감독원 금융소비자정보포털 파인",url:"https://fine.fss.or.kr/"},{label:"예금보험공사 예금자보호 안내",url:"https://www.kdic.or.kr/"}],
};

const slugResources:Record<string,{links?:Array<{label:string;url:string}>;images?:ArticleEnrichment["images"];video?:ArticleEnrichment["video"]}>={
  "retirement-pay-irp-five-checks-before-withdrawal":{
    links:[{label:"고용노동부 IRP 의무이전·예외 안내",url:"https://1350.moel.go.kr/rtmview.do?id=1000255731&page=1&type=ALL"},{label:"고용노동부 퇴직연금제도 안내",url:"https://www.moel.go.kr/retirementpay.do"},{label:"국세청 연금계좌 원천징수세율",url:"https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7888&mi=6609"},{label:"국세청 퇴직소득세·과세이연 안내",url:"https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7880&mi=6444"}],
    images:[{src:"/article-thumbnails/application-process-timeline.webp",alt:"퇴직금이 IRP에 입금된 뒤 일시금과 연금 수령 절차를 확인하는 서류·일정표 일러스트",caption:"IRP는 해지 버튼부터 누르기보다 퇴직금의 출처, 필요한 시점과 수령 방식을 순서대로 확인해야 합니다. · 퇴.기.사 제작 일러스트",width:355,height:444}],
  },
  "proshot-mobile-id-studio-photo-guide":{
    links:[{label:"ProShot AI 사진 스튜디오 바로가기",url:"https://proshot.adbles.com/"},{label:"외교부 여권사진 규격 안내",url:"https://www.passport.go.kr/home/kor/contents.do?menuPos=32"},{label:"외교부 온라인 여권사진 검증",url:"https://passport.go.kr/home/kor/onlinePhotoVerify/index.do?menuPos=33"}],
    images:[{src:"https://proshot.adbles.com/images/selfie_before.png",alt:"ProShot에 업로드하기 전 휴대폰 정면 셀카 예시",caption:"정면을 또렷하게 바라본 휴대폰 셀카를 준비합니다. · ProShot 제공 예시 이미지",width:640,height:640},{src:"https://proshot.adbles.com/images/profile_after.png",alt:"ProShot으로 생성한 정장 차림의 스튜디오 비즈니스 프로필 사진 예시",caption:"스타일을 선택하면 비즈니스 헤드샷이나 스튜디오 프로필 형태로 생성할 수 있습니다. · ProShot 제공 예시 이미지",width:640,height:640}],
  },
  "deposit-protection-100-million-retirement-money-checks":{
    links:[{label:"금융위원회 예금보호한도 1억원 안내",url:"https://www.fsc.go.kr/edu/news/85225"},{label:"금융위원회 적용 대상·별도 한도 안내",url:"https://www.fsc.go.kr/edu/news/85077"},{label:"예금보험공사 예금자보호 안내",url:"https://www.kdic.or.kr/"}],
    images:[{src:"/article-thumbnails/income-tax-calculation.webp",alt:"예금보호한도와 퇴직금 분산 예치를 계산하는 표·계산기 일러스트",caption:"보호한도만 보지 말고 금융회사별 원금·예상 이자 합계와 만기일을 함께 적어야 합니다. · 퇴.기.사 제작 일러스트",width:355,height:444}],
  },
  "health-insurance-after-retirement-three-checks":{
    links:[{label:"국민건강보험공단 임의계속가입 안내",url:"https://www.nhis.or.kr/static/alim/paper/oldpaper/202212/sub/18.html"},{label:"국민건강보험공단 2026년도 보험료율",url:"https://edi.nhis.or.kr/portal/images/popup/20251204_pop01longdesc.html"}],
    images:[{src:"/article-thumbnails/retirement-pension-life.webp",alt:"퇴직 후 건강보험 가입 유형을 확인하는 중장년 부부 일러스트",caption:"퇴직 후에는 피부양자·지역가입자·임의계속가입 가운데 가능한 경로와 예상 보험료를 함께 확인해야 합니다. · 퇴.기.사 제작 일러스트",width:355,height:444}],
    video:{title:"건보료 조정신청과 임의계속가입 제도",embedUrl:"https://www.youtube-nocookie.com/embed/D-5p431l-qY",sourceUrl:"https://www.youtube.com/watch?v=D-5p431l-qY",description:"퇴직 후 임의계속가입의 기본 개념을 설명하는 KBS 참고영상입니다. 2021년 공개 영상이므로 최신 보험료율·자격·기한은 본문에 연결한 국민건강보험공단의 2026년 자료로 다시 확인하세요.",channel:"윤창희의 생존경제_KBS"},
  },
  "ai-first-income-five-methods-seven-day-plan":{
    links:[{label:"원본 영상: 클로드 수익화 방법 5가지",url:"https://www.youtube.com/watch?v=qEVZ7AgB7zI"}],
    video:{title:"클로드로 당장 수익 만드는 확실한 방법 5가지",embedUrl:"https://www.youtube-nocookie.com/embed/qEVZ7AgB7zI",sourceUrl:"https://www.youtube.com/watch?v=qEVZ7AgB7zI",description:"리서치 대행, 디지털 상품, 인스타툰, 미니사이트와 웹게임까지 다섯 가지 AI 수익화 아이디어를 소개한 영상입니다. 본문은 이 아이디어들을 7일 검증 절차와 위험 관리 기준으로 재구성했습니다.",channel:"혼잡스"},
  },
  "unemployment-benefit-eight-steps":{links:[{label:"고용24 실업급여 신청 절차 원문",url:"https://www.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systClId=SC00000254&systId=SI00000411"}]},
  "side-jobs-while-receiving-benefits":{links:[{label:"고용24 실업인정·취업 사실 신고 안내",url:"https://www.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systClId=SC00000254&systId=SI00000411"}]},
  "2026-unemployment-credit-guide":{
    links:[{label:"국민연금공단 실업크레딧 업무 안내서",url:"https://edi.nps.or.kr/cm/main/guide/edi_workguide_new.pdf"}],
    video:{title:"나와 국민연금의 징검다리, 실업크레딧",embedUrl:"https://www.youtube-nocookie.com/embed/z08sPVTv39M",sourceUrl:"https://www.youtube.com/watch?v=z08sPVTv39M",description:"구직급여 수급자가 연금보험료의 25%를 부담하고 지원을 받는 과정을 사례로 설명한 국민연금공단 공식 영상입니다.",channel:"국민연금TV",viewsNote:"확인 당시 약 6.2만 회 재생"},
  },
  "side-income-tax-records":{links:[{label:"국세청 3.3% 원천징수 종합소득세 안내",url:"https://j.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=238978&mi=40483"},{label:"홈택스 신고·지급명세서 확인",url:"https://www.hometax.go.kr/"}]},
};

const thumbnailCatalog = [
  { file: "retirement-checklist.webp", description: "체크 표시가 된 퇴직 준비 체크리스트 일러스트" },
  { file: "second-career-side-job.webp", description: "노트북으로 재취업과 부업을 준비하는 중장년 일러스트" },
  { file: "ai-workflow.webp", description: "노트북과 인공지능을 활용하는 중장년 여성 일러스트" },
  { file: "application-process-timeline.webp", description: "서류와 사람 아이콘으로 구성된 신청 절차 일러스트" },
  { file: "retirement-pension-life.webp", description: "산과 해를 바라보는 은퇴 부부 일러스트" },
  { file: "income-tax-calculation.webp", description: "표와 계산기, 원그래프로 구성된 소득·세금 계산 일러스트" },
  { file: "retirement-asset-growth.webp", description: "집과 새싹, 사다리로 표현한 자산 성장 일러스트" },
  { file: "three-bucket-budget.webp", description: "주거·생활·보험을 나눈 3칸 예산 일러스트" },
  { file: "balanced-income-plan.webp", description: "여러 수입원을 균형 있게 쌓는 저울 일러스트" },
  { file: "content-quality-review.webp", description: "별점 체크리스트를 검토하는 중장년 일러스트" },
] as const;

function thumbnailHash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0);
}

export function getThumbnailIndex(post: Pick<Post, "id" | "slug">) {
  return post.id >= 1 && post.id <= 10 ? post.id - 1 : thumbnailHash(post.slug) % 10;
}

export function getThumbnailSeo(post: Pick<Post, "id" | "slug" | "title">): ThumbnailSeo {
  const image = thumbnailCatalog[getThumbnailIndex(post)];
  return {
    src: `/article-thumbnails/${image.file}`,
    alt: `${post.title} — ${image.description}`,
    width: 355,
    height: 444,
  };
}

export function appendSourceUrl(body: string, sourceUrl?: string) {
  const source = sourceUrl?.trim();
  if (!source || body.includes(source)) return body.trim();
  if (/<(?:p|h[1-6]|div|figure|ul|ol|blockquote|table)\b/i.test(body)) {
    const safeSource = source.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `${body.trim()}<p>출처: <a href="${safeSource}" target="_blank" rel="noreferrer">${safeSource}</a></p>`;
  }
  return `${body.trim()}\n\n출처: ${source}`;
}

export function enrichArticle(post: Post): ArticleEnrichment {
  const text = `${post.title} ${post.body} ${post.tags.join(" ")}`;
  const urls = Array.from(new Set((post.body.match(/https?:\/\/[^\s)<>"']+/g) ?? []).map((url) => url.replace(/[.,;]+$/, ""))));
  const detectedLinks = urls.slice(0, 4).map((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return { label: `${host} 공식자료`, url };
    } catch {
      return { label: "공식자료", url };
    }
  });
  const resource=slugResources[post.slug];
  const officialLinks=Array.from(new Map([...(resource?.links??[]),...(categoryOfficialLinks[post.category]??[]),...detectedLinks].map(link=>[link.url,link])).values()).slice(0,5);
  const glossary = glossaryTerms.filter((term) => text.includes(term)).slice(0, 4).map((term) => ({
    term,
    url: `https://ko.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`,
  }));
  return {
    flow: flows[post.category] ?? flows["퇴직 준비"],
    checklist: checklists[post.category] ?? checklists["퇴직 준비"],
    officialLinks,
    glossary,
    images:resource?.images,
    video:resource?.video,
  };
}
