import type { Metadata } from "next";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";
import { HeroCarousel } from "../components/HeroCarousel";
import { SITE_TAGLINE } from "../../lib/site";

export const metadata:Metadata={title:"사이트 소개",description:"100세시대, 퇴직을 새로운 기회로 바꾸는 생활비·지원제도·일·수입·건강 실전 가이드 애드블스를 소개합니다.",alternates:{canonical:"/about"}};

export default function About(){return <><InnerHeader path="/about" eyebrow="ABOUT THE PROJECT" title="퇴직 후의 선택이 조금 덜 막막해지도록." description="생활비부터 새 수입과 건강까지, 흩어진 정보를 오늘 할 수 있는 순서로 바꾸는 퇴직생활 실전 가이드입니다."/><main className="content-shell">

  <section className="about-statement">
    <div className="about-statement-copy">
      <p className="eyebrow">{SITE_TAGLINE}</p>
      <h2>퇴직 후 막막함을,<br/><em>실행 가능한 계획으로.</em></h2>
      <p className="about-lead">내 돈이 몇 달을 버틸지 계산하고, 오늘 필요한 한 가지부터 시작하세요.</p>
      <div className="hero-actions">
        <a className="primary-button" href="/tools/retirement-runway">내 준비기간 계산하기 <span aria-hidden="true">→</span></a>
        <a className="text-button" href="/challenge">30일 수입 챌린지</a>
      </div>
    </div>
    <figure className="hero-project-visual">
      <HeroCarousel />
      <figcaption><span>SECOND INCOME PROJECT</span><strong>경험을 수입으로 바꾸는 두 번째 시작</strong></figcaption>
    </figure>
  </section>

  <div className="article-copy policy-copy">
  <h2>퇴직하면 가장 먼저 무엇을 해야 할까요?</h2><p>정답은 사람마다 다르지만 시작점은 비슷합니다. 한 달에 꼭 필요한 돈을 알고, 지금 가진 자금으로 버틸 시간을 계산하고, 놓치면 안 되는 제도와 날짜를 챙기는 일입니다. 애드블스는 이 세 가지를 정리한 뒤 새로운 일과 수입을 준비하도록 안내합니다.</p>
  <h2>정보보다 ‘내가 할 다음 행동’을 남깁니다</h2><p>글을 읽고도 다시 검색해야 한다면 충분한 도움이 되지 못합니다. 그래서 가능한 한 계산식, 비교표, 체크리스트와 공식 확인 경로를 함께 제공합니다. 독자는 자기 숫자를 넣고, 자기 지역과 조건을 확인하고, 오늘 할 일 한 가지를 고를 수 있습니다.</p>
  <h2>과장된 성공담보다 현실적인 기준을 다룹니다</h2><p>새로운 수입에는 시간과 시행착오가 필요합니다. 예상 매출만 보여주지 않고 시작 비용, 투입 시간, 첫 고객을 찾는 방법과 중단 기준을 함께 살핍니다. 투자·세무·건강처럼 개인차가 큰 주제는 단정하지 않고 확인해야 할 조건을 구분합니다.</p>
  <h2>콘텐츠는 어떻게 만들어지나요?</h2><p>편집실이 독자의 질문을 정하고 공개된 1차 자료와 실제 계산을 바탕으로 초안을 만듭니다. AI는 자료 정리와 문장 구조를 도울 수 있지만, 숫자·날짜·대상 조건·링크는 발행 전에 다시 확인합니다. 다른 글을 요약하는 데서 끝내지 않고 직접 사용할 표와 판단 기준을 더합니다.</p>
  <div className="policy-links"><a href="/">전체 글 살펴보기 →</a><a href="/editorial-policy">편집·검증 원칙 보기 →</a><a href="/author">운영자 소개 보기 →</a></div>
  </div>
</main><SiteFooter/></>}
