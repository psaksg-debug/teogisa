"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Post } from "../../lib/content";
import type { QueueItem } from "../../lib/repository";

const categories = ["퇴직 준비", "정부지원·실업급여", "재취업·N잡", "블로그·애드센스", "AI 활용", "온라인 부업", "투자·재테크", "실제 수익실험"];

function datetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function AdminClient({ username }: { username: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<Post | null>(null);
  const [message, setMessage] = useState("편집실을 준비하고 있습니다…");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [postsResponse, queueResponse] = await Promise.all([fetch("/api/posts"), fetch("/api/automation")]);
    const postsData = await postsResponse.json();
    const queueData = await queueResponse.json();
    if (postsResponse.ok && queueResponse.ok) {
      setPosts(postsData.posts);
      setQueue(queueData.queue);
      setMessage("");
    } else {
      setMessage(postsData.error || queueData.error || "편집실 자료를 불러오지 못했습니다.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    const payload = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
    const response = await fetch(selected ? `/api/posts/${selected.id}` : "/api/posts", {
      method: selected ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setSaving(false);
    if (response.ok) {
      setMessage(`‘${data.post.title}’ 글을 저장했습니다.`);
      setSelected(null);
      form.reset();
      await load();
    } else setMessage(data.error);
  }

  async function createQueueDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
    setSaving(true);
    const response = await fetch("/api/automation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    setSaving(false);
    if (response.ok) {
      setMessage(`‘${data.post.title}’ 검토용 초안을 만들었습니다.`);
      form.reset();
      await load();
    } else setMessage(data.error);
  }

  async function logout(){await fetch("/api/admin/session",{method:"DELETE"});window.location.href="/admin/login";}

  const count = (status: string) => posts.filter((post) => post.status === status).length;

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div><strong>퇴직하고 부자되기 · 편집실</strong><span>{username} · 독립 관리자</span></div>
        <div className="admin-actions"><a className="admin-button secondary" href="/api/export">전체 백업</a><a className="admin-button secondary" href="/">사이트 보기</a><button className="admin-button secondary" type="button" onClick={logout}>로그아웃</button></div>
      </header>

      <div className="admin-dashboard">
        <section>
          <div className="admin-stats"><div className="stat"><span>발행 글</span><strong>{count("published")}</strong></div><div className="stat"><span>초안</span><strong>{count("draft")}</strong></div><div className="stat"><span>예약</span><strong>{count("scheduled")}</strong></div></div>
          <div className="panel">
            <div className="panel-title"><div><p className="eyebrow">CONTENT LIBRARY</p><h2>콘텐츠 보관함</h2></div><button className="admin-button secondary" onClick={() => setSelected(null)}>새 글</button></div>
            {message && <p className="admin-message" role="status">{message}</p>}
            <div className="admin-list">{posts.map((post) => <button className={`admin-item ${selected?.id === post.id ? "selected" : ""}`} onClick={() => setSelected(post)} key={post.id}><span className={`status status-${post.status}`}>{post.status === "published" ? "발행" : post.status === "scheduled" ? "예약" : "초안"}</span><p>{post.title}</p><span>{post.category} · {post.publishedAt || (post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("ko-KR") : "날짜 미정")}</span></button>)}</div>
          </div>
        </section>

        <section className="panel editor-panel">
          <div className="panel-title"><div><p className="eyebrow">{selected ? "EDIT ARTICLE" : "NEW ARTICLE"}</p><h2>{selected ? "글 수정" : "새 글 작성"}</h2></div>{selected && <button className="admin-button secondary" onClick={() => setSelected(null)}>취소</button>}</div>
          <form key={selected?.id ?? "new"} onSubmit={savePost}>
            <div className="field"><label htmlFor="title">제목</label><input id="title" name="title" required defaultValue={selected?.title} placeholder="독자가 찾을 구체적인 제목" /></div>
            <div className="field"><label htmlFor="excerpt">한 줄 요약</label><input id="excerpt" name="excerpt" defaultValue={selected?.excerpt} placeholder="검색 결과에 보일 120자 안팎의 설명" /></div>
            <div className="form-row"><div className="field"><label htmlFor="category">카테고리</label><select id="category" name="category" defaultValue={selected?.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="field"><label htmlFor="visual">표지 표시</label><input id="visual" name="visual" maxLength={6} defaultValue={selected?.visual} placeholder="예: 30D" /></div></div>
            <div className="field"><label htmlFor="tags">태그</label><input id="tags" name="tags" defaultValue={selected?.tags.join(", ")} placeholder="쉼표로 구분: 퇴직, 생활비" /></div>
            <div className="field"><label htmlFor="body">본문</label><textarea id="body" name="body" required defaultValue={selected?.body} placeholder={'첫 문단을 입력하세요.\n\n## 소제목\n\n내용을 이어갑니다.'} /></div>
            <div className="form-row"><div className="field"><label htmlFor="status">저장 상태</label><select id="status" name="status" defaultValue={selected?.status || "draft"}><option value="draft">초안</option><option value="scheduled">예약</option><option value="published">바로 발행</option></select></div><div className="field"><label htmlFor="scheduledAt">예약 일시</label><input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={datetimeLocal(selected?.scheduledAt ?? null)} /></div></div>
            <input type="hidden" name="publishedAt" value={selected?.publishedAt || ""} />
            <button className="admin-button" disabled={saving}>{saving ? "저장 중…" : selected ? "변경사항 저장" : "글 저장"}</button>
          </form>
        </section>

        <section className="panel automation-panel">
          <div className="panel-title"><div><p className="eyebrow">REVIEW QUEUE</p><h2>자동 포스팅 준비</h2></div><span className="queue-count">검토 {queue.filter((item) => item.status === "review").length}</span></div>
          <p className="panel-help">공식 자료 주소와 주제를 넣으면 검토 체크리스트가 포함된 초안을 만듭니다. 초안을 확인해 예약 상태로 바꾸면 지정 시각 이후 자동으로 공개됩니다.</p>
          <form className="queue-form" onSubmit={createQueueDraft}>
            <div className="field"><label htmlFor="topic">글 주제</label><input id="topic" name="topic" required placeholder="예: 2026년 실업크레딧 신청 방법" /></div>
            <div className="field"><label htmlFor="sourceUrl">공식 자료 주소</label><input id="sourceUrl" name="sourceUrl" required type="url" placeholder="https://www.work24.go.kr/..." /></div>
            <div className="form-row"><div className="field"><label htmlFor="queueCategory">카테고리</label><select id="queueCategory" name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="field"><label htmlFor="queueTime">희망 발행 시각</label><input id="queueTime" name="scheduledAt" type="datetime-local" /></div></div>
            <button className="admin-button" disabled={saving}>검토용 초안 만들기</button>
          </form>
          <div className="queue-list">{queue.map((item) => <button key={item.id} onClick={() => setSelected(posts.find((post) => post.id === item.postId) ?? null)}><span>{item.status === "review" ? "검토 필요" : item.status}</span><strong>{item.title}</strong><small>{item.sourceUrl}</small></button>)}</div>
        </section>
      </div>
    </main>
  );
}
