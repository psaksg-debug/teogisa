# 사이트 기술지도

현재 작업공간을 확인한 뒤 아래 스냅샷과 차이가 있으면 현행 코드를 따른다.

## 계층

- UI: React 19, TypeScript, Vinext App Router, React Server Components
- 빌드: Vite 8
- 런타임: Cloudflare Worker
- 데이터: Cloudflare D1(SQLite), `DB` 바인딩
- 스키마·마이그레이션: Drizzle ORM, Drizzle Kit, `db/schema.ts`, `drizzle/`
- API: `app/api/*/route.ts`
- 도메인·정책: `lib/`
- 데이터 처리 중심: `lib/repository.ts`
- Worker 진입점: `worker/index.ts`
- 예약실행: `vite.config.ts`의 30분 Cron
- 인증: PBKDF2/HMAC, 서명된 HttpOnly·Secure·SameSite 쿠키
- 캐시·이미지: Cloudflare Cache API와 Images
- 호스팅 선언: `.openai/hosting.json`; D1 사용, R2 미사용 스냅샷

## 상태 판정

- 코드와 빌드만 확인되면 `로컬 구현`이다.
- 원격 마이그레이션 증거가 있어야 `원격 DB 반영`이다.
- 배포 결과와 URL이 있어야 `배포`다.
- 운영 실행로그와 실제 페이지 점검이 있어야 `라이브 검증`이다.

성공한 로컬 빌드만으로 운영 자동화가 실제 실행 중이라고 보고하지 않는다.
