import { env } from "cloudflare:workers";
import { seedPosts, type Post } from "./content";
import { contentAgentProfiles, type ContentAgentProfile } from "./content-agents";

export type QueueItem = {
  id: number;
  postId: number;
  title: string;
  status: string;
  sourceUrl: string | null;
  scheduledAt: string | null;
  attempts: number;
};

export type ContentAgentState = ContentAgentProfile & { status:"active"|"paused"; nextRunAt:string|null; lastRunAt:string|null; topicCursor:number };
export type AgentRun = { id:number; agentId:string; agentName:string; status:string; topic:string; postId:number|null; message:string|null; createdAt:string };
export type PromotionCampaign = { id:number; postId:number; title:string; slug:string; status:"prepared"|"executed"; headline:string; socialCopy:string; communityCopy:string; hashtags:string[]; channels:string[]; createdAt:string; executedAt:string|null };

let initialized = false;

async function db() {
  const d1 = (env as unknown as { DB?: D1Database }).DB;
  if (!d1) throw new Error("DB binding unavailable");

  if (!initialized) {
    await d1.batch([
      d1.prepare(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', category TEXT NOT NULL, tags_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'draft', published_at TEXT, scheduled_at TEXT, reading_minutes INTEGER NOT NULL DEFAULT 5, visual TEXT NOT NULL DEFAULT 'NEW', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS posting_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'waiting', source_url TEXT, scheduled_at TEXT, attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(post_id) REFERENCES posts(id))`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS admin_login_attempts (attempt_key TEXT PRIMARY KEY, failures INTEGER NOT NULL DEFAULT 0, window_started_at INTEGER NOT NULL, blocked_until INTEGER NOT NULL DEFAULT 0)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS content_agents (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, mission TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', cadence_hours INTEGER NOT NULL DEFAULT 168, sources_json TEXT NOT NULL DEFAULT '[]', topics_json TEXT NOT NULL DEFAULT '[]', video_json TEXT, next_run_at TEXT, last_run_at TEXT, topic_cursor INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS agent_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id TEXT NOT NULL, status TEXT NOT NULL, topic TEXT NOT NULL, post_id INTEGER, message TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(agent_id) REFERENCES content_agents(id), FOREIGN KEY(post_id) REFERENCES posts(id))`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS promotion_campaigns (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'prepared', headline TEXT NOT NULL, social_copy TEXT NOT NULL, community_copy TEXT NOT NULL, hashtags_json TEXT NOT NULL DEFAULT '[]', channels_json TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, executed_at TEXT, FOREIGN KEY(post_id) REFERENCES posts(id))`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_queue_status_scheduled ON posting_queue(status, scheduled_at)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_content_agents_status_next ON content_agents(status, next_run_at)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_created ON agent_runs(agent_id, created_at)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_promotion_status_created ON promotion_campaigns(status, created_at)`),
    ]);

    for (const post of seedPosts) {
      await d1
        .prepare(
          "INSERT OR IGNORE INTO posts (title,slug,excerpt,body,category,tags_json,status,published_at,scheduled_at,reading_minutes,visual) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          post.title,
          post.slug,
          post.excerpt,
          post.body,
          post.category,
          JSON.stringify(post.tags),
          post.status,
          post.publishedAt,
          post.scheduledAt,
          post.readingMinutes,
          post.visual,
        )
        .run();
    }
    for (const agent of contentAgentProfiles) {
      const nextRunAt=new Date(Date.now()+agent.cadenceHours*60*60*1000).toISOString();
      await d1.prepare(`INSERT INTO content_agents (id,name,category,mission,status,cadence_hours,sources_json,topics_json,video_json,next_run_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          category=excluded.category,
          mission=excluded.mission,
          cadence_hours=excluded.cadence_hours,
          sources_json=excluded.sources_json,
          topics_json=excluded.topics_json,
          video_json=excluded.video_json,
          next_run_at=CASE
            WHEN content_agents.next_run_at IS NULL OR content_agents.next_run_at>excluded.next_run_at THEN excluded.next_run_at
            ELSE content_agents.next_run_at
          END,
          updated_at=CURRENT_TIMESTAMP`)
        .bind(agent.id,agent.name,agent.category,agent.mission,"active",agent.cadenceHours,JSON.stringify(agent.sources),JSON.stringify(agent.topics),agent.video?JSON.stringify(agent.video):null,nextRunAt).run();
    }
    initialized = true;
  }
  return d1;
}

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: Number(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt ?? ""),
    body: String(row.body ?? ""),
    category: String(row.category),
    tags: JSON.parse(String(row.tags_json ?? "[]")),
    status: row.status as Post["status"],
    publishedAt: String(row.published_at ?? ""),
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    readingMinutes: Number(row.reading_minutes ?? 5),
    visual: String(row.visual ?? "NEW"),
  };
}

export async function publishDuePosts() {
  const d1 = await db();
  const now = new Date().toISOString();
  await d1.batch([
    d1.prepare("UPDATE posts SET status='published', published_at=substr(?,1,10), updated_at=CURRENT_TIMESTAMP WHERE status='scheduled' AND scheduled_at IS NOT NULL AND scheduled_at<=?").bind(now, now),
    d1.prepare("UPDATE posting_queue SET status='published' WHERE status='scheduled' AND scheduled_at IS NOT NULL AND scheduled_at<=?").bind(now),
  ]);
}

export async function getPublishedPosts() {
  try {
    await publishDuePosts();
    const d1 = await db();
    const result = await d1
      .prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC, id DESC")
      .all();
    return result.results.map((row) => mapPost(row as Record<string, unknown>));
  } catch {
    return seedPosts.filter((post) => post.status === "published");
  }
}

export async function getAllPosts() {
  await publishDuePosts();
  const d1 = await db();
  const result = await d1.prepare("SELECT * FROM posts ORDER BY updated_at DESC, id DESC").all();
  return result.results.map((row) => mapPost(row as Record<string, unknown>));
}

export async function getPost(slug: string) {
  try {
    await publishDuePosts();
    const d1 = await db();
    const row = await d1
      .prepare("SELECT * FROM posts WHERE slug=? AND status='published'")
      .bind(slug)
      .first();
    return row
      ? mapPost(row as Record<string, unknown>)
      : seedPosts.find((post) => post.slug === slug) ?? null;
  } catch {
    return seedPosts.find((post) => post.slug === slug) ?? null;
  }
}

export async function createPost(input: Omit<Post, "id">) {
  const d1 = await db();
  const row = await d1
    .prepare("INSERT INTO posts (title,slug,excerpt,body,category,tags_json,status,published_at,scheduled_at,reading_minutes,visual) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING *")
    .bind(input.title, input.slug, input.excerpt, input.body, input.category, JSON.stringify(input.tags), input.status, input.publishedAt || null, input.scheduledAt, input.readingMinutes, input.visual)
    .first();
  return mapPost(row as Record<string, unknown>);
}

export async function updatePost(id: number, input: Omit<Post, "id">) {
  const d1 = await db();
  const row = await d1
    .prepare("UPDATE posts SET title=?,slug=?,excerpt=?,body=?,category=?,tags_json=?,status=?,published_at=?,scheduled_at=?,reading_minutes=?,visual=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *")
    .bind(input.title, input.slug, input.excerpt, input.body, input.category, JSON.stringify(input.tags), input.status, input.publishedAt || null, input.scheduledAt, input.readingMinutes, input.visual, id)
    .first();
  if (!row) throw new Error("수정할 글을 찾지 못했습니다.");
  await d1
    .prepare("UPDATE posting_queue SET status=?, scheduled_at=? WHERE post_id=?")
    .bind(input.status === "published" ? "published" : input.status, input.scheduledAt, id)
    .run();
  return mapPost(row as Record<string, unknown>);
}

export async function createAutomationDraft(input: {
  topic: string;
  category: string;
  sourceUrl: string;
  scheduledAt: string | null;
}) {
  const post = await createPost({
    title: input.topic,
    slug: `${input.topic.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`,
    excerpt: "공식 자료를 바탕으로 검토 중인 콘텐츠 초안입니다.",
    body: `이 글은 아래 공식 자료를 바탕으로 작성하는 검토용 초안입니다.\n\n## 독자가 궁금한 핵심 질문\n\n- 누가 대상인가요?\n- 언제, 어디에서 신청하나요?\n- 놓치기 쉬운 조건은 무엇인가요?\n\n## 편집 전 확인\n\n숫자, 날짜, 신청 조건을 원문과 다시 대조하세요. 개인의 상황에 따라 적용 결과가 달라질 수 있다는 안내를 추가하세요.\n\n출처: ${input.sourceUrl}`,
    category: input.category,
    tags: ["자동 초안", "공식 자료"],
    status: "draft",
    publishedAt: "",
    scheduledAt: input.scheduledAt,
    readingMinutes: 4,
    visual: "DRAFT",
  });
  const d1 = await db();
  await d1
    .prepare("INSERT INTO posting_queue (post_id,status,source_url,scheduled_at) VALUES (?,?,?,?)")
    .bind(post.id, "review", input.sourceUrl, input.scheduledAt)
    .run();
  return post;
}

export async function getPostingQueue() {
  const d1 = await db();
  const result = await d1
    .prepare("SELECT q.id,q.post_id,p.title,q.status,q.source_url,q.scheduled_at,q.attempts FROM posting_queue q JOIN posts p ON p.id=q.post_id ORDER BY q.created_at DESC")
    .all();
  return result.results.map((row) => ({
    id: Number(row.id),
    postId: Number(row.post_id),
    title: String(row.title),
    status: String(row.status),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    attempts: Number(row.attempts ?? 0),
  } satisfies QueueItem));
}

export async function exportAll() {
  const d1 = await db();
  const [posts, categories, queue, settings, agents, agentRuns, promotions] = await Promise.all([
    d1.prepare("SELECT * FROM posts").all(),
    d1.prepare("SELECT * FROM categories").all(),
    d1.prepare("SELECT * FROM posting_queue").all(),
    d1.prepare("SELECT * FROM site_settings").all(),
    d1.prepare("SELECT * FROM content_agents").all(),
    d1.prepare("SELECT * FROM agent_runs").all(),
    d1.prepare("SELECT * FROM promotion_campaigns").all(),
  ]);
  return {
    format: "retire-rich-content-v1",
    exportedAt: new Date().toISOString(),
    posts: posts.results,
    categories: categories.results,
    postingQueue: queue.results,
    siteSettings: settings.results,
    contentAgents: agents.results,
    agentRuns: agentRuns.results,
    promotionCampaigns: promotions.results,
  };
}

function mapAgent(row:Record<string,unknown>):ContentAgentState{return{id:String(row.id),name:String(row.name),category:String(row.category),mission:String(row.mission),status:row.status==="paused"?"paused":"active",cadenceHours:Number(row.cadence_hours),sources:JSON.parse(String(row.sources_json??"[]")),topics:JSON.parse(String(row.topics_json??"[]")),video:row.video_json?JSON.parse(String(row.video_json)):undefined,nextRunAt:row.next_run_at?String(row.next_run_at):null,lastRunAt:row.last_run_at?String(row.last_run_at):null,topicCursor:Number(row.topic_cursor??0)};}
function mapAgentRun(row:Record<string,unknown>):AgentRun{return{id:Number(row.id),agentId:String(row.agent_id),agentName:String(row.agent_name??""),status:String(row.status),topic:String(row.topic),postId:row.post_id?Number(row.post_id):null,message:row.message?String(row.message):null,createdAt:String(row.created_at)};}
function mapPromotion(row:Record<string,unknown>):PromotionCampaign{return{id:Number(row.id),postId:Number(row.post_id),title:String(row.title),slug:String(row.slug),status:row.status==="executed"?"executed":"prepared",headline:String(row.headline),socialCopy:String(row.social_copy),communityCopy:String(row.community_copy),hashtags:JSON.parse(String(row.hashtags_json??"[]")),channels:JSON.parse(String(row.channels_json??"[]")),createdAt:String(row.created_at),executedAt:row.executed_at?String(row.executed_at):null};}
function htmlEscape(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function todayInSeoul(value:Date){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(value);}

export async function getContentAgentDashboard(){const d1=await db();const [agents,runs]=await Promise.all([d1.prepare("SELECT * FROM content_agents ORDER BY name").all(),d1.prepare("SELECT r.*,a.name AS agent_name FROM agent_runs r JOIN content_agents a ON a.id=r.agent_id ORDER BY r.created_at DESC,r.id DESC LIMIT 30").all()]);return{agents:agents.results.map(row=>mapAgent(row as Record<string,unknown>)),runs:runs.results.map(row=>mapAgentRun(row as Record<string,unknown>))};}

export async function setContentAgentStatus(id:string,status:"active"|"paused"){const d1=await db();const row=await d1.prepare("UPDATE content_agents SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *").bind(status,id).first();if(!row)throw new Error("에이전트를 찾지 못했습니다.");return mapAgent(row as Record<string,unknown>);}

export async function getPromotionCampaigns(){const d1=await db();const result=await d1.prepare("SELECT c.*,p.title,p.slug FROM promotion_campaigns c JOIN posts p ON p.id=c.post_id ORDER BY c.created_at DESC,c.id DESC LIMIT 30").all();return result.results.map(row=>mapPromotion(row as Record<string,unknown>));}

export async function preparePromotionCampaign(postId?:number){
  const d1=await db();
  const post=postId
    ? await d1.prepare("SELECT * FROM posts WHERE id=? AND status='published'").bind(postId).first()
    : await d1.prepare("SELECT p.* FROM posts p WHERE p.status='published' AND NOT EXISTS (SELECT 1 FROM promotion_campaigns c WHERE c.post_id=p.id) ORDER BY p.published_at DESC,p.id DESC LIMIT 1").first();
  if(!post)throw new Error("홍보할 새 발행 글을 찾지 못했습니다.");
  const existing=await d1.prepare("SELECT c.*,p.title,p.slug FROM promotion_campaigns c JOIN posts p ON p.id=c.post_id WHERE c.post_id=?").bind(Number(post.id)).first();
  if(existing)return mapPromotion(existing as Record<string,unknown>);
  const title=String(post.title);const excerpt=String(post.excerpt??"").trim();const slug=String(post.slug);const category=String(post.category);
  const postTags=JSON.parse(String(post.tags_json??"[]")) as string[];
  const hashtags=Array.from(new Set(["퇴직생활수익화프로젝트",category.replace(/[^0-9A-Za-z가-힣]/g,""),...postTags.map(tag=>String(tag).replace(/[^0-9A-Za-z가-힣]/g,""))].filter(Boolean))).slice(0,6);
  const url=`https://adbles.com/posts/${slug}`;
  const summary=excerpt||`${title}에 관한 핵심 내용과 실행 순서를 정리했습니다.`;
  const headline=`${title} | 퇴직생활 수익화 프로젝트`;
  const socialCopy=`${summary}\n\n지금 확인하기: ${url}\n${hashtags.map(tag=>`#${tag}`).join(" ")}`;
  const communityCopy=`퇴직 이후의 돈·일·건강을 준비하는 분께 도움이 될 글을 공유합니다.\n\n${title}\n${summary}\n\n본문에서는 확인해야 할 기준과 바로 실행할 순서를 함께 정리했습니다.\n${url}\n\n※ 중요한 결정 전에는 글에 연결된 공식 기관의 최신 원문도 확인하세요.`;
  const channels=["네이버 블로그·카페","카카오톡","페이스북","X"];
  const created=await d1.prepare("INSERT INTO promotion_campaigns (post_id,status,headline,social_copy,community_copy,hashtags_json,channels_json) VALUES (?,'prepared',?,?,?,?,?) RETURNING *").bind(Number(post.id),headline,socialCopy,communityCopy,JSON.stringify(hashtags),JSON.stringify(channels)).first();
  return mapPromotion({...created,title,slug} as Record<string,unknown>);
}

export async function executePromotionCampaign(id:number){const d1=await db();const row=await d1.prepare("UPDATE promotion_campaigns SET status='executed',executed_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *").bind(id).first();if(!row)throw new Error("홍보 작업을 찾지 못했습니다.");const post=await d1.prepare("SELECT title,slug FROM posts WHERE id=?").bind(Number(row.post_id)).first();return mapPromotion({...row,...post} as Record<string,unknown>);}

export async function runContentAgent(id:string){
  const d1=await db();
  const row=await d1.prepare("SELECT * FROM content_agents WHERE id=?").bind(id).first();
  if(!row)throw new Error("에이전트를 찾지 못했습니다.");
  const agent=mapAgent(row as Record<string,unknown>);
  if(agent.status!=="active")throw new Error("일시정지된 에이전트입니다.");
  const topic=agent.topics[agent.topicCursor%agent.topics.length]??`${agent.category} 업데이트`;
  const sources=agent.sources.map(source=>`<li><a href="${htmlEscape(source.url)}" target="_blank" rel="noopener noreferrer">${htmlEscape(source.name)} 원문 확인</a></li>`).join("");
  const video=agent.video?`<h2>함께 볼 공식 영상</h2><div class="embedded-video"><iframe src="${htmlEscape(agent.video.embedUrl)}" title="${htmlEscape(agent.video.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><a href="${htmlEscape(agent.video.sourceUrl)}" target="_blank" rel="noopener noreferrer">영상 원문과 채널 확인</a></p>`:"";
  const body=`<p><strong>${htmlEscape(topic)}</strong>을 확인할 때 필요한 핵심 질문과 공식 확인처를 한곳에 정리했습니다. 제도·세금·건강 정보는 개인 조건과 적용 시점에 따라 달라질 수 있으므로 아래 원문에서 최신 기준을 함께 확인하세요.</p><h2>먼저 확인할 핵심</h2><ul><li>현재 내 조건에 적용되는 정보인지 확인합니다.</li><li>신청·신고·진료 기준일과 마감일을 확인합니다.</li><li>금액과 대상 조건처럼 개인별로 달라지는 항목을 따로 기록합니다.</li></ul><h2>공식 확인처</h2><ul>${sources}</ul>${video}<blockquote>이 글은 정보 탐색을 돕기 위한 안내입니다. 중요한 결정 전에는 담당 기관 또는 자격을 갖춘 전문가에게 본인의 조건을 확인하세요.</blockquote>`;
  const now=new Date();
  const post=await createPost({title:topic,slug:`${topic.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g,"-").replace(/^-|-$/g,"")}-${Date.now().toString(36)}`,excerpt:`${agent.mission} 공식 확인처와 핵심 확인 순서를 정리했습니다.`,body,category:agent.category,tags:[agent.name,"공식 자료","자동 발행"],status:"published",publishedAt:todayInSeoul(now),scheduledAt:null,readingMinutes:6,visual:"AGENT"});
  const next=new Date(now.getTime()+agent.cadenceHours*60*60*1000).toISOString();
  await d1.batch([
    d1.prepare("INSERT INTO posting_queue (post_id,status,source_url,scheduled_at) VALUES (?,?,?,NULL)").bind(post.id,"published",agent.sources[0]?.url??null),
    d1.prepare("UPDATE content_agents SET last_run_at=?,next_run_at=?,topic_cursor=topic_cursor+1,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(now.toISOString(),next,id),
    d1.prepare("INSERT INTO agent_runs (agent_id,status,topic,post_id,message) VALUES (?,?,?,?,?)").bind(id,"published",topic,post.id,"글을 만들고 사이트에 자동 발행했습니다."),
  ]);
  await preparePromotionCampaign(post.id).catch(()=>undefined);
  return post;
}

export async function runDueContentAgents(){const d1=await db();const now=new Date().toISOString();const due=await d1.prepare("SELECT id FROM content_agents WHERE status='active' AND next_run_at IS NOT NULL AND next_run_at<=? ORDER BY next_run_at LIMIT 2").bind(now).all();for(const row of due.results){try{await runContentAgent(String(row.id));}catch(error){await d1.prepare("INSERT INTO agent_runs (agent_id,status,topic,message) VALUES (?,?,?,?)").bind(String(row.id),"failed","자동 업데이트",error instanceof Error?error.message:"알 수 없는 오류").run();}}}

export async function isAdminLoginAllowed(attemptKey:string){const d1=await db();const now=Math.floor(Date.now()/1000);const row=await d1.prepare("SELECT blocked_until FROM admin_login_attempts WHERE attempt_key=?").bind(attemptKey).first<{blocked_until:number}>();return !row||Number(row.blocked_until)<=now;}
export async function recordAdminLoginFailure(attemptKey:string){const d1=await db();const now=Math.floor(Date.now()/1000);const windowStart=now-15*60;await d1.prepare(`INSERT INTO admin_login_attempts (attempt_key,failures,window_started_at,blocked_until) VALUES (?,1,?,0) ON CONFLICT(attempt_key) DO UPDATE SET failures=CASE WHEN window_started_at<? THEN 1 ELSE failures+1 END,window_started_at=CASE WHEN window_started_at<? THEN ? ELSE window_started_at END,blocked_until=CASE WHEN window_started_at>=? AND failures+1>=5 THEN ? ELSE 0 END`).bind(attemptKey,now,windowStart,windowStart,now,windowStart,now+15*60).run();}
export async function clearAdminLoginFailures(attemptKey:string){const d1=await db();await d1.prepare("DELETE FROM admin_login_attempts WHERE attempt_key=?").bind(attemptKey).run();}
