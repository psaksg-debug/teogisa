// 검색 색인에서 뺄 글. 본문과 URL은 그대로 두고 robots meta 와 사이트맵에서만 제외한다.
// 바이브 코딩 1인 창업 부트캠프 15편(vibe-coding-bootcamp-1~15)은 외부 강의 영상의 목차를 따라가는
// 구조라 독창성이 낮아 애드센스 심사 전까지 noindex 로 둔다. (사용자 결정 2026-11-15)
export function isNoindexPost(slug: string): boolean {
  return /^vibe-coding-bootcamp-\d+$/.test(slug);
}