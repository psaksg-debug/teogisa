// 애드블스가 운영하는 사이트 목록. /site 페이지의 지도와 목록이 이 하나를 함께 쓴다.
// 두 곳에 따로 적으면 사이트를 추가할 때 한쪽만 고쳐져 어긋난다.
//
// 주소를 적기 전에 반드시 실제로 열리는지 확인한다. 준비 중인 도메인을 미리
// 올려두면 방문자에게는 깨진 링크가 되고, 광고 심사에서도 문제가 된다.
export type SiteNode = {
  id: string;
  name: string;
  domain: string;
  href: string;
  group: "content" | "tool" | "partner";
  summary: string;
  detail: string;
  ownership: "자사 운영" | "공동 운영";
};

export const siteGroups = {
  content: { label: "콘텐츠", note: "생활 정보를 쌓아가는 사이트" },
  tool: { label: "도구", note: "가입 없이 바로 쓰는 웹 도구" },
  partner: { label: "공동 운영", note: "다른 곳과 함께 만드는 사이트" },
} as const;

export const siteRoot = {
  name: "퇴직생활연구소",
  domain: "adbles.com",
  href: "/",
  summary: "퇴직 이후의 생활비, 지원제도, 새 일과 건강을 다루는 본 사이트입니다.",
} as const;

export const siteNodes: readonly SiteNode[] = [
  {
    id: "isatips",
    name: "이사준비백서",
    domain: "isatips.adbles.com",
    href: "https://isatips.adbles.com/",
    group: "content",
    summary: "이사 준비부터 입주·정착까지의 생활정보",
    detail: "견적 비교, 포장이사, 입주청소, 가전 이전설치처럼 이사할 때 한 번씩 막히는 문제를 순서대로 정리합니다.",
    ownership: "자사 운영",
  },
  {
    id: "proshot",
    name: "ProShot AI 사진 스튜디오",
    domain: "proshot.adbles.com",
    href: "https://proshot.adbles.com/",
    group: "tool",
    summary: "휴대폰 셀카를 증명사진·프로필 사진으로",
    detail: "정면 셀카 한 장으로 증명사진, 비즈니스 헤드샷, 스튜디오 프로필을 무료로 만듭니다. 여권과 공식 신분증은 해당 기관 규격을 따로 확인하세요.",
    ownership: "자사 운영",
  },
  {
    id: "myreceipt",
    name: "영수증 정리도우미",
    domain: "myreceipt.adbles.com",
    href: "https://myreceipt.adbles.com/",
    group: "tool",
    summary: "영수증 사진을 A4 한 장으로",
    detail: "영수증 사진을 여러 장 올리면 가게명·날짜·금액을 정리하고 합계를 낸 뒤 A4 크기 PDF로 저장합니다.",
    ownership: "자사 운영",
  },
  {
    id: "vpn",
    name: "VPN 비교",
    domain: "vpn.adbles.com",
    href: "https://vpn.adbles.com/",
    group: "tool",
    summary: "공용 와이파이에서 쓸 VPN 고르기",
    detail: "노로그 정책과 독립 감사 여부, 서버 위치, 자동 갱신 요금을 기준으로 견주어 봅니다. 제휴 링크가 포함될 수 있습니다.",
    ownership: "자사 운영",
  },
  {
    id: "suriwiki",
    name: "수리위키",
    domain: "suriwiki.com",
    href: "https://suriwiki.com/",
    group: "partner",
    summary: "지역별 집수리 시공 사례와 견적",
    detail: "누수, 배수구, 창호, 전기, 도배 같은 집수리 항목을 지역별로 찾아봅니다. 애드블스가 다른 운영자와 함께 만드는 사이트입니다.",
    ownership: "공동 운영",
  },
];
