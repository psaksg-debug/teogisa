import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "../../../lib/site-admin";
import { ADMIN_ENABLED } from "../../../lib/feature-flags";
import LoginForm from "./LoginForm";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"관리자 로그인",robots:{index:false,follow:false}};
export default async function AdminLoginPage(){if(!ADMIN_ENABLED)notFound();if(await getAdminSession())redirect("/admin");return <main className="admin-login-shell"><section><img className="brand-logo admin-brand-logo" src="/brand-mark-v2.png" width="72" height="72" alt="애드블스 로고"/><p className="eyebrow">PRIVATE EDITOR</p><h1>독립 편집실 로그인</h1><p>사이트 관리자 계정으로 글쓰기, 검토, 예약발행을 관리합니다.</p><LoginForm/><a className="back-link" href="/">← 공개 사이트로 돌아가기</a></section></main>}
