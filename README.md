# 퇴직하고 부자되기

퇴직 이후의 돈·일·부업·재테크를 연구하는 독립 콘텐츠 사이트입니다.

## 운영 기능

- D1 기반 글·카테고리·발행 대기열
- 사이트 자체 관리자 로그인
- 초안, 즉시 발행, 예약 발행
- 공식 자료 기반 검토용 초안 대기열
- JSON 전체 백업
- sitemap, robots, 구조화 데이터, llms.txt

## 관리자 보안

관리자 아이디, PBKDF2 비밀번호 해시, 세션 서명키는 Sites 배포 환경에 저장합니다. 비밀번호 원문은 소스와 데이터베이스에 저장하지 않습니다. 관리자 세션은 8시간 동안 유지되는 HttpOnly, Secure, SameSite=Strict 쿠키를 사용합니다.

필수 배포 환경값:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

## 개발

```bash
npm install
npm run dev
npm run build
```
