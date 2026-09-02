# 개발 인수인계

기준일: 2026-09-02 (커밋 `128ad49`)

## 1. 지금 구조 한눈에

| 항목 | 실제 값 |
| --- | --- |
| 프레임워크 | Next.js 16 App Router, React 19, TypeScript, Tailwind 4 |
| 배포 | Vercel (`vercel.json` → `next build`, `cleanUrls`) |
| 공개 주소 | https://adbles.com (`lib/site.ts`의 `SITE_URL`) |
| 사이트명 / 운영사 | 퇴.기.사 / 애드블스 |
| Node | 22.13 이상 |
| 글 원본 | `lib/content.ts`의 `seedPosts` (현재 47편, 전부 `published`) |
| 데이터베이스 | 평소에는 쓰지 않음. 3절 참고 |
| 관리자 편집실·자동화 | **기본 꺼짐** (`ADMIN_ENABLED`) |

## 2. 먼저 읽을 파일

1. `AGENTS.md` — Next.js 버전 주의사항
2. `lib/content.ts` — 글 데이터 원본
3. `lib/site.ts` — 도메인, 사이트명 등 전역 상수
4. `lib/repository.ts` — 저장소 경계
5. `lib/article-html.ts` — 본문 HTML sanitizer
6. `tests/rendered-html.test.mjs` — 사이트 규칙이 사실상 여기에 고정되어 있음
7. `.github/workflows/` — 예약 발행과 IndexNow 자동화

구조를 더 자세히 보려면 `PROJECT_STRUCTURE.md`, 지금까지의 경위는 `PROJECT_HISTORY.md`를 보세요. 둘 다 이 문서와 같은 기준일로 맞춰져 있습니다.

## 3. 글이 어디서 나오는가

공개 사이트의 글은 **`lib/content.ts`에서 직접 나옵니다.** 데이터베이스가 붙지 않아도 사이트는 완전히 동작합니다.

영속 저장소는 관리자 편집실을 켰을 때만 의미가 있고, `lib/repository.ts`가 다음 순서로 고릅니다.

1. `DATABASE_URL`이 있으면 Supabase PostgreSQL (`postgres` 드라이버). 스키마 적용은 `node scripts/migrate-to-supabase.mjs`
2. Cloudflare D1 바인딩 `DB`가 있으면 D1 (`drizzle/` 마이그레이션)
3. 둘 다 없으면 요청 단위 메모리 + `seedPosts`. 저장은 성공한 것처럼 보이고 새로고침하면 사라집니다

현재 어느 상태인지는 `storageDiagnostics()` 또는 `GET /api/diagnostics`로 확인합니다.

## 4. 일상 작업 흐름 — 글 추가·수정

```bash
# 1. lib/content.ts 편집 (필요하면 tests/rendered-html.test.mjs에 규칙 추가)
npm test          # next build + 회귀 테스트 30개
# 2. 브랜치 → PR → main 머지
# 3. Vercel이 자동 배포, IndexNow 워크플로가 바뀐 slug만 제출
```

