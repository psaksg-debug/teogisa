import Link from "next/link";
import { getPublishedPosts } from "../lib/repository";
import { Brand, SiteFooter } from "./components/SiteChrome";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

const journeys = [
  { label: "생활비 방어", value: "실업급여·지원금", tone: "blue" },
  { label: "현금흐름 1", value: "재취업·N잡", tone: "teal" },
  { label: "현금흐름 2", value: "콘텐츠·AI", tone: "orange" },
  { label: "자산 만들기", value: "투자·재테크", tone: "navy" },
];

const categories = [
  ["퇴직 준비", "흔들리지 않도록 먼저 숫자를 정리합니다.", "01"],
  ["정부지원·실업급여", "놓치기 쉬운 제도를 공식 자료로 확인합니다.", "02"],
  ["재취업·N잡", "경험을 다시 소득으로 바꾸는 방법을 찾습니다.", "03"],
  ["블로그·애드센스", "검색되는 글이 수익이 되는 과정을 기록합니다.", "04"],
  ["AI 활용", "혼자서도 오래 운영할 수 있게 일을 줄입니다.", "05"],
  ["온라인 부업", "작게 검증하고 되는 것에 시간을 더 씁니다.", "06"],
  ["투자·재테크", "버는 돈을 지키고 천천히 불립니다.", "07"],
  ["실제 수익실험", "말보다 숫자로, 과정과 결과를 공개합니다.", "08"],
];

