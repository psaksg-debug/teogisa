# 실행 런북

## 1. 환경 확인

```bash
pwd
git status --short
git log -5 --oneline --decorate
node --version
npm --version
```

작업 트리에 사용자 변경이 있으면 덮어쓰지 않는다. 관련 파일과 겹치면 diff를 먼저 읽고 변경 범위를 분리한다.

## 2. 기본 검증

```bash
npm run seo:audit -- https://adbles.com
npm test
git diff --check
```

공개 엔드포인트:

- `https://adbles.com/robots.txt`
- `https://adbles.com/sitemap.xml`
- `https://adbles.com/rss.xml`
- `https://adbles.com/ads.txt`

## 3. 사이트맵 전수 감사

각 URL에서 다음을 확인한다.

- 최종 상태 코드 200
- 대표 도메인 `https://adbles.com`
- self-canonical 또는 의도된 리디렉션
- `noindex` 없음
- 고유한 title과 description
- H1 한 개
- 게시글은 BlogPosting과 작성자 정보 포함
- 사이트맵·RSS·내부 링크의 URL 일치
- 이미지 대체텍스트와 모바일 가로 넘침
- 독자 질문에 바로 답하는 문단, 공식 출처, 갱신 기준일

## 4. 검색엔진별 점검

- Google: Search Console 소유권, URL 검사, 사이트맵 처리, 페이지 색인 사유
- Naver: Search Advisor 소유권, robots, 사이트맵·RSS, 문서 수집
- Bing: Webmaster Tools 소유권, 사이트맵, URL 제출, IndexNow 적용 가능성
- AI 검색: OAI-SearchBot·GPTBot·PerplexityBot·ClaudeBot 접근, 명확한 저자·출처·직접 답변·구조화 데이터

계정 접근이 없으면 설정을 추측하거나 변경하지 않고 사용자 수행 절차와 정확한 입력값만 제공한다.

## 5. 공식 링크 판정

- 검색 결과 페이지가 아니라 공식 상세 페이지를 연다.
- HEAD 403이나 시간초과만으로 깨진 링크라고 단정하지 않는다. 일반 GET과 브라우저 접근을 확인한다.
- 오래된 URL의 리디렉션·상태·콘텐츠를 확인한다.
- 변경 후 실제 HTML에서 링크 문구, 목적 URL, `target`, `rel`, 중첩·반복 여부를 검증한다.

## 6. 마케팅 준비

`lib/marketing-campaigns.ts`의 채널 계획을 기준으로 네이버 블로그, 네이버 카페, 카카오톡, Facebook, X의 UTM을 준비한다. 게시·광고 집행은 하지 않는다.

## 7. 심각도

- 긴급: 전체 사이트 5xx, robots 전체 차단, 대표 도메인 오류, 사이트맵 전체 실패
- 높음: 사이트맵의 발행 글 404, noindex, 잘못된 canonical, 구조화 데이터·작성자 누락
- 중간: 깨진 공식 출처, 중복 제목, 약한 내부 링크, 오래된 조건·금액
- 낮음: 표현 개선, 추가 FAQ, 재홍보 후보

## 8. 보고 예시

```text
결론: 주의
검사: 사이트맵 30 URL, 발행 글 16건
신규: 글 1건 canonical 불일치
지속: Search Console 데이터 미연결
해결: 깨진 공식 링크 1건 로컬 수정
검증: npm test 통과, 모바일 렌더링 통과
공개 반영: 미배포
승인 대기: Production 배포 — canonical 수정 공개 반영 목적
다음: 사이트맵 재검사, 공식 링크 전수 확인, 검색 기회 글 갱신안
```

