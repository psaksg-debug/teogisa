import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../../components/SiteChrome";
import { PipelineCard } from "../../components/PipelineCard"; // 가상의 컴포넌트
import { EmergencyPipelineCard } from "../../components/EmergencyPipelineCard"; // 가상의 컴포넌트
import { contentAgentProfiles } from "../../../lib/content-agents";

export const metadata: Metadata = {
    title: "콘텐츠 파이프라인",
    description: "콘텐츠 생성, 검토, 발행 현황 대시보드",
};

// 이 데이터는 실제로는 데이터베이스나 별도 상태 관리 시스템에서 가져와야 합니다.
// 여기서는 임시로 생성된 초안 데이터를 예시로 사용합니다.
const mockDrafts = [
    { agentId: "benefit-tax", title: "퇴직금 1억, 3년 만에 소진? 현실적인 준비 기간 계산법", status: "발행 완료" },
    { agentId: "benefit-tax", title: "퇴직 후 받을 수 있는 지원금 확인 순서 (2026년 개정판)", status: "편집팀 검토 중" },
    { agentId: "income-challenge", title: "월 100만원 목표를 주간 행동으로 나누는 법", status: "디자인팀 검수 중" },
    { agentId: "health-column", title: "50대 이후 혈압 수치를 기록하는 법", status: "초안" },
    { agentId: "local-keyword", title: "서울 중장년 일자리 공식 창구 모음", status: "발행 승인 대기" },
    { agentId: "video-curator", title: "이번 주 공식기관 인기영상 검토", status: "초안" },
];

export default function ContentPipelinePage() {
    return (
        <>
            <InnerHeader
                path="/admin/pipeline"
                eyebrow="CONTENT OPS"
                title="콘텐츠 파이프라인 현황"
                description="에이전트별 초안 생성부터 최종 발행까지의 과정을 추적합니다."
            />
            <main className="content-shell">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contentAgentProfiles.map((agent) => (
                        <PipelineCard key={agent.id} agent={agent} drafts={mockDrafts.filter(d => d.agentId === agent.id)} />
                    ))}
                </div>
            </main>
            <SiteFooter />
        </>
    );
}