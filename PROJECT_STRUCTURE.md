# 퇴.기.사 — 프로젝트 구조

기준일: 2026-09-02 (커밋 `128ad49`)
운영 주소: https://adbles.com
관리자 주소: https://adbles.com/admin (기본 비활성, 6절 참고)

## 1. 기술 구성

- 화면: Next.js 16 App Router, React 19, TypeScript, Tailwind 4
- 실행 환경: Vercel Node 런타임 (Node.js 22.13 이상)
- 배포: Vercel — `vercel.json`의 `buildCommand: next build`, `cleanUrls: true`
- 글 데이터: `lib/content.ts`의 `seedPosts` (5절)
- 데이터 접근: `lib/repository.ts` 저장소 계층
- 관리자 인증: 사이트 자체 아이디·비밀번호, 서명된 보안 쿠키

## 2. 핵심 디렉터리

```text
.
├── app/                        # 화면과 서버 API
│   ├── admin/                  # 관리자 로그인·글 목록·리치 편집기
│   ├── api/                    # 글, 자동화, 백업, 세션, 진단 API
│   ├── components/             # 공통 화면(SiteChrome, HeroCarousel, MobileMenu, SeriesNav, ArticleMedia)
│   ├── posts/[slug]/           # 공개 글 상세
│   ├── local/[region]/[topic]/ # 지역 × 주제 페이지
│   ├── tools/                  # 퇴직자금·퇴직금 계산 도구
│   ├── info/sitemap-info.xml/  # 정보 사이트맵
│   ├── rss.xml/                # RSS 피드 (/feed, /rss는 next.config.ts에서 리라이트)
│   ├── sitemap.ts              # 사이트맵
│   └── about, author, privacy, terms, disclosure, editorial-policy, contact
├── lib/                        # 콘텐츠 원본, 저장소, 인증, SEO 보강, 조직 정의
├── public/                     # 썸네일, 히어로·OG 이미지, robots.txt, llms.txt, ads.txt, 소유확인 파일
├── scripts/                    # 예약 발행, IndexNow 제출, SEO 감사, 마이그레이션
├── tests/                      # 렌더링·보안·SEO 회귀 테스트
├── .github/workflows/          # 예약 발행과 IndexNow 자동화
├── db/                         # 스키마 정의 (SQLite/D1용 schema.ts, Postgres용 supabase-schema.ts)
├── drizzle/                    # D1 마이그레이션 (현재 배포 경로에서는 사용하지 않음)
├── worker/, build/, vite.config.ts, .openai/hosting.json   # 레거시, 9절 참고
└── HANDOFF.md                  # 인수인계 기준 문서
```

## 3. 공개 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 홈. 콘텐츠 탐색 중심 (브랜드 소개는 `/about`) |
| `/posts/[slug]` | 글 본문, 썸네일, 시리즈 내비, 관련 글, 구조화 데이터 |
| `/search` | 제목·본문·태그 검색 |
| `/local/[region]/[topic]` | 지역 × 주제 페이지 (ASCII 슬러그 고정) |
| `/challenge` | 수익 실험 워크북 |
| `/official-info` | 공식 자료 모음 |
| `/tools`, `/tools/retirement-runway`, `/tools/severance-pay` | 계산 도구 |
| `/health` | 건강·예방 정보 |
| `/keyword-lab` | 지역별 생활 가이드 허브. `/local`로 가는 진입점 (`robots: noindex`) |
| `/about`, `/author`, `/editorial-policy`, `/privacy`, `/terms`, `/disclosure`, `/contact` | 신뢰·정책 페이지 |
| `/admin`, `/admin/login` | 관리자 (기본 비활성) |

피드·색인용 경로: `/sitemap.xml`, `/info/sitemap-info.xml`, `/rss.xml` (`/feed`, `/rss`에서 리라이트), `/robots.txt`, `/llms.txt`.

## 4. API

모두 `app/api/` 아래에 있고, **`ADMIN_ENABLED=1`이 아니면 404를 돌려줍니다**.

- `GET/POST /api/posts`, `PATCH /api/posts/[id]` — 글 조회·저장·수정
- `POST/DELETE/GET /api/admin/session` — 로그인, 로그아웃, 세션 확인
- `GET/POST /api/automation` — 검토 대기열과 초안 생성
- `GET /api/cron` — 예약 발행과 조직 활동 일괄 실행. `CRON_SECRET` 또는 관리자 세션으로 인증
- `GET /api/diagnostics` — 현재 저장소 백엔드 진단
- `GET /api/export` — 전체 데이터 JSON 백업
- `GET /api/agents`, `/api/audits`, `/api/management`, `/api/promotions`, `/api/activity-plans` — 조직 운영 데이터
- `POST /api/seo/indexing` — 검색엔진 색인 요청

