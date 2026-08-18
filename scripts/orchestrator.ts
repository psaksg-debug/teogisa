import { contentAgentProfiles } from '../lib/content-agents';
import { execSync } from 'child_process';
import { resolve } from 'path';

// 1. 유튜브/웹 트렌드 키워드 추출 (예시: API 구현 필요 시 외부 라이브러리 연동)
async function fetchTrendingKeywords(): Promise<string[]> {
  console.log("Fetching trending keywords from YouTube/Web...");
  // 임시 하드코딩된 트렌딩 키워드. 향후 YouTube Data API 연동으로 고도화
  return [
    "퇴직금 계산법 2026", 
    "실업급여 조건 최신판", 
    "중장년 유망 자격증", 
    "국민연금 조기수령 장단점"
  ];
}

// 2. 에이전트별 작업 할당 및 콘텐츠 생성 로직
async function orchestrateContent() {
  console.log(`[${new Date().toISOString()}] 오케스트레이션 시작: 총 ${contentAgentProfiles.length}개 에이전트 가동`);
  const keywords = await fetchTrendingKeywords();
  
  for (const agent of contentAgentProfiles) {
    console.log(`\n▶ 에이전트 [${agent.name} - ${agent.category}] 작업 시작`);
    
    // 키워드 무작위 할당 (에이전트별 10개 이상 목표 시 루프 확장)
    const targetKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const mission = agent.mission;
    
    console.log(`  - 할당된 키워드: ${targetKeyword}`);
    console.log(`  - 작성 모듈(generate_post.ts) 호출 중...`);
    
    try {
      // 실제 콘텐츠 생성 스크립트 호출
      execSync(`npx tsx scripts/generate_post.ts "${agent.id}" "${targetKeyword}"`, { stdio: 'inherit' });
      console.log(`  - 작업 완료!`);
      
      // 배포 시간이 겹치지 않도록 에이전트 사이에 2분(120,000ms) ~ 5분(300,000ms)의 랜덤 딜레이를 줍니다.
      const delayMs = Math.floor(Math.random() * 180000) + 120000;
      console.log(`  - 다음 에이전트 작업 전 ${Math.round(delayMs/1000)}초 대기 중...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (error) {
      console.error(`  - 작업 실패:`, error);
    }
  }
  
  console.log(`\n[${new Date().toISOString()}] 전체 사이클 종료. Vercel/Cloudflare 배포 트리거를 호출할 수 있습니다.`);
}

orchestrateContent().catch(console.error);
