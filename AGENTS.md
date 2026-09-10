<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 애드블스(adbles.com) 프로젝트 운영 및 에이전트 작업 규칙

이 문서는 Codex, Claude Code, Antigravity 등 모든 AI 에이전트가 공유하는 공통 운영 지침이다.

---

## 1. Codespaces와 로컬 교차 작업 2단계 필수 규칙 (충돌 방지 원칙)

Codespaces와 로컬(맥북)을 번갈아가며 작업할 때는 반드시 다음 2단계를 엄수한다:

1. **작업을 시작할 때 👉 `git pull origin main` 먼저 실행!**
   - 맥북이든 Codespace든 자리에 앉아 작업을 시작하기 직전에 터미널에서 `git pull origin main`을 실행하여 최신 상태로 맞춘다.
   - 원격 저장소에 다른 환경에서 올린 커밋이 있는지 먼저 확인하고 동기화한 뒤 변경 작업을 시작한다.
2. **작업을 마쳤을 때 👉 `commit & push` 완료하기!**
   - 자리를 떠나거나 다른 환경으로 넘어가기 전에 항상 작업한 내용을 `git commit` & `git push` 해둔다.
   - 변경사항을 남겨둔 채 환경을 이동하면 다음 세션에서 반드시 충돌(Conflict)이 발생하므로 작업을 마치면 즉시 푸시까지 완료한다.

> ⚠️ **자동 배포 및 릴리스 파이프라인 필수 수칙**:
> - 배포 및 릴리스 작업을 시작할 때도 무조건 `git pull origin main`을 먼저 수행하여 원격 최신 변경사항을 가져온 뒤 빌드/검증을 시작한다.
> - 배포 검증(`npm test` 31개 테스트 통과 필수) 및 빌드가 끝나면 작업 내용을 빠짐없이 `git commit` & `git push`하여 원격과 로컬이 어긋나지 않도록 한다.

---

## 2. 빌드, 테스트 및 검증 규칙

- 모든 코드 변경 후 반드시 `npm test`를 실행하여 31개 회귀 테스트 통과 여부를 검증한다.
- 날짜 형식은 반드시 `YYYY-MM-DD` 문자열을 엄수한다.
- 네이버 사이트 소유확인 메타 태그(`naver-site-verification`), IndexNow 키, 애드센스 메타 태그는 절대 삭제하거나 덮어쓰지 않는다.
- 링크 클릭 시 페이지 전체 새로고침 없이 Next.js SPA 전환이 되도록 `next/link`의 `<Link>` 컴포넌트를 우선 사용한다.

---

## 3. 배포 파이프라인 (`v_ship`)

- Vercel 프로덕션 배포는 `npm test` 통과 및 `git push origin main` 완료 후 실행된다.
- 자동 배포 시 원격과 로컬의 브랜치 동기화 상태를 반드시 확인한다.
