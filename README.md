# 퇴.기.사 — 100세시대! 퇴직이 기회가 되는 사람들

퇴직 이후의 생활비, 지원제도, 재취업, 새로운 수입과 건강을 다루는 독립 콘텐츠 사이트입니다.
운영: 애드블스 · 공개 주소: https://adbles.com

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript, Tailwind 4
- Vercel 배포 (`vercel.json` → `next build`)
- Node.js 22.13 이상

## 글은 어디에 있나

공개 글의 원본은 **`lib/content.ts`의 `seedPosts`** 입니다. 현재 47편이 들어 있고, 데이터베이스 없이도 사이트는 완전히 동작합니다.

글을 추가하거나 고칠 때는 `lib/content.ts`를 직접 편집하고 `npm test`로 확인한 뒤 PR로 올립니다. `main`에 머지되면 Vercel이 배포하고, GitHub Actions가 바뀐 글의 URL만 IndexNow(네이버·Bing·IndexNow.org)에 제출합니다.

## 자동화

- `.github/workflows/scheduled-publish.yml` — 매일 06:00·18:00 KST에 예약(`status:"scheduled"`) 글 중 시각이 지난 것을 발행 상태로 바꿔 커밋합니다
- `.github/workflows/indexnow.yml` — `lib/content.ts` 변경분의 slug만 검색엔진에 제출합니다

## 사이트 기능

- 글, 카테고리, 검색, RSS, 지역별 `/local` 페이지
- 퇴직자금 지속기간·퇴직금 계산 도구
- sitemap, 정보 사이트맵, robots, 구조화 데이터, `llms.txt`
- 신뢰·편집정책·제휴 고지 페이지

## 콘텐츠편집팀

콘텐츠편집팀장은 `데스크`이고, 분야별 편집자는 `lib/editorial-team.ts`에 정의되어 있습니다(수익실험 `원`, 지원금·세무·노무 `가드`, 생활도구 `툴`, 지역정보 `로컬`, 건강·예방 `케어`, 영상 `큐`, 연금·보험 `김연수`, 세금·보험 `박세온`, 투자·재테크 `박여유`, 생활경제 `서든든`, 유용한 도구 `김기준`).

글에 표시되는 작성자 닉네임은 `BlogPosting` 구조화 데이터의 작성자 정보와 함께 노출됩니다.

## 관리자 편집실

관리자 편집실과 24/7 자동화는 **기본으로 꺼져 있습니다**(`lib/feature-flags.ts`). 꺼진 동안 `/admin`과 관리자 API는 404를 돌려줍니다. 공개 사이트는 `lib/content.ts`에서 글을 읽으므로 영향이 없습니다.

켜려면 배포 환경변수에 `ADMIN_ENABLED=1`을 등록하고, 아래 값을 함께 설정합니다. 코드 변경은 필요 없습니다.

- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`
- `DATABASE_URL` — 영속 저장소(Supabase PostgreSQL). 없으면 저장이 성공한 것처럼 보이고 사라집니다
- `CRON_SECRET` — `/api/cron` 잠금

비밀번호 원문은 소스와 데이터베이스에 저장하지 않습니다. 세션은 8시간 유지되는 HttpOnly, Secure, SameSite=Strict 쿠키를 씁니다.

## 개발

```bash
npm install
npm run dev
npm test          # next build + 회귀 테스트 30개
```

`npm run lint`는 운영 스크립트에 남은 기존 부채로 현재 실패합니다. 자세한 내용은 `HANDOFF.md`를 보세요.

## 더 읽을 문서

- `HANDOFF.md` — 개발 인수인계. 구조와 작업 흐름의 기준 문서
- `PROJECT_STRUCTURE.md` — 디렉터리, 라우트, API, 데이터 구조
- `PROJECT_HISTORY.md` — 작업 이력
- `AGENTS.md` — Next.js 버전 주의사항
