import postgres from "postgres";
import { seedPosts } from "../lib/content.ts";
import { contentAgentProfiles } from "../lib/content-agents.ts";
import { memberActivityPlans, nextMemberActivityRunAt } from "../lib/member-activity-plans.ts";
import { EDITOR_IN_CHIEF } from "../lib/editorial-team.ts";
import { COMPANY_RULES_VERSION } from "../lib/company-rules.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is required.");
  console.error("Usage: DATABASE_URL='postgres://...' node scripts/migrate-to-supabase.mjs");
  process.exit(1);
}

console.log("🚀 Connecting to Supabase PostgreSQL database...");
const sql = postgres(DATABASE_URL, { max: 1 });

async function migrate() {
  try {
    console.log("📦 Creating PostgreSQL tables and indexes...");

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL,
        tags_json TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft',
        published_at TEXT,
        scheduled_at TEXT,
        reading_minutes INTEGER NOT NULL DEFAULT 5,
        visual TEXT NOT NULL DEFAULT 'NEW',
        author_name TEXT NOT NULL DEFAULT '데스크',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS posting_queue (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'waiting',
        source_url TEXT,
        scheduled_at TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS content_agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        mission TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        cadence_hours INTEGER NOT NULL DEFAULT 168,
        sources_json TEXT NOT NULL DEFAULT '[]',
        topics_json TEXT NOT NULL DEFAULT '[]',
        video_json TEXT,
        next_run_at TEXT,
        last_run_at TEXT,
        topic_cursor INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS agent_runs (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL REFERENCES content_agents(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        topic TEXT NOT NULL,
        post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS management_issues (
        id SERIAL PRIMARY KEY,
        issue_key TEXT NOT NULL UNIQUE,
        auditor_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        scope TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        title TEXT NOT NULL,
        details TEXT NOT NULL,
        action_taken TEXT,
        post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS management_runs (
        id SERIAL PRIMARY KEY,
        status TEXT NOT NULL,
        checked_count INTEGER NOT NULL DEFAULT 0,
        issue_count INTEGER NOT NULL DEFAULT 0,
        action_count INTEGER NOT NULL DEFAULT 0,
        summary TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS originality_checks (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        editor_name TEXT NOT NULL,
        title TEXT NOT NULL,
        source_url TEXT,
        status TEXT NOT NULL,
        overlap_ratio INTEGER NOT NULL DEFAULT 0,
        longest_match_chars INTEGER NOT NULL DEFAULT 0,
        message TEXT NOT NULL,
        checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_runs (
        id SERIAL PRIMARY KEY,
        scope TEXT NOT NULL,
        lead_auditor TEXT NOT NULL,
        status TEXT NOT NULL,
        overall_opinion TEXT NOT NULL,
        total_items INTEGER NOT NULL DEFAULT 0,
        passed_items INTEGER NOT NULL DEFAULT 0,
        finding_count INTEGER NOT NULL DEFAULT 0,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_findings (
        id SERIAL PRIMARY KEY,
        audit_run_id INTEGER NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
        domain TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        title TEXT NOT NULL,
        details TEXT NOT NULL,
        action_owner TEXT NOT NULL,
        due_at TEXT,
        resolution TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_activity_plans (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL UNIQUE,
        member_name TEXT NOT NULL,
        team_id TEXT NOT NULL,
        team_name TEXT NOT NULL,
        role TEXT NOT NULL,
        frequency TEXT NOT NULL,
        interval_hours INTEGER,
        daily_hour_kst INTEGER,
        minute_offset INTEGER NOT NULL DEFAULT 0,
        action TEXT NOT NULL,
        task_title TEXT NOT NULL,
        instruction TEXT NOT NULL,
        safe_output TEXT NOT NULL,
        requires_approval INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        next_run_at TEXT,
        last_run_at TEXT,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_activity_runs (
        id SERIAL PRIMARY KEY,
        plan_id TEXT NOT NULL REFERENCES member_activity_plans(id) ON DELETE CASCADE,
        member_name TEXT NOT NULL,
        team_name TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        summary TEXT NOT NULL DEFAULT '',
        started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `;

    console.log("✅ Tables created. Seeding initial categories and posts...");

    const categories = [
      { name: "퇴직 준비", slug: "퇴직 준비", description: "숫자로 흔들리지 않는 퇴직 준비", sortOrder: 1 },
      { name: "정부지원·실업급여", slug: "정부지원·실업급여", description: "놓치기 쉬운 지원 제도와 신청법", sortOrder: 2 },
      { name: "재취업·N잡", slug: "재취업·N잡", description: "경험을 소득으로 바꾸는 소자본 부업", sortOrder: 3 },
      { name: "블로그·애드센스", slug: "블로그·애드센스", description: "콘텐츠가 소득이 되는 블로그 운영", sortOrder: 4 },
      { name: "AI 활용", slug: "AI 활용", description: "생산성을 극대화하는 AI 도구 실전", sortOrder: 5 },
      { name: "온라인 부업", slug: "온라인 부업", description: "작게 검증하는 온라인 부업 파이프라인", sortOrder: 6 },
      { name: "투자·재테크", slug: "투자·재테크", description: "퇴직 자산 방어 및 장기 투자", sortOrder: 7 },
      { name: "실제 수익실험", slug: "실제 수익실험", description: "숫자와 기록으로 밝히는 수익 실험", sortOrder: 8 },
      { name: "유용한 도구", slug: "유용한 도구", description: "퇴직 생활과 업무를 돕는 도구 모음", sortOrder: 9 },
      { name: "건강·예방", slug: "건강·예방", description: "오래 일하기 위한 건강 관리", sortOrder: 10 },
      { name: "지역 생활정보", slug: "지역 생활정보", description: "지역별 일자리 및 지원금 정보", sortOrder: 11 },
    ];

    for (const cat of categories) {
      await sql`
        INSERT INTO categories (name, slug, description, sort_order)
        VALUES (${cat.name}, ${cat.slug}, ${cat.description}, ${cat.sortOrder})
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order;
      `;
    }

    for (const post of seedPosts) {
      await sql`
        INSERT INTO posts (
          title, slug, excerpt, body, category, tags_json, status, published_at, scheduled_at, reading_minutes, visual, author_name
        ) VALUES (
          ${post.title},
          ${post.slug},
          ${post.excerpt},
          ${post.body},
          ${post.category},
          ${JSON.stringify(post.tags)},
          ${post.status},
          ${post.publishedAt || null},
          ${post.scheduledAt || null},
          ${post.readingMinutes},
          ${post.visual},
          ${post.authorName || EDITOR_IN_CHIEF.name}
        ) ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          category = EXCLUDED.category,
          tags_json = EXCLUDED.tags_json,
          status = EXCLUDED.status,
          published_at = EXCLUDED.published_at,
          reading_minutes = EXCLUDED.reading_minutes,
          author_name = EXCLUDED.author_name;
      `;
    }

    console.log(`✅ Seeded ${seedPosts.length} posts successfully.`);

    console.log("👥 Seeding 33 Member Activity Plans...");
    for (const plan of memberActivityPlans) {
      await sql`
        INSERT INTO member_activity_plans (
          id, member_id, member_name, team_id, team_name, role, frequency, interval_hours, daily_hour_kst, minute_offset, action, task_title, instruction, safe_output, requires_approval, status, next_run_at
        ) VALUES (
          ${plan.id},
          ${plan.memberId},
          ${plan.memberName},
          ${plan.teamId},
          ${plan.teamName},
          ${plan.role},
          ${plan.frequency},
          ${plan.intervalHours},
          ${plan.dailyHourKst},
          ${plan.minuteOffset},
          ${plan.action},
          ${plan.taskTitle},
          ${plan.instruction},
          ${plan.safeOutput},
          ${plan.requiresApproval ? 1 : 0},
          'active',
          ${nextMemberActivityRunAt(plan)}
        ) ON CONFLICT (id) DO UPDATE SET
          member_name = EXCLUDED.member_name,
          team_name = EXCLUDED.team_name,
          role = EXCLUDED.role,
          frequency = EXCLUDED.frequency,
          interval_hours = EXCLUDED.interval_hours,
          daily_hour_kst = EXCLUDED.daily_hour_kst,
          minute_offset = EXCLUDED.minute_offset,
          action = EXCLUDED.action,
          task_title = EXCLUDED.task_title,
          instruction = EXCLUDED.instruction,
          safe_output = EXCLUDED.safe_output,
          requires_approval = EXCLUDED.requires_approval;
      `;
    }

    console.log("🤖 Seeding Content Agents...");
    for (const agent of contentAgentProfiles) {
      const nextRunAt = new Date(Date.now() + agent.cadenceHours * 60 * 60 * 1000).toISOString();
      await sql`
        INSERT INTO content_agents (
          id, name, category, mission, status, cadence_hours, sources_json, topics_json, video_json, next_run_at
        ) VALUES (
          ${agent.id},
          ${agent.name},
          ${agent.category},
          ${agent.mission},
          'active',
          ${agent.cadenceHours},
          ${JSON.stringify(agent.sources)},
          ${JSON.stringify(agent.topics)},
          ${agent.video ? JSON.stringify(agent.video) : null},
          ${nextRunAt}
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          mission = EXCLUDED.mission,
          cadence_hours = EXCLUDED.cadence_hours,
          sources_json = EXCLUDED.sources_json,
          topics_json = EXCLUDED.topics_json,
          video_json = EXCLUDED.video_json;
      `;
    }

    console.log("⚙️ Setting site settings...");
    await sql`
      INSERT INTO site_settings (key, value_json)
      VALUES ('company_rules_version', ${JSON.stringify(COMPANY_RULES_VERSION)})
      ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;
    `;

    console.log("🎉 Supabase migration and data seeding completed successfully!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await sql.end();
  }
}

migrate();