export default async function Home() {
  const posts = await getPublishedPosts();
  const jsonLd = {"@context":"https://schema.org","@graph":[
    {"@type":"Organization","@id":`${SITE_URL}/#organization`,name:SITE_NAME,url:SITE_URL,logo:{"@type":"ImageObject",url:`${SITE_URL}/og.png`}},
    {"@type":"WebSite","@id":`${SITE_URL}/#website`,url:SITE_URL,name:SITE_NAME,description:SITE_DESCRIPTION,publisher:{"@id":`${SITE_URL}/#organization`},inLanguage:"ko-KR"}
  ]};

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <header className="site-header">
        <Brand/>
        <nav className="main-nav" aria-label="주요 메뉴">
          <a href="#roadmap">월 300만 원 로드맵</a>
          <a href="#latest">새 글</a>
          <a href="#topics">주제</a>
          <Link href="/about">소개</Link>
        </nav>
        <div className="header-tools"><span className="verified-label">공식 자료 검토</span><Link className="tool-link" href="/tools/retirement-runway">생활비 계산기</Link><Link className="search-link" href="/search" aria-label="글 검색">검색 <span>⌕</span></Link></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">RETIREMENT INCOME LAB · 2026</p>
            <h1>퇴직은 끝이 아니라<br/><em>새 수입의 시작</em>입니다.</h1>
            <p className="hero-lead">퇴직 이후의 돈·일·부업·재테크를 직접 공부하고 실험합니다. 막연한 부자가 아니라, 매달 들어오는 300만 원부터 함께 만듭니다.</p>
            <div className="hero-actions">
              <Link className="primary-button" href="/tools/retirement-runway">내 버틸 기간 계산하기 <span>→</span></Link>
              <a className="text-button" href="#roadmap">로드맵 보기</a>
            </div>
          </div>
          <div className="income-ledger" aria-label="월 300만 원 수입 로드맵">
            <div className="ledger-top">
              <span>월 목표 현금흐름</span>
              <strong>₩ 3,000,000</strong>
            </div>
            <div className="ledger-scale" aria-hidden="true"><span>300</span><span>200</span><span>100</span><span>0</span></div>
            <div className="steps">
              <div className="step step-1"><b>01</b><span>지원금</span></div>
              <div className="step step-2"><b>02</b><span>N잡</span></div>
              <div className="step step-3"><b>03</b><span>콘텐츠</span></div>
              <div className="step step-4"><b>04</b><span>자산소득</span></div>
            </div>
            <p className="ledger-note">한 번에 뛰어오르지 않습니다.<br/>가능한 수입원을 하나씩 쌓습니다.</p>
          </div>
        </section>

        <section className="journey-strip" id="roadmap" aria-label="수입 로드맵 단계">
          <div className="journey-intro"><span>지금부터</span><strong>4개의 수입 층을<br/>차례로 쌓습니다.</strong></div>
          {journeys.map((item, index) => (
            <div className={`journey-card ${item.tone}`} key={item.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="trust-band" aria-label="콘텐츠 운영 원칙">
          <p className="eyebrow">HOW WE VERIFY</p>
          <h2>돈에 관한 글일수록<br/>근거와 날짜를 남깁니다.</h2>
          <div className="trust-rules">
            <div><span>원문</span><strong>정부·공공기관 자료 우선</strong><p>정책과 신청 조건은 경험담보다 공식 안내를 먼저 확인합니다.</p></div>
            <div><span>검토</span><strong>AI 초안도 사람이 확인</strong><p>숫자, 날짜, 대상 조건을 대조한 뒤 공개합니다.</p></div>
            <div><span>실험</span><strong>수익은 과정까지 기록</strong><p>결과만 자랑하지 않고 걸린 시간과 비용을 함께 남깁니다.</p></div>
          </div>
        </section>

        <section className="tool-promo section-wrap" aria-labelledby="tool-title">
          <div className="tool-promo-copy"><p className="eyebrow">FREE RETIREMENT TOOL</p><h2 id="tool-title">지금 가진 돈으로<br/>몇 개월을 버틸 수 있을까요?</h2><p>보유 자금, 월 필수생활비, 고정 수입 세 가지만 입력하면 재취업과 새 수입원을 준비할 수 있는 시간을 바로 계산합니다. 입력값은 저장하지 않습니다.</p><Link className="primary-button" href="/tools/retirement-runway">퇴직생활비 계산기 <span>→</span></Link></div>
          <div className="tool-promo-result" aria-hidden="true"><span>예시 계산</span><strong>24개월</strong><p>자금 6,000만 원<br/>월 부족액 250만 원</p></div>
        </section>

        <section className="latest section-wrap" id="latest">
          <div className="section-heading">
            <div><p className="eyebrow">LATEST FIELD NOTES · {posts.length} ARTICLES</p><h2>이번 주에 먼저 볼 글</h2></div>
            <Link href="/search">모든 글 보기 →</Link>
          </div>
          <div className="post-grid">
            {posts.slice(0, 3).map((post, index) => (
              <article className={`post-card post-${index + 1}`} key={post.slug}>
                <div className="post-visual" aria-hidden="true">
                  <span>{post.category}</span>
                  <b>{post.visual}</b>
                </div>
                <div className="post-body">
                  <p className="post-meta">{post.category} · {post.readingMinutes}분</p>
                  <h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
                  <p>{post.excerpt}</p>
                  <Link className="read-more" href={`/posts/${post.slug}`}>읽어보기 <span>↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="topics section-wrap" id="topics">
          <div className="section-heading topic-heading"><div><p className="eyebrow">THE RESEARCH SHELF</p><h2>필요한 주제부터 꺼내 보세요.</h2></div></div>
          <div className="topic-list">
            {categories.map(([title, description, number]) => (
              <Link href={`/search?category=${encodeURIComponent(title)}`} className="topic-row" key={title}>
                <span>{number}</span><strong>{title}</strong><p>{description}</p><b>→</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="closing-note">
          <p className="eyebrow">START WITH THE NUMBERS</p>
          <h2>오늘 할 일은 하나면 됩니다.<br/><em>내 최소 생활비부터 적어보기.</em></h2>
          <Link className="primary-button" href="/posts/first-30-days-after-retirement">첫 30일 체크리스트 <span>→</span></Link>
        </section>
      </main>

      <SiteFooter/>
    </>
  );
}
