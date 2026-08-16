# 퇴.기.사 Codex 서브에이전트 이동·설치 안내

이 패키지는 퇴.기.사 대화에서 확정된 콘텐츠 기획, 공식자료 조사, 작성, SEO·GEO, 품질디자인, 홍보, 감사와 릴리스 역할을 Codex 프로젝트 전용 커스텀 에이전트로 옮긴 것이다.

## 포함 파일

```text
.codex/
├── config.toml
└── agents/
    ├── content-director.toml
    ├── official-source-researcher.toml
    ├── content-editor.toml
    ├── seo-geo-editor.toml
    ├── quality-design-reviewer.toml
    ├── promotion-planner.toml
    ├── governance-auditor.toml
    └── release-manager.toml
TOEGISA_AGENT_CONTEXT.md
TOEGISA_SUBAGENT_WORKFLOW.md
SUBAGENT_INSTALL.md
```

## 다른 프로젝트로 옮기기

1. 압축파일을 새 프로젝트의 최상위 폴더에 푼다.
2. 기존 `.codex/config.toml`이 없다면 포함된 파일을 그대로 사용한다.
3. 기존 설정이 있다면 덮어쓰지 말고 `[agents]` 항목만 병합한다.
4. `.codex/agents/*.toml`과 두 개의 `TOEGISA_*.md` 파일을 함께 복사한다.
5. Codex에서 새 프로젝트를 다시 열거나 새 대화를 시작한다.
6. `TOEGISA_SUBAGENT_WORKFLOW.md`의 예시처럼 에이전트 이름을 지정해 작업을 요청한다.

개인 공통 에이전트로 사용하려면 TOML 파일을 `~/.codex/agents/`로 복사할 수 있다. 퇴.기.사 전용 정책이므로 가능하면 프로젝트 범위인 `.codex/agents/` 사용을 권장한다.

## 기존 설정 병합 예시

```toml
[agents]
enabled = true
max_concurrent_threads_per_session = 3
interrupt_message = true
```

모델과 추론 수준은 특정 계정·환경에 고정되지 않도록 에이전트 파일에서 생략했다. 이동한 환경의 메인 대화 설정을 상속한다.

## 보안과 포함 범위

- 관리자 아이디·비밀번호, 해시, 세션키, API 키와 운영 DB 데이터는 포함하지 않는다.
- 이 패키지만으로 사이트 자동 포스팅이나 예약 실행이 시작되지는 않는다.
- 원격 DB, DNS, 외부 계정과 프로덕션 배포는 별도 연결과 명시적 승인이 필요하다.
- 목적지 프로젝트에 같은 이름의 에이전트가 있으면 먼저 백업하고 차이를 검토한다.

공식 형식 참고: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
