# 프로젝트 상태 스냅샷

작성 시각 기준: 2026-08-15 KST. 이 값은 이동 후 반드시 다시 검증한다.

## 저장소

- 작업 경로: `/Users/sgk/Library/CloudStorage/GoogleDrive-playskang@gmail.com/내 드라이브/11 퇴직하고 부자되기`
- 브랜치: `main`
- 작성 당시 HEAD: `3017117` (`Order same-day posts by newest publication`)
- 이미 존재하던 미추적 파일: `FACEBOOK_AD_SIDE_HUSTLE_HANDOFF.md`, `retire-rich-lab-full-backup-2026-08-11.zip`
- 이 패키지 생성 전 추적 파일 수정은 없었다. 이동 환경에서는 반드시 `git status`로 재확인한다.

## 공개 SEO 상태

- `npm run seo:audit -- https://adbles.com`: 치명 0, 경고 0
- 과거 404였던 한글 건강보험 URL: 현재 HTTP 200
- 현재 영문 건강보험 URL: HTTP 200
- robots: `public/robots.txt`
- sitemap: `app/sitemap.ts`
- RSS: `app/rss.xml/route.ts`
- ads.txt: `public/ads.txt`
- SEO 감사기: `scripts/seo-audit.mjs`
- 공식 기관 자동 링크·URL 정정: `lib/article-html.ts`
- 구조화 데이터·canonical·작성자 표시: `app/posts/[slug]/page.tsx`

기본 감사 0건은 Search Console의 실제 색인 완료를 뜻하지 않는다. Google·Naver·Bing·GA4 계정 데이터는 이 인수인계에 포함되지 않으며 접근이 없으면 미확인으로 처리한다.

## 과거 장애와 현재 판정

- `rss.xml 가져올 수 없음`: RSS 라우트 배포·접근 문제를 수정한 이력이 있다. 현재 URL을 다시 확인한다.
- `Robots.txt를 찾을 수 없음`: Google 실시간 테스트에서 발생했다. 정적 `public/robots.txt`로 전환되었으며 공개 URL은 다시 검사해야 한다.
- 건강보험 한글 슬러그 404: URL 디코딩·NFC 정규화와 이전 슬러그 호환 처리가 적용되었고 2026-08-15 공개 URL은 200이었다.
- 과거 도메인은 다른 사이트에 연결되어 색인된 이력이 있다. 소유권·사이트 변경 신호가 재처리되는 동안 Search Console 상태가 지연될 수 있다.
- 오래된 국세청 `j.nts.go.kr` 링크는 현재 공식 `www.nts.go.kr` 안내로 교체하는 처리가 구현되었다.

## 조직과 이름

홍보부 운영 닉네임은 `픽, 랭크, 네오, 빙고, 소스, 크롤, 펄스`다.

현재 코드의 편집 책임자는 `데스크`다. `lib/editorial-team.ts`에는 현재 다음 공개 작성자 후보가 있다.

- 원, 가드, 툴, 김기준, 로컬, 케어, 김연수, 박세온, 박여유, 서든든, 큐

사용자는 대화에서 `글에 표시되는 편집자 6명을 각각 정하고 이름은 짧고 임팩트 있는 닉네임으로` 요청했다. 현재 명단은 그 조건과 완전히 일치하지 않으므로, 서브에이전트는 여섯 명으로 임의 축소하거나 기존 글 작성자를 바꾸지 말고 다음을 먼저 보고해야 한다.

1. 공개 글에 실제 표시되는 이름별 글 수
2. 자동화 에이전트와 작성자 매핑
3. 기존 URL·구조화 데이터·작성자 신뢰 신호에 미치는 영향
4. 유지/통합/개명 선택안

## 자동화

- 이름: `홍보부 SEO·마케팅 상시 운영`
- ID: `seo`
- 형식: 현재 대화에 연결된 heartbeat
- 상태: ACTIVE
- 일정: 매일 09:00, 18:00 KST
- 같은 목적의 자동화를 중복 생성하지 않는다.

## 배포와 승인 상태

이 문서에는 유효한 Production 배포 승인, Cloudflare 토큰, D1 변경 승인, 검색도구 계정 변경 승인이 포함되어 있지 않다. 과거의 `승인` 메시지는 당시 범위에만 사용된 것으로 간주한다. 새 원격 변경은 구체적인 대상과 예상 효과를 제시한 뒤 새 승인을 받는다.

