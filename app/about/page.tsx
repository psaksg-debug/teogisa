import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";

export const metadata:Metadata={title:"사이트 소개",description:"퇴직생활 연구소가 어떤 질문을 다루고 어떻게 자료를 검증하는지 소개합니다.",alternates:{canonical:"/about"}};

export default function About(){return <><InnerHeader eyebrow="ABOUT THE PROJECT" title="막연한 부자가 아니라, 버틸 시간과 다음 수입을 계산합니다." description="퇴직 이후의 선택을 생활비 방어 → 일 소득 → 축적형 수입 → 자산 관리 순서로 풀어내는 독립 콘텐츠 사이트입니다."/><main className="content-shell article-copy policy-copy">
  <h2>왜 이 사이트를 만들었나요?</h2><p>퇴직을 앞두면 정보는 넘치지만 내 상황에 맞는 순서는 잘 보이지 않습니다. 이곳은 ‘무엇을 사라’는 권유보다 한 달에 꼭 필요한 돈이 얼마인지, 지금 가진 자금으로 얼마나 준비할 수 있는지, 어떤 수입원을 먼저 시험할지 판단할 수 있는 기준을 제공합니다.</p>
  <h2>무엇이 다른가요?</h2><p>제도와 정책은 정부·공공기관 원문을 우선 확인하고 출처와 확인 날짜를 남깁니다. 부업과 콘텐츠 수익은 결과만 보여주지 않고 투입 시간, 초기 비용, 실패 조건을 함께 기록합니다. 직접 계산할 수 있는 도구와 표를 만들어 독자가 자기 숫자로 다시 확인할 수 있게 합니다.</p>
  <h2>AI는 어디까지 사용하나요?</h2><p>AI는 자료 정리와 초안 구조를 돕지만, 자동 생성한 글을 검토 없이 공개하지 않습니다. 숫자·날짜·대상 조건·원문 링크를 사람이 대조하고, 다른 글을 바꿔 쓴 내용보다 직접 만든 계산과 판단 기준을 더합니다.</p>
  <div className="policy-links"><a href="/editorial-policy">편집·검증 원칙 보기 →</a><a href="/author">운영자 소개 보기 →</a></div>
</main><SiteFooter/></>}