쓰기 API는 관리자 세션을 확인합니다. 공개 글 조회는 저장소 계층에서 `published` 상태만 노출합니다.

## 5. 데이터 구조

**공개 사이트가 읽는 글은 `lib/content.ts`의 `seedPosts` 배열입니다.** 현재 47편이 모두 `published` 상태이고, 데이터베이스가 붙지 않아도 사이트는 완전히 동작합니다. 글 추가·수정은 이 파일을 직접 편집합니다.

영속 저장소는 관리자 편집실을 켰을 때만 의미가 있으며, `lib/repository.ts`가 다음 순서로 고릅니다.

1. `DATABASE_URL`이 있으면 Supabase PostgreSQL (`db/supabase-schema.ts`, `node scripts/migrate-to-supabase.mjs`)
2. Cloudflare D1 바인딩 `DB`가 있으면 D1 (`db/schema.ts`, `drizzle/`)
3. 둘 다 없으면 요청 단위 메모리 + `seedPosts`

현재 상태는 `storageDiagnostics()` 또는 `GET /api/diagnostics`로 확인합니다.

스키마에 정의된 테이블: `posts`, `categories`, `posting_queue`, `site_settings`, `content_agents`, `agent_runs`, `management_issues`, `management_runs`, `originality_checks`, `audit_runs`, `audit_findings`, `member_activity_plans`, `member_activity_runs`.

`posts`에는 제목, 슬러그, 요약, HTML 본문, 카테고리, 태그, 상태, 발행일, 예약일, 읽기 시간, 표지 표시값을 저장합니다. `posting_queue`에는 자동 작성 대상 글, 공식 출처, 검토 상태, 예약 시각, 시도 횟수와 오류를 저장합니다.

## 6. 관리자 보안

관리자 편집실과 24/7 자동화는 `lib/feature-flags.ts`에서 **기본 비활성**입니다. 켜려면 `ADMIN_ENABLED=1`을 등록하고 아래 값을 함께 설정합니다.

- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`
- `DATABASE_URL` (영속 저장소), `CRON_SECRET` (`/api/cron` 잠금)

선택 값: `INDEXNOW_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `NAVER_INDEXNOW_KEY`.

비밀번호 원문과 운영 비밀키는 소스에 포함하지 않습니다. 세션은 HttpOnly, Secure, SameSite=Strict 쿠키를 사용하고 8시간 유지됩니다. 로그인 실패는 저장소 계층에서 15분 단위로 제한합니다.

## 7. 본문 HTML 제약

본문은 `lib/article-html.ts`의 `sanitizeArticleHtml()`을 통과합니다.

- 허용 태그와 허용 `class`가 화이트리스트로 고정되어 있습니다
- `<a>`에는 항상 `target="_blank" rel="noopener noreferrer"`가 붙습니다. 본문에 `rel="sponsored"`를 직접 넣어도 제거되므로 제휴 고지는 본문 첫 문단에 문장으로 밝힙니다
- 이미지가 없는 글에는 기본 시각자료 `figure`가 자동으로 붙습니다

## 8. SEO·GEO 구성

- canonical, Open Graph, X 카드 — 모든 URL이 apex 한 호스트(`https://adbles.com`)만 가리킵니다
- Article·Breadcrumb 구조화 데이터, 이미지 alt·크기·비율
- sitemap, 정보 사이트맵, robots.txt (AI 크롤러 명시 허용), `llms.txt`
- Google AdSense 계정 메타태그, `ads.txt`
- 네이버 사이트 소유확인 파일, IndexNow 키 파일
- 발행·수정 시 변경된 slug만 IndexNow에 제출

## 9. 레거시 (현재 배포 경로에서 실행되지 않음)

ChatGPT Sites + Cloudflare Worker + D1로 운영하던 시절의 잔재입니다. 파일은 남아 있지만 Vercel 배포에서는 실행되지 않습니다.

- `worker/index.ts` — Cloudflare Worker 진입점
- `vite.config.ts`, `build/`, `.openai/hosting.json` — vinext + Sites 빌드 연결부
- `drizzle/`, `drizzle.config.ts`, `db/schema.ts` — D1(SQLite) 마이그레이션
- `package.json`의 `vinext`, `wrangler`, `@cloudflare/*` 의존성과 `site-creator-vinext-starter` 패키지 이름

## 10. 실행과 검사

```bash
npm install
npm run dev
npm test          # next build + 회귀 테스트 30개
npm run seo:audit # SEO 점검
```

`npm run lint`는 `scripts/` 등에 남은 기존 부채로 현재 실패합니다. 신규 코드에서 에러를 늘리지 않는 것을 기준으로 삼습니다.
