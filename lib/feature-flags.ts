// 관리자 편집실과 24/7 자동화는 기본 비활성이다.
//
// 공개 사이트의 글은 lib/content.ts에서 나오므로 이 둘이 꺼져 있어도 사이트는 완전히 동작한다.
// DB(Supabase/D1)가 붙지 않은 환경에서 관리자 저장은 성공한 것처럼 보이고도 사라지는데,
// 그 실패를 계속 쫓는 대신 쓰지 않는 경로 자체를 닫는 쪽을 택했다.
//
// 꺼져 있는 동안 필요 없어지는 것: DATABASE_URL, CRON_SECRET, 관리자 비밀값.
// 다시 켜려면 배포 환경변수에 ADMIN_ENABLED=1 을 등록한다. 코드 변경은 필요 없다.
export const ADMIN_ENABLED = process.env.ADMIN_ENABLED === "1";

// 관리자·자동화 경로는 꺼져 있을 때 존재 자체를 드러내지 않는다.
export function disabledSurfaceResponse() {
  return Response.json({ error: "사용할 수 없는 경로입니다." }, { status: 404 });
}
