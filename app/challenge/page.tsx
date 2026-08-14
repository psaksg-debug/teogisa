import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import ChallengeWorkbook from "./ChallengeWorkbook";

export const metadata:Metadata={title:"온라인 월 100만원 수입 만들기 챌린지",description:"30일 동안 수입 후보 선택부터 첫 판매, 콘텐츠 발행과 자동화까지 따라가는 무료 실행 워크북입니다.",alternates:{canonical:"/challenge"}};
export default function ChallengePage(){return <><InnerHeader path="/challenge" eyebrow="30-DAY INCOME CHALLENGE" title="내 경험으로 월 100만원 수입에 도전하기" description="무엇을 팔지 고민하는 날부터 첫 제안을 보내는 날까지, 30개의 작은 행동을 따라가는 무료 워크북입니다."/><main className="content-shell portal-shell"><section className="challenge-intro"><div><span>1주차</span><strong>내가 팔 수 있는 경험 찾기</strong></div><div><span>2주차</span><strong>고객에게 보여줄 샘플 만들기</strong></div><div><span>3주차</span><strong>첫 제안과 콘텐츠 공개하기</strong></div><div><span>4주차</span><strong>시간·비용·반응으로 다음 선택하기</strong></div></section><ChallengeWorkbook/><aside className="safety-note"><strong>큰돈보다 작은 검증부터 시작하세요</strong><p>선결제·재고·광고비가 큰 방법보다, 지금 가진 경험으로 2주 안에 고객 반응을 확인할 수 있는 방법을 권합니다. 지원금 수급 중이라면 소득과 근로 사실을 담당 기관에 확인하고 신고하세요.</p></aside></main><SiteFooter/></>}
