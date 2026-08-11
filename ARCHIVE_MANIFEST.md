# 백업 압축파일 안내

## 포함 항목

- 현재 시점의 전체 프로젝트 소스
- `.openai/hosting.json` 배포 구조 설정
- D1/Drizzle 스키마와 마이그레이션
- 이미지·썸네일·SEO 공개 자산
- 테스트 및 빌드 설정
- 프로젝트 구조·작업 이력·인수인계 문서
- 전체 커밋 이력을 담은 `retire-rich-lab-git-history.bundle`
- 압축 당시 파일 목록과 SHA-256 체크섬

## 보안 및 용량 때문에 제외한 항목

- `node_modules/`: `npm install`로 복원 가능
- `dist/`, `.next/`, `.vinext/`: 다시 생성되는 빌드 결과와 캐시
- `.wrangler/`: 로컬 실행 캐시와 로그
- `.git/`: 원본 내부 폴더 대신 Git bundle로 전체 이력 제공
- `.env*`: 운영 비밀번호·세션키 등 비밀값 보호
- 기존 ZIP·임시 파일·운영 로그

## 운영 데이터 안내

Sites의 실제 D1 데이터는 이 로컬 소스 폴더에 저장되지 않습니다. 관리자 화면에서 `전체 백업`을 눌러 받은 JSON 파일을 이 ZIP과 별도로 보관해야 운영 중 작성한 글과 대기열 데이터를 완전하게 이전할 수 있습니다.

## Git 이력 복원 예시

```bash
git clone retire-rich-lab-git-history.bundle retire-rich-lab
```

그 후 ZIP의 최신 소스 파일을 복원된 폴더에 덮어쓰면 압축 시점의 작업 상태까지 이어갈 수 있습니다.
