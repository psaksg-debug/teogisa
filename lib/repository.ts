import { env } from "cloudflare:workers";
import { seedPosts, type Post } from "./content";

let initialized = false;
async function db(){
  const d1 = (env as unknown as {DB?:D1Database}).DB;
  if(!d1) throw new Error("DB binding unavailable");
  if(!initialized){
    await d1.batch([
      d1.prepare(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', category TEXT NOT NULL, tags_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'draft', published_at TEXT, scheduled_at TEXT, reading_minutes INTEGER NOT NULL DEFAULT 5, visual TEXT NOT NULL DEFAULT 'NEW', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS posting_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'waiting', source_url TEXT, scheduled_at TEXT, attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(post_id) REFERENCES posts(id))`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS idx_queue_status_scheduled ON posting_queue(status, scheduled_at)`),
    ]);
    const count = await d1.prepare("SELECT COUNT(*) AS count FROM posts").first<{count:number}>();
    if(!count?.count){
      for(const post of seedPosts){ await d1.prepare("INSERT INTO posts (title,slug,excerpt,body,category,tags_json,status,published_at,scheduled_at,reading_minutes,visual) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(post.title,post.slug,post.excerpt,post.body,post.category,JSON.stringify(post.tags),post.status,post.publishedAt,post.scheduledAt,post.readingMinutes,post.visual).run(); }
    }
    initialized=true;
  }
  return d1;
}

function mapPost(row:Record<string,unknown>):Post{return { id:Number(row.id), title:String(row.title), slug:String(row.slug), excerpt:String(row.excerpt??""), body:String(row.body??""), category:String(row.category), tags:JSON.parse(String(row.tags_json??"[]")), status:row.status as Post["status"], publishedAt:String(row.published_at??""), scheduledAt:row.scheduled_at?String(row.scheduled_at):null, readingMinutes:Number(row.reading_minutes??5), visual:String(row.visual??"NEW") };}
export async function getPublishedPosts(){try{const d=await db();const r=await d.prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC").all();return r.results.map(x=>mapPost(x as Record<string,unknown>));}catch{return seedPosts;}}
export async function getAllPosts(){const d=await db();const r=await d.prepare("SELECT * FROM posts ORDER BY updated_at DESC").all();return r.results.map(x=>mapPost(x as Record<string,unknown>));}
export async function getPost(slug:string){try{const d=await db();const r=await d.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").bind(slug).first();return r?mapPost(r as Record<string,unknown>):seedPosts.find(p=>p.slug===slug)??null;}catch{return seedPosts.find(p=>p.slug===slug)??null;}}
export async function createPost(input:Omit<Post,"id">){const d=await db();const r=await d.prepare("INSERT INTO posts (title,slug,excerpt,body,category,tags_json,status,published_at,scheduled_at,reading_minutes,visual) VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING *").bind(input.title,input.slug,input.excerpt,input.body,input.category,JSON.stringify(input.tags),input.status,input.publishedAt||null,input.scheduledAt,input.readingMinutes,input.visual).first();return mapPost(r as Record<string,unknown>);}
export async function exportAll(){const d=await db();const [posts,categories,queue,settings]=await Promise.all([d.prepare("SELECT * FROM posts").all(),d.prepare("SELECT * FROM categories").all(),d.prepare("SELECT * FROM posting_queue").all(),d.prepare("SELECT * FROM site_settings").all()]);return {format:"retire-rich-content-v1",exportedAt:new Date().toISOString(),posts:posts.results,categories:categories.results,postingQueue:queue.results,siteSettings:settings.results};}
