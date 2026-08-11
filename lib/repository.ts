import { env } from "cloudflare:workers";
import { seedPosts, type Post } from "./content";

export type QueueItem = {
  id: number;
  postId: number;
  title: string;
  status: string;
  sourceUrl: string | null;
  scheduledAt: string | null;
  attempts: number;
};

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
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_queue_status_scheduled ON posting_queue(status, scheduled_at)`),
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
  const [posts, categories, queue, settings] = await Promise.all([
    d1.prepare("SELECT * FROM posts").all(),
    d1.prepare("SELECT * FROM categories").all(),
    d1.prepare("SELECT * FROM posting_queue").all(),
    d1.prepare("SELECT * FROM site_settings").all(),
  ]);
  return {
    format: "retire-rich-content-v1",
    exportedAt: new Date().toISOString(),
    posts: posts.results,
    categories: categories.results,
    postingQueue: queue.results,
    siteSettings: settings.results,
  };
}

export async function isAdminLoginAllowed(attemptKey:string){const d1=await db();const now=Math.floor(Date.now()/1000);const row=await d1.prepare("SELECT blocked_until FROM admin_login_attempts WHERE attempt_key=?").bind(attemptKey).first<{blocked_until:number}>();return !row||Number(row.blocked_until)<=now;}
export async function recordAdminLoginFailure(attemptKey:string){const d1=await db();const now=Math.floor(Date.now()/1000);const windowStart=now-15*60;await d1.prepare(`INSERT INTO admin_login_attempts (attempt_key,failures,window_started_at,blocked_until) VALUES (?,1,?,0) ON CONFLICT(attempt_key) DO UPDATE SET failures=CASE WHEN window_started_at<? THEN 1 ELSE failures+1 END,window_started_at=CASE WHEN window_started_at<? THEN ? ELSE window_started_at END,blocked_until=CASE WHEN window_started_at>=? AND failures+1>=5 THEN ? ELSE 0 END`).bind(attemptKey,now,windowStart,windowStart,now,windowStart,now+15*60).run();}
export async function clearAdminLoginFailures(attemptKey:string){const d1=await db();await d1.prepare("DELETE FROM admin_login_attempts WHERE attempt_key=?").bind(attemptKey).run();}
