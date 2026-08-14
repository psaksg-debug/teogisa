import type { Metadata } from "next";
import { allEditorialAuthors, EDITOR_IN_CHIEF, editorialAuthors } from "../../lib/editorial-team";
import { InnerHeader, SiteFooter } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "편집부 소개",
  description: `퇴.기.사 편집부장 데스크와 분야별 편집자 ${editorialAuthors.length}명의 역할과 콘텐츠 책임 범위를 소개합니다.`,
  alternates: { canonical: "/author" },
};

export default function Author() {
  return <>
    <InnerHeader path="/author" eyebrow="EDITORIAL TEAM" title="퇴.기.사 편집부" description={`데스크가 발행 기준을 책임지고, 분야별 편집자 ${editorialAuthors.length}명이 공식 원문과 실행 자료를 바탕으로 글을 준비합니다.`} />
    <main className="content-shell article-copy policy-copy">
      <h2>편집부장은 ‘{EDITOR_IN_CHIEF.name}’입니다</h2>
      <p>사이트 운영사는 애드블스이며, 책임 편집부장 데스크가 주제 배정, 출처 검증, 발행 승인과 오류 정정을 총괄합니다. 닉네임은 업무 책임을 구분하기 위한 편집실 운영명입니다.</p>
      <section className="editorial-roster" aria-labelledby="editorial-roster-title">
        <h2 id="editorial-roster-title">분야별 편집자 {editorialAuthors.length}명</h2>
        <p>각 글에는 아래 닉네임과 담당 역할이 표시됩니다. 편집자는 AI 기반 실무자로 운영되며 실제 개인이나 자격 보유자를 사칭하지 않습니다.</p>
        <div>{editorialAuthors.map(author=><article id={author.id} key={author.id}><span>{author.name}</span><h3>{author.role}</h3><p>{author.specialty}</p></article>)}</div>
      </section>
      <h2>독자의 생활에서 출발합니다</h2>
      <p>퇴직 후 가장 답답한 순간은 정보가 없을 때보다 무엇부터 해야 할지 모를 때입니다. 편집부는 생활비, 지원제도, 새 일과 건강에 관한 질문을 ‘오늘 확인할 것’과 ‘이번 달 실행할 것’으로 나눠 설명합니다.</p>
      <h2>직접 확인할 수 있는 근거를 남깁니다</h2>
      <p>제도와 정책은 담당 기관과 기준일을 확인하고, 계산이 들어간 글에는 가능한 한 식과 가정을 표시합니다. 부업과 수입 정보는 누구에게나 같은 결과가 난다고 표현하지 않습니다.</p>
      <h2>오류와 변경사항을 계속 반영합니다</h2>
      <p>공식 제도가 바뀌거나 계산 오류가 확인되면 데스크가 해당 글을 다시 점검합니다. 잘못된 내용이나 끊어진 링크는 <a href="/contact">문의·오류 제보</a>에서 알려주세요.</p>
      <h2>전문가 자문을 대신하지 않습니다</h2>
      <p>퇴.기.사는 금융상품 판매자, 의료기관, 세무대리인 또는 정부기관이 아닙니다. 제공하는 계산과 사례는 교육과 정보 제공을 위한 참고자료이며 개인 맞춤형 투자·세무·법률·의료 자문이 아닙니다.</p>
      <p className="editorial-count">편집부 구성원 {allEditorialAuthors.length}명 · 편집부장 1명, 분야별 편집자 {editorialAuthors.length}명</p>
    </main>
    <SiteFooter />
  </>;
}
