"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Post } from "../../lib/content";
import type { AgentRun, ContentAgentState, PromotionCampaign, QueueItem } from "../../lib/repository";
import { getPromotionMember, promotionTeam, searchPrograms } from "../../lib/promotion-team";
import RichTextEditor from "./RichTextEditor";

const categories = ["퇴직 준비", "정부지원·실업급여", "정부지원·세무", "재취업·N잡", "블로그·애드센스", "AI 활용", "온라인 부업", "투자·재테크", "실제 수익실험", "유용한 도구", "지역 생활정보", "건강·예방", "영상 큐레이션"];

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
  const [agents,setAgents]=useState<ContentAgentState[]>([]);
  const [agentRuns,setAgentRuns]=useState<AgentRun[]>([]);
  const [promotions,setPromotions]=useState<PromotionCampaign[]>([]);
  const [selected, setSelected] = useState<Post | null>(null);
  const [message, setMessage] = useState("편집실을 준비하고 있습니다…");
  const [saving, setSaving] = useState(false);
  const editorPanelRef = useRef<HTMLElement>(null);

  async function load() {
    const [postsResponse, queueResponse, agentsResponse, promotionsResponse] = await Promise.all([fetch("/api/posts"), fetch("/api/automation"),fetch("/api/agents"),fetch("/api/promotions")]);
    const postsData = await postsResponse.json();
    const queueData = await queueResponse.json();
    const agentsData=await agentsResponse.json();
    const promotionsData=await promotionsResponse.json();
    if (postsResponse.ok && queueResponse.ok && agentsResponse.ok && promotionsResponse.ok) {
      setPosts(postsData.posts);
      setQueue(queueData.queue);
      setAgents(agentsData.agents);
      setAgentRuns(agentsData.runs);
      setPromotions(promotionsData.campaigns);
      const requestedPostId = Number(new URLSearchParams(window.location.search).get("post"));
      const requestedPost = postsData.posts.find((post: Post) => post.id === requestedPostId);
      if (requestedPost) {
        setSelected(requestedPost);
        setMessage(`‘${requestedPost.title}’ 글을 편집기로 열었습니다.`);
      } else {
        setMessage("");
      }
    } else {
      setMessage(postsData.error || queueData.error || agentsData.error || promotionsData.error || "편집실 자료를 불러오지 못했습니다.");
    }
  }

  useEffect(() => { void load(); }, []);

  function openEditor(post: Post) {
    setSelected(post);
    setMessage(`‘${post.title}’ 글을 편집기로 열었습니다.`);
    window.history.replaceState(null, "", `/admin?post=${post.id}#article-editor`);
    requestAnimationFrame(() => {
      editorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function startNewPost() {
    setSelected(null);
    window.history.replaceState(null, "", "/admin#article-editor");
    requestAnimationFrame(() => {
      editorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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

  async function controlAgent(id:string,action:"run"|"status",status?:"active"|"paused"){
    setSaving(true);const response=await fetch("/api/agents",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,action,status})});const data=await response.json();setSaving(false);if(response.ok){setMessage(action==="run"?`‘${data.post.title}’ 글을 사이트에 바로 발행했습니다.`:`에이전트를 ${status==="active"?"가동":"일시정지"}했습니다.`);await load();}else setMessage(data.error);
  }

  async function preparePromotion(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const postId=Number(new FormData(event.currentTarget).get("promotionPostId"));setSaving(true);const response=await fetch("/api/promotions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"prepare",postId})});const data=await response.json();setSaving(false);if(response.ok){setMessage(`‘${data.campaign.title}’ 홍보안을 준비했습니다.`);await load();}else setMessage(data.error);
  }

  async function finishPromotion(id:number){
    setSaving(true);const response=await fetch("/api/promotions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"execute",id})});const data=await response.json();setSaving(false);if(response.ok){setMessage(`‘${data.campaign.title}’ 홍보 실행을 기록했습니다.`);await load();}else setMessage(data.error);
  }

  async function copyPromotion(text:string,label:string){try{await navigator.clipboard.writeText(text);setMessage(`${label}을 복사했습니다. 원하는 채널에 붙여넣어 확인한 뒤 게시하세요.`);}catch{setMessage("복사하지 못했습니다. 문구를 직접 선택해 복사하세요.");}}

  async function logout(){await fetch("/api/admin/session",{method:"DELETE"});window.location.href="/admin/login";}

  const count = (status: string) => posts.filter((post) => post.status === status).length;

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div><strong>퇴직생활 수익화 프로젝트 · 편집실</strong><span>{username} · 독립 관리자</span></div>
        <div className="admin-actions"><a className="admin-button secondary" href="/api/export">전체 백업</a><a className="admin-button secondary" href="/">사이트 보기</a><button className="admin-button secondary" type="button" onClick={logout}>로그아웃</button></div>
      </header>

      <div className="admin-dashboard">
        <section>
          <div className="admin-stats"><div className="stat"><span>발행 글</span><strong>{count("published")}</strong></div><div className="stat"><span>초안</span><strong>{count("draft")}</strong></div><div className="stat"><span>예약</span><strong>{count("scheduled")}</strong></div></div>
          <div className="panel">
            <div className="panel-title"><div><p className="eyebrow">CONTENT LIBRARY</p><h2>콘텐츠 보관함</h2></div><button className="admin-button secondary" type="button" onClick={startNewPost}>새 글</button></div>
            {message && <p className="admin-message" role="status">{message}</p>}
            <div className="admin-list">{posts.map((post) => <button type="button" className={`admin-item ${selected?.id === post.id ? "selected" : ""}`} onClick={() => openEditor(post)} aria-label={`${post.title} 글 편집하기`} aria-pressed={selected?.id === post.id} key={post.id}><span className={`status status-${post.status}`}>{post.status === "published" ? "발행" : post.status === "scheduled" ? "예약" : "초안"}</span><p>{post.title}</p><span>{post.category} · {post.publishedAt || (post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("ko-KR") : "날짜 미정")}</span></button>)}</div>
          </div>
        </section>

        <section className="panel editor-panel" id="article-editor" ref={editorPanelRef}>
          <div className="panel-title"><div><p className="eyebrow">{selected ? "EDIT ARTICLE" : "NEW ARTICLE"}</p><h2>{selected ? `글 수정 · ${selected.title}` : "새 글 작성"}</h2></div>{selected && <button className="admin-button secondary" type="button" onClick={() => setSelected(null)}>취소</button>}</div>
          <form key={selected?.id ?? "new"} onSubmit={savePost}>
            <div className="field"><label htmlFor="title">제목</label><input id="title" name="title" required defaultValue={selected?.title} placeholder="독자가 찾을 구체적인 제목" /></div>
            <div className="field"><label htmlFor="excerpt">한 줄 요약</label><input id="excerpt" name="excerpt" defaultValue={selected?.excerpt} placeholder="검색 결과에 보일 120자 안팎의 설명" /></div>
            <div className="form-row"><div className="field"><label htmlFor="category">카테고리</label><select id="category" name="category" defaultValue={selected?.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="field"><label htmlFor="visual">표지 표시</label><input id="visual" name="visual" maxLength={6} defaultValue={selected?.visual} placeholder="예: 30D" /></div></div>
            <div className="field"><label htmlFor="tags">태그</label><input id="tags" name="tags" defaultValue={selected?.tags.join(", ")} placeholder="쉼표로 구분: 퇴직, 생활비" /></div>
            <div className="field"><label htmlFor="sourceUrl">공식자료 주소 <span>(선택)</span></label><input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://www.work24.go.kr/..." /><small>입력하면 본문 끝에 출처 링크가 추가되고 공개 글의 공식자료 영역에 자동 표시됩니다.</small></div>
            <div className="field"><div className="field-label" id="body-editor-label">본문 편집기</div><RichTextEditor initialValue={selected?.body}/></div>
            <div className="form-row"><div className="field"><label htmlFor="status">저장 상태</label><select id="status" name="status" defaultValue={selected?.status || "draft"}><option value="draft">초안</option><option value="scheduled">예약</option><option value="published">바로 발행</option></select></div><div className="field"><label htmlFor="scheduledAt">예약 일시</label><input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={datetimeLocal(selected?.scheduledAt ?? null)} /></div></div>
            <input type="hidden" name="publishedAt" value={selected?.publishedAt || ""} />
            <button className="admin-button" disabled={saving}>{saving ? "저장 중…" : selected ? "변경사항 저장" : "글 저장"}</button>
          </form>
        </section>

        <section className="panel automation-panel">
          <div className="panel-title"><div><p className="eyebrow">REVIEW QUEUE</p><h2>자동 포스팅 준비</h2></div><span className="queue-count">검토 {queue.filter((item) => item.status === "review").length}</span></div>
          <p className="panel-help">공식 자료 주소와 주제를 넣으면 검토 체크리스트가 포함된 초안을 만듭니다. 공개 글에는 전용 썸네일, 핵심 흐름 다이어그램, 확인표, 공식자료와 위키백과 용어 링크가 자동 구성됩니다. 초안을 확인해 예약 상태로 바꾸면 지정 시각 이후 자동으로 공개됩니다.</p>
          <form className="queue-form" onSubmit={createQueueDraft}>
            <div className="field"><label htmlFor="topic">글 주제</label><input id="topic" name="topic" required placeholder="예: 2026년 실업크레딧 신청 방법" /></div>
            <div className="field"><label htmlFor="sourceUrl">공식 자료 주소</label><input id="sourceUrl" name="sourceUrl" required type="url" placeholder="https://www.work24.go.kr/..." /></div>
            <div className="form-row"><div className="field"><label htmlFor="queueCategory">카테고리</label><select id="queueCategory" name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="field"><label htmlFor="queueTime">희망 발행 시각</label><input id="queueTime" name="scheduledAt" type="datetime-local" /></div></div>
            <button className="admin-button" disabled={saving}>검토용 초안 만들기</button>
          </form>
          <div className="queue-list">{queue.map((item) => <button type="button" key={item.id} onClick={() => { const post = posts.find((candidate) => candidate.id === item.postId); if (post) openEditor(post); }}><span>{item.status === "review" ? "검토 필요" : item.status}</span><strong>{item.title}</strong><small>{item.sourceUrl}</small></button>)}</div>
        </section>

        <section className="panel automation-panel agent-control-panel">
          <div className="panel-title"><div><p className="eyebrow">CONTENT AGENTS</p><h2>분야별 에이전트 운영실</h2></div><span className="queue-count">가동 {agents.filter(agent=>agent.status==="active").length}/{agents.length}</span></div>
          <p className="panel-help">각 에이전트는 정해진 공식 출처와 주제를 사용해 16시간마다 글을 준비합니다. 공식 링크, 적용 사례, 비교표, 실행 체크리스트와 충분한 본문 길이를 모두 갖춘 글만 바로 공개하며, 검증된 관련 영상이 있는 분야는 미리보기를 함께 넣습니다. 품질 기준에 미달하면 발행하지 않고 실패 기록으로 남깁니다.</p>
          <div className="agent-grid">{agents.map(agent=><article className={`agent-card ${agent.status}`} key={agent.id}><div><span>{agent.status==="active"?"가동 중":"일시정지"}</span><small>{agent.category}</small></div><h3>{agent.name}</h3><p>{agent.mission}</p><dl><div><dt>자동 발행 주기</dt><dd>{agent.cadenceHours<24?`${agent.cadenceHours}시간`:`${Math.round(agent.cadenceHours/24)}일`}</dd></div><div><dt>다음 실행</dt><dd>{agent.nextRunAt?new Date(agent.nextRunAt).toLocaleString("ko-KR"):"미정"}</dd></div><div><dt>공식 출처</dt><dd>{agent.sources.length}곳</dd></div></dl><div className="agent-actions"><button type="button" disabled={saving||agent.status!=="active"} onClick={()=>controlAgent(agent.id,"run")}>지금 발행하기</button><button type="button" disabled={saving} onClick={()=>controlAgent(agent.id,"status",agent.status==="active"?"paused":"active")}>{agent.status==="active"?"일시정지":"다시 가동"}</button></div></article>)}</div>
          <div className="agent-run-log"><h3>최근 작업 기록</h3>{agentRuns.length===0?<p>아직 실행 기록이 없습니다.</p>:agentRuns.map(run=><div key={run.id}><span>{run.status==="review"?"검토 대기":run.status==="published"?"자동 발행":"실패"}</span><strong>{run.agentName}</strong><p>{run.topic}</p><time>{new Date(run.createdAt).toLocaleString("ko-KR")}</time></div>)}</div>
        </section>

        <section className="panel promotion-agent-panel">
          <div className="panel-title"><div><p className="eyebrow">PROMOTION AGENT</p><h2>홍보 에이전트 작업실</h2></div><span className="queue-count">준비 {promotions.filter(item=>item.status==="prepared").length}</span></div>
          <p className="panel-help">발행된 글을 선택하면 SNS용 짧은 문구, 커뮤니티 소개문, 해시태그와 원문 링크를 준비합니다. 외부 채널에는 자동으로 무단 게시하지 않으며, 문구를 확인하고 직접 공유한 뒤 실행 완료를 기록합니다. 콘텐츠 에이전트가 새 글을 발행하면 홍보안도 자동으로 준비됩니다.</p>
          <form className="promotion-agent-form" onSubmit={preparePromotion}>
            <div className="field"><label htmlFor="promotionPostId">홍보할 발행 글</label><select id="promotionPostId" name="promotionPostId" required defaultValue=""><option value="" disabled>글을 선택하세요</option>{posts.filter(post=>post.status==="published").map(post=><option value={post.id} key={post.id}>{post.title}</option>)}</select></div>
            <button className="admin-button" disabled={saving}>홍보안 준비하기</button>
          </form>
          <div className="promotion-campaigns">{promotions.length===0?<p className="promotion-empty">아직 준비된 홍보안이 없습니다. 발행 글을 선택해 첫 홍보안을 만드세요.</p>:promotions.map(campaign=><article className={`promotion-card ${campaign.status}`} key={campaign.id}>
            <header><div><span>{campaign.status==="prepared"?"확인·실행 대기":"실행 기록 완료"}</span><h3>{campaign.title}</h3></div><time>{new Date(campaign.executedAt||campaign.createdAt).toLocaleString("ko-KR")}</time></header>
            <div className="promotion-channel-list" aria-label="추천 홍보 채널">{campaign.channels.map(channel=><span key={channel}>{channel}</span>)}</div>
            <section><strong>SNS용 짧은 문구</strong><p>{campaign.socialCopy}</p><button type="button" disabled={saving} onClick={()=>copyPromotion(campaign.socialCopy,"SNS 홍보 문구")}>문구 복사</button></section>
            <section><strong>커뮤니티용 소개문</strong><p>{campaign.communityCopy}</p><button type="button" disabled={saving} onClick={()=>copyPromotion(campaign.communityCopy,"커뮤니티 홍보 문구")}>소개문 복사</button></section>
            <div className="promotion-actions"><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(campaign.socialCopy)}`} target="_blank" rel="noreferrer">X 공유 화면 열기</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://adbles.com/posts/${campaign.slug}`)}`} target="_blank" rel="noreferrer">Facebook 공유 화면 열기</a>{campaign.status==="prepared"&&<button type="button" disabled={saving} onClick={()=>finishPromotion(campaign.id)}>게시 완료로 표시</button>}</div>
          </article>)}</div>
        </section>

        <section className="panel promotion-department-panel">
          <div className="panel-title"><div><p className="eyebrow">SEARCH GROWTH TEAM</p><h2>홍보부 조직·SEO 운영실</h2></div><span className="queue-count">AI 실무자 {promotionTeam.length}명</span></div>
          <p className="panel-help">역할이 바로 연상되는 짧은 닉네임을 사용하는 AI 조직입니다. 검색 결과 점검과 개선안 작성은 반복 수행하되, 외부 게시·검색도구 설정 변경·배포는 사람의 확인과 승인 뒤에만 실행합니다.</p>
          <div className="promotion-team-grid">{promotionTeam.map(member=><article className="promotion-member-card" key={member.id}><div><span>{member.name}</span><small>AI 실무자</small></div><h3>{member.title}</h3><p>{member.scope}</p><strong>{member.cadence}</strong><ul>{member.kpis.map(kpi=><li key={kpi}>{kpi}</li>)}</ul></article>)}</div>
          <div className="search-programs"><h3>검색엔진별 상시 관리</h3>{searchPrograms.map(program=>{const owner=getPromotionMember(program.ownerId);return <article key={program.id}><header><div><span>{program.engine}</span><strong>{owner?.name} · {owner?.title}</strong></div><small>{program.successMetric}</small></header><ol>{program.routine.map(item=><li key={item}>{item}</li>)}</ol></article>;})}</div>
        </section>
      </div>
    </main>
  );
}
