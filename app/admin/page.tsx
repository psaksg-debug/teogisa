import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { getAdminSession } from "../../lib/site-admin";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"글 관리",robots:{index:false,follow:false}};
export default async function AdminPage(){const session=await getAdminSession();if(!session)redirect("/admin/login");return <AdminClient username={session.username}/>;}
