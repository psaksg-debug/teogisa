# 퇴.기.사 교차 공급자 인수인계 시작점

기준시각: 2026-08-15 21:48 KST

이 문서는 Claude, Gemini, Codex 또는 다른 코딩 에이전트가 퇴.기.사 사이트와 운영체계를 다른 서버에 재구축할 때 처음 읽는 문서입니다. 웹 화면만 복사하지 말고 코드, 데이터, 조직, 권한, 자동화, 승인, 실패기록, 검증과 롤백을 함께 옮깁니다.

## 전달물

- 전체 소스 묶음: `toegisa-source-handoff-2026-08-15.tar.gz`
- 단독 스킬 묶음: `migrate-toegisa-platform-skill-2026-08-15.zip`
- 스킬 원본: `skills/migrate-toegisa-platform/SKILL.md`
- 현재 상태표: `toegisa-handoff-manifest-2026-08-15.json`
- 최종 체크섬: `CHECKSUMS.sha256`

전체 재구축에는 전체 소스 묶음을 사용합니다. 단독 스킬 ZIP은 이미 소스를 가진 다른 작업공간에 운영·이식 절차만 설치할 때 사용합니다.

## 전체 소스 묶음으로 시작

```bash
tar -xzf toegisa-source-handoff-2026-08-15.tar.gz
cd <extracted-project>
node handoff/skills/migrate-toegisa-platform/scripts/validate-handoff.mjs .
node handoff/skills/migrate-toegisa-platform/scripts/bootstrap-provider.mjs . claude
```

Gemini는 마지막 인자를 `gemini`, 다른 공급자는 `generic`으로 바꿉니다. 생성된 `CLAUDE.md`, `GEMINI.md` 또는 `AGENTS.md`를 먼저 읽고, 그 문서가 가리키는 `SKILL.md`를 실행합니다.

이미 같은 이름의 공급자 지침 파일이 있으면 부트스트랩은 덮어쓰지 않습니다. 기존 지침을 검토·병합한 뒤에만 `--force`를 사용합니다.

## 단독 스킬 ZIP으로 시작

스킬을 대상 프로젝트 내부의 원하는 디렉터리에 풉니다. 경로는 고정되어 있지 않습니다.

```bash
unzip migrate-toegisa-platform-skill-2026-08-15.zip -d .agent-skills
node .agent-skills/migrate-toegisa-platform/scripts/bootstrap-provider.mjs . gemini
```

부트스트랩이 실제 압축 해제 위치를 계산하므로 원래 Google Drive 경로나 `handoff/skills/...` 경로가 없어도 됩니다.

## 첫 검증 순서

1. Node.js 22.13 이상을 설치합니다.
2. `npm ci`로 잠금파일 그대로 의존성을 설치합니다.
3. `npm test`로 빌드와 10개 회귀테스트를 실행합니다.
4. 현재 호스트와 가장 가까운 목표라면 독립 Cloudflare Workers + D1 경로를 우선 검토합니다.
5. Vercel, VPS, Docker 또는 다른 서버라면 데이터베이스, 인증, 스케줄러, 비밀관리, 로그, 백업, 배포 어댑터를 먼저 결정합니다.
6. 테스트 데이터로 미승인 초안이 공개되지 않는지, 예약 작업이 정확히 한 번 실행되는지, 실패가 보존되는지 확인합니다.
7. 375px 모바일, 데스크톱, 관리자 로그인, 링크·임베드, RSS, sitemap, JSON-LD와 백업복원을 검증합니다.

## 반드시 별도로 전달할 항목

보안 때문에 아래 항목은 압축파일에 들어 있지 않습니다.

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- 운영 D1의 인증된 JSON 내보내기와 데이터베이스 네이티브 백업
- 대상 호스트 계정, 토큰, DNS 권한, 검색도구 권한

비밀값은 대상 호스트의 비밀관리 기능으로 입력합니다. 채팅, 문서, ZIP, Git에 넣지 않습니다. 운영 데이터는 대표의 원격 데이터 승인 후 내보내고 행 수·slug·상태·시간·관계를 대조합니다.

## 조직·자동화 복원 기준

- 5개 부서, 36명, 대표 1명의 조직을 `organization.json`에서 복원합니다.
- 36명 모두의 개별 반복업무를 `member-activity-policy.json`에서 복원합니다.
- 8개 역할형 에이전트, 6개 콘텐츠 에이전트, 6개 권한 프로필을 각각 유지합니다.
- 시간당 7개 비정치 섹션 후보를 조사하되 완성 초안은 전체에서 최대 1개만 만들고 검토상태로 둡니다.
- AI 초안 → 사람 검토 → 승인증거 → 예약 → 공개 순서를 유지합니다.
- 사이트 공개, 외부 SNS 게시, 유료광고, 원격 DB, DNS, 배포는 서로 다른 승인입니다.
- 채팅 작업 예약은 운영 스케줄러가 아닙니다. 데이터베이스 큐와 대상 호스트 스케줄러에 내구성 있게 재구축하고 실제 시험 1회를 증명합니다.

## 현재 확인된 범위

- 현재 소스에서 `npm test` 빌드 및 10/10 테스트가 통과했습니다.
- 스킬 검증기는 조직과 개인계획의 36대36 일치, 역할·권한·예약·승인 규칙, 경로 이식성, 비밀파일 금지를 검사합니다.
- 전체 소스 묶음은 Git 내부, 의존성, 빌드 결과, 로컬 DB, 로그, 비밀파일과 중첩 압축파일을 제외합니다.
- 목표 서버, 운영 데이터 내보내기, 대상 비밀값, 실제 배포, DNS 전환, 운영 스케줄러, 백업복원은 아직 실행하지 않았습니다.

따라서 이 전달물은 재구축 절차와 소스의 완결성을 높이지만, 운영 데이터와 비밀값 없이 곧바로 운영 전환이 끝난 것은 아닙니다. `toegisa-handoff-manifest-2026-08-15.json`의 미검증 항목을 증거로 채운 뒤에만 전환 완료로 표시합니다.