`main` 직접 푸시는 하지 않습니다. 최근 커밋 이력(#15~#24)이 이 흐름 그대로입니다.

본문 HTML은 `sanitizeArticleHtml()`을 통과하므로 다음 제약이 있습니다.

- `class`는 `allowedClasses` 화이트리스트에 있는 값만 남습니다
- `<a>`의 `rel`은 항상 `noopener noreferrer`로 덮어써집니다. 본문에 `rel="sponsored"`를 직접 넣어도 제거되므로, 제휴 고지는 본문 첫 문단에 문장으로 밝힙니다

## 5. 자동화

GitHub Actions 두 개가 전부입니다. Vercel Cron은 현재 등록되어 있지 않습니다.

- `.github/workflows/scheduled-publish.yml` — 매일 06:00·18:00 KST에 `scripts/publish-due-posts.mjs`를 돌려 `status:"scheduled"`이고 `scheduledAt`이 지난 글을 `published`로 바꿔 커밋·푸시합니다. 푸시되면 Vercel이 배포하고, 이어서 IndexNow에 제출합니다
- `.github/workflows/indexnow.yml` — `main`의 `lib/content.ts`가 바뀌면 변경된 slug만 네이버·Bing·IndexNow.org에 제출합니다

`vercel.json`에 cron을 추가한다면 프로젝트당 2개 이내, 분·시가 고정값이어야 합니다(하루 1회). 테스트가 이 조건을 강제합니다.

## 6. 관리자 편집실과 쓰기 API

`ADMIN_ENABLED=1`이 아니면 `/api/posts`, `/api/automation`, `/api/cron` 등 관리자·자동화 경로는 404를 돌려주고 존재 자체를 드러내지 않습니다(`lib/feature-flags.ts`).

켤 때만 필요한 배포 환경값:

- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`
- `DATABASE_URL` (영속 저장소)
- `CRON_SECRET` (`/api/cron` 잠금. 없으면 응답에 경고만 남고 통과합니다)

그 외 선택 환경값: `INDEXNOW_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `NAVER_INDEXNOW_KEY`.

## 7. 지켜야 할 원칙

- 글 데이터 접근은 `lib/repository.ts` 경계를 통합니다
- 자동 포스팅은 완전자동 공개가 아니라 초안 → 검토 → 예약발행 순서를 유지합니다
- 관리자 쓰기 API는 항상 `ADMIN_ENABLED` 게이트와 사이트 자체 세션 검사를 거칩니다
- 비밀번호 원문, 비밀번호 해시, 세션키를 Git이나 문서에 넣지 않습니다
- 수정 후 `npm test`로 빌드와 회귀 테스트를 확인합니다
- 공개 배포는 로컬 성공과 별개로 사용자의 명시적인 승인을 받은 뒤 진행합니다

`npm run lint`는 현재 54개 에러로 실패합니다. 대상이 `scripts/`, `scheduled-auto-post.ts` 등 운영 스크립트와 테스트 파일에 몰려 있는 기존 부채이므로, 당장은 **새 코드에서 에러를 늘리지 않는 것**을 기준으로 삼습니다.

## 8. 남아 있지만 지금 배포에 쓰이지 않는 것

아래는 ChatGPT Sites + Cloudflare Worker + D1로 운영하던 시절의 잔재입니다. 파일은 그대로 있지만 Vercel 배포 경로에서는 실행되지 않습니다(`tests/rendered-html.test.mjs:236` 주석 참고). 지우지 않은 이유는 D1로 되돌릴 여지를 남겨둔 것이므로, **이 파일들을 근거로 현재 구조를 판단하지 마세요.**

- `worker/index.ts` — Cloudflare Worker 진입점
- `vite.config.ts`, `build/`, `.openai/hosting.json` — vinext + Sites 빌드 연결부
- `drizzle/`, `drizzle.config.ts`, `db/schema.ts` — D1(SQLite) 마이그레이션
- `package.json`의 `vinext`, `wrangler`, `@cloudflare/*` 의존성과 `site-creator-vinext-starter`라는 패키지 이름

## 9. 다른 문서의 상태

| 문서 | 상태 |
| --- | --- |
| `README.md` | 2026-09-02 기준으로 갱신됨 |
| `PROJECT_STRUCTURE.md` | 2026-09-02 기준으로 갱신됨. 디렉터리·라우트·API·데이터 구조 |
| `PROJECT_HISTORY.md` | 2026-09-02 기준으로 갱신됨. 구축부터 현재까지의 경위 |
| `AUDIT_REPORT_*.md`, `CONVERSATION_HANDOFF_*.md`, `handoff/`, 루트의 `*.zip` | 특정 시점 스냅샷. 현재 상태의 근거로 쓰지 않습니다 |
| `_company/`, `COMPANY_RULES.md` 등 조직 문서 | 운영 규칙 문서로 별도 관리됩니다 |
