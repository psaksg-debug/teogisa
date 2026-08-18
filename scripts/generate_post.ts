// scripts/generate_post.ts
import { contentAgentProfiles } from '../lib/content-agents';

const agentId = process.argv[2];
const keyword = process.argv[3];

if (!agentId || !keyword) {
  console.error("Usage: npx tsx scripts/generate_post.ts <agentId> <keyword>");
  process.exit(1);
}

const agent = contentAgentProfiles.find(a => a.id === agentId);
if (!agent) {
  console.error(`Agent not found: ${agentId}`);
  process.exit(1);
}

async function generate() {
  console.log(`[Generate Post] 에이전트: ${agent!.name}, 주제: ${keyword}`);
  
  // TODO: OpenAI API 또는 Gemini API 연동 (기존 scheduled-auto-post.ts 로직 재사용)
  // 1. LLM에 프롬프트 전달 (썸네일 포함 3장 이미지 프롬프트 생성 요청)
  // 2. DALL-E / Stability API 호출하여 이미지 3장 생성 및 R2 버킷 업로드
  // 3. 결과물 조합 (MDX / HTML)
  // 4. D1 데이터베이스 삽입
  // 5. scripts/seo-indexer.ts 호출 (IndexNow, GSC)
  
  // 테스트를 위해 가짜 포스팅을 lib/content.ts 에 주입합니다.
  console.log('[Generate Post] 테스트 포스팅을 lib/content.ts 에 강제 주입합니다.');
  const fs = await import('fs');
  const libContent = fs.readFileSync('lib/content.ts', 'utf8');
  const dummyPost = `  {
    id: ${1009 + Math.floor(Math.random() * 1000)},
    title: "[자동화 테스트] ${agent!.name}이(가) 작성한 '${keyword}' 분석 리포트",
    slug: "auto-test-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    excerpt: "이 포스팅은 자동화 파이프라인(Orchestrator)의 테스트 런에 의해 생성되었습니다.",
    body: "<p>이 글은 <strong>${agent!.name}</strong> 에이전트가 <strong>'${keyword}'</strong> 키워드를 바탕으로 작성한 테스트용 모의 포스팅입니다.</p><p>실제 운영 시 이 영역에 AI가 작성한 고품질 본문과 3장의 이미지가 삽입됩니다.</p>",
    category: "${agent!.category}",
    tags: ["테스트", "자동화", "AI에이전트"],
    status: "published",
    publishedAt: new Date().toISOString(),
    scheduledAt: null,
    readingMinutes: 3,
    visual: "NEW",
    authorName: "${agent!.name}"
  },
`;
  const updatedLib = libContent.replace(/\];\nconst contentQualityUpgrades/, dummyPost + '];\nconst contentQualityUpgrades');
  fs.writeFileSync('lib/content.ts', updatedLib);
  console.log('[Generate Post] 주입 완료!');
}

generate().catch(console.error);
