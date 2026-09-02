/**
 * Cloudflare Worker 네이티브 자동 포스팅 핸들러
 * 파일명: worker/scheduled-auto-post.ts
 * 
 * [역할]
 * Cron Trigger에 의해 주기적으로 실행되며,
 * AI를 호출하여 애드블스 운영 지침에 부합하는 글을 생성한 뒤
 * Cloudflare D1 데이터베이스의 `posts` 테이블에 직접 INSERT 및 즉시 발행합니다.
 */

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
}

// 5대 콘텐츠 기둥별 주제 로테이션
const TOPICS = [
  {
    category: "건강·예방",
    author: "케어 (건강·예방 편집자)",
    prompt: "퇴직 후 꼭 챙겨야 할 국가건강검진 및 중장년 만성질환 예방 관리 실전 가이드"
  },
  {
    category: "정부지원·실업급여",
    author: "가드 (지원금·노무 편집자)",
    prompt: "2026년 퇴직자 실업급여 및 구직급여 신청 조건과 주의사항 완벽 정리"
  },
  {
    category: "연금·세금·보험",
    author: "김연수 (연금·보험 편집자)",
    prompt: "퇴직 후 건강보험 지역가입자 전환 시 보험료 절감 3가지 방법과 피부양자 등재 기준"
  },
  {
    category: "퇴직 준비·생활비",
    author: "데스크 (책임편집자)",
    prompt: "퇴직 직후 첫 30일 생활비 예산 재설계 및 고정비 절약 체크리스트"
  },
  {
    category: "재취업·N잡·수익실험",
    author: "원 (수익실험 편집자)",
    prompt: "중장년 퇴직 후 무자본 1인 창업 및 서비스형 소자본 부업 7일 검증법"
  }
];

export async function handleScheduledAutoPost(env: Env): Promise<void> {
  // 1. 순환할 주제 무작위 또는 날짜 기반 선택
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % TOPICS.length;
  const targetTopic = TOPICS[dayIndex];

  // 2. AI 생성 프롬프트 구성 (애드블스 사규 및 품질 지침 준수)
  const systemInstruction = `
당신은 '애드블스(100세시대! 퇴직이 기회가 되는 사람들)'의 전문 편집자입니다.
퇴직자 및 40~60대 독자를 위한 실전형 고품질 글을 작성해야 합니다.
다음 규칙을 엄격히 준수하여 JSON 형식으로만 응답하세요:
1. 제목: 간결하고 후킹 있는 핵심 제목
2. 슬러그: 영문 소문자와 하이픈(-)으로 구성된 간결한 URL 슬러그
3. 요약: 2~3문장의 메타 디스크립션
4. 본문: HTML 태그(h2, p, ul, ol, table, hr)를 사용한 완결성 높은 본문 (2,500자 이상)
   - 비교표(table), 단계별 체크리스트, 자주 묻는 질문(FAQ 2개 이상) 필수 포함
   - 과장/허위 보장 표현 금지, 공식기관(국민건강보험, 고용24 등) 링크 및 2026년 기준 명시
5. 태그: 연관 키워드 4개 배열
`;

  const userPrompt = `주제: "${targetTopic.prompt}"에 대해 카테고리 "${targetTopic.category}"에 맞는 완벽한 포스팅을 작성해줘.`;

  // 3. Gemini API 호출
  const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const aiResponse = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            slug: { type: "STRING" },
            excerpt: { type: "STRING" },
            body: { type: "STRING" },
            tags: { type: "ARRAY", items: { type: "STRING" } },
            readingMinutes: { type: "INTEGER" }
          },
          required: ["title", "slug", "excerpt", "body", "tags"]
        }
      }
    })
  });

  if (!aiResponse.ok) {
    throw new Error(`AI API 호출 실패: ${aiResponse.status} ${await aiResponse.text()}`);
  }

  const aiData = await aiResponse.json() as any;
  const resultJson = JSON.parse(aiData.candidates[0].content.parts[0].text);

  // 4. Cloudflare D1 Database에 즉시 INSERT (published 상태)
  // 4. Cloudflare D1 Database에 '초안'으로 INSERT하고 '검토 대기열'에 등록
  const uniqueSlug = `${resultJson.slug}-${Date.now().toString(36)}`;
  const tagsJson = JSON.stringify(resultJson.tags || []);
  const readingTime = resultJson.readingMinutes || 7;

  const { results } = await env.DB.prepare(`
    INSERT INTO posts (title, slug, excerpt, body, category, tags_json, status, reading_minutes, visual, author_name)
    VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, 'REVIEW', ?)
    RETURNING id
  `).bind(
    resultJson.title,
    uniqueSlug,
    resultJson.excerpt,
    resultJson.body,
    targetTopic.category,
    tagsJson,
    readingTime,
    targetTopic.author
  ).run();

  const newPostId = results.length > 0 ? results[0].id : null;
  if (!newPostId) {
    throw new Error("자동 포스트 생성 후 ID를 가져오지 못했습니다.");
  }

  await env.DB.prepare("INSERT INTO posting_queue (post_id, status, source_url) VALUES (?, 'review', ?)")
    .bind(newPostId, "https://generativelanguage.googleapis.com/")
    .run();

  console.log(`[Cloudflare AutoPost] 검토 대기 등록: ${resultJson.title} (Post ID: ${newPostId})`);
}
