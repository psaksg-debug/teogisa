"use client";
import { useEffect,useState,type FormEvent } from "react";
import Link from "next/link";
import type { Post } from "../../lib/content";
const categories=["퇴직 준비","정부지원·실업급여","재취업·N잡","블로그·애드센스","AI 활용","온라인 부업","투자·재테크","실제 수익실험"];

export default function AdminClient(){
  const [posts,setPosts]=useState<Post[]>([]);const [message,setMessage]=useState("불러오는 중…");const [saving,setSaving]=useState(false);
  async function load(){const r=await fetch("/api/posts");const d=await r.json();if(r.ok){setPosts(d.posts);setMessage("");}else setMessage(d.error);}
  useEffect(()=>{void load()},[]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);const form=new FormData(e.currentTarget);const payload=Object.fromEntries(form.entries());const r=await fetch("/api/posts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();setSaving(false);if(r.ok){setMessage(`‘${d.post.title}’ 저장됨`);e.currentTarget.reset();await load();}else setMessage(d.error);}
  const count=(s:string)=>posts.filter(p=>p.status===s).length;
  return <main className="admin-shell">
    <header className="admin-top"><strong>퇴직하고 부자되기 · 편집실</strong><div className="admin-actions"><a className="admin-button secondary" href="/api/export">전체 백업</a><Link className="admin-button secondary" href="/">사이트 보기</Link></div></header>
    <div className="admin-grid">
      <section>
        <div className="admin-stats"><div className="stat"><span>발행 글</span><strong>{count("published")}</strong></div><div className="stat"><span>초안</span><strong>{count("draft")}</strong></div><div className="stat"><span>예약</span><strong>{count("scheduled")}</strong></div></div>
        <div className="panel"><h2>콘텐츠 보관함</h2>{message&&<p role="status">{message}</p>}<div className="admin-list">{posts.map(p=><div className="admin-item" key={p.id}><span className="status">{p.status==="published"?"발행":p.status==="scheduled"?"예약":"초안"}</span><p>{p.title}</p><span>{p.category} · {p.publishedAt||p.scheduledAt||"날짜 미정"}</span></div>)}</div></div>
      </section>
      <section className="panel"><h2>새 글 작성</h2><form onSubmit={submit}>
        <div className="field"><label htmlFor="title">제목</label><input id="title" name="title" required placeholder="독자가 찾을 구체적인 제목"/></div>
        <div className="field"><label htmlFor="excerpt">한 줄 요약</label><input id="excerpt" name="excerpt" placeholder="검색 결과에 보일 120자 안팎의 설명"/></div>
        <div className="form-row"><div className="field"><label htmlFor="category">카테고리</label><select id="category" name="category">{categories.map(c=><option key={c}>{c}</option>)}</select></div><div className="field"><label htmlFor="visual">표지 표시</label><input id="visual" name="visual" maxLength={6} placeholder="예: 30D"/></div></div>
        <div className="field"><label htmlFor="tags">태그</label><input id="tags" name="tags" placeholder="쉼표로 구분: 퇴직, 생활비"/></div>
        <div className="field"><label htmlFor="body">본문</label><textarea id="body" name="body" required placeholder={'첫 문단을 입력하세요.\n\n## 소제목\n\n내용을 이어갑니다.'}/></div>
        <div className="form-row"><div className="field"><label htmlFor="status">저장 상태</label><select id="status" name="status"><option value="draft">초안</option><option value="scheduled">예약</option><option value="published">바로 발행</option></select></div><div className="field"><label htmlFor="scheduledAt">예약 일시</label><input id="scheduledAt" name="scheduledAt" type="datetime-local"/></div></div>
        <button className="admin-button" disabled={saving}>{saving?"저장 중…":"글 저장"}</button>
      </form></section>
    </div>
  </main>;
}
