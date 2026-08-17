import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { getAdminSession } from "../../lib/site-admin";
import { ADMIN_ENABLED } from "../../lib/feature-flags";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"글 관리",robots:{index:false,follow:false}};
export default async function AdminPage(){if(!ADMIN_ENABLED)notFound();const session=await getAdminSession();if(!session)redirect("/admin/login");return <AdminClient username={session.username}/>;}
