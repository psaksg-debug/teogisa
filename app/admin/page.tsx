import type { Metadata } from "next";
import Link from "next/link";
import AdminClient from "./AdminClient";
import { requireSiteOwner } from "../../lib/site-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "글 관리", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await requireSiteOwner("/admin");
  if (!user) {
    return (
      <main className="access-denied">
        <span className="brand-mark">퇴</span>
        <h1>편집실 접근 권한이 없습니다.</h1>
        <p>이 화면은 사이트 소유자 계정만 사용할 수 있습니다.</p>
        <Link className="primary-button" href="/">공개 사이트로 돌아가기 <span>→</span></Link>
      </main>
    );
  }
  return <AdminClient displayName={user.displayName} email={user.email} />;
}
