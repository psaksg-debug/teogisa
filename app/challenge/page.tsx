import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import ChallengeWorkbook from "./ChallengeWorkbook";

export const metadata:Metadata={title:"온라인 월 100만원 수입 만들기 챌린지",description:"30일 동안 수입 후보 선택부터 첫 판매, 콘텐츠 발행과 자동화까지 따라가는 무료 실행 워크북입니다.",alternates:{canonical:"/challenge"}};
export default function ChallengePage(){return <><InnerHeader eyebrow="30-DAY INCOME CHALLENGE" title="온라인에서 월 100만원 수입 만들기" description="큰 목표를 하루 한 칸의 행동으로 바꿉니다. 매출을 보장하는 과정이 아니라, 내 경험을 작은 수입 실험으로 검증하는 무료 워크북입니다."/><main className="content-shell portal-shell"><section className="challenge-intro"><div><span>1주차</span><strong>나에게 맞는 수입원 선택</strong></div><div><span>2주차</span><strong>샘플과 첫 판매 행동</strong></div><div><span>3주차</span><strong>검색되는 콘텐츠 발행</strong></div><div><span>4주차</span><strong>기록·자동화·다음 실험</strong></div></section><ChallengeWorkbook/><aside className="safety-note"><strong>챌린지 운영 원칙</strong><p>선결제·재고·광고비가 큰 실험은 권하지 않습니다. 지원금 수급 중 소득과 근로 사실은 반드시 담당 기관에 확인하고 신고하세요.</p></aside></main><SiteFooter/></>}
