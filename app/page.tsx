import Link from "next/link";
import { getPublishedPosts } from "../lib/repository";

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

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="퇴직하고 부자되기 홈">
          <span className="brand-mark">퇴</span>
          <span>퇴직하고 부자되기</span>
        </Link>
        <nav className="main-nav" aria-label="주요 메뉴">
          <a href="#roadmap">월 300만 원 로드맵</a>
          <a href="#latest">새 글</a>
          <a href="#topics">주제</a>
          <Link href="/about">소개</Link>
        </nav>
        <Link className="search-link" href="/search" aria-label="글 검색">검색 <span>⌕</span></Link>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">RETIREMENT INCOME LAB · 2026</p>
            <h1>퇴직은 끝이 아니라<br/><em>새 수입의 시작</em>입니다.</h1>
            <p className="hero-lead">퇴직 이후의 돈·일·부업·재테크를 직접 공부하고 실험합니다. 막연한 부자가 아니라, 매달 들어오는 300만 원부터 함께 만듭니다.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#roadmap">로드맵 따라가기 <span>→</span></a>
              <a className="text-button" href="#latest">최근 실험 읽기</a>
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

        <section className="latest section-wrap" id="latest">
          <div className="section-heading">
            <div><p className="eyebrow">LATEST FIELD NOTES</p><h2>이번 주에 먼저 볼 글</h2></div>
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

        <section className="newsletter">
          <div><p className="eyebrow">WEEKLY MONEY LETTER</p><h2>이번 주에 확인할<br/>돈 되는 정보만 보냅니다.</h2></div>
          <form className="subscribe-form"><label htmlFor="email">이메일 주소</label><div><input id="email" type="email" placeholder="name@example.com"/><button type="submit">무료로 받아보기</button></div><p>광고보다 실험 결과를 먼저 전합니다. 언제든 해지할 수 있습니다.</p></form>
        </section>
      </main>

      <footer><Link className="brand footer-brand" href="/"><span className="brand-mark">퇴</span><span>퇴직하고 부자되기</span></Link><p>퇴직 이후의 돈·일·부업·재테크를 연구합니다.</p><div><Link href="/about">사이트 소개</Link><Link href="/admin">글 관리</Link><a href="mailto:hello@example.com">문의</a></div><small>© 2026 퇴직하고 부자되기. 정보는 참고용이며 투자 판단의 책임은 본인에게 있습니다.</small></footer>
    </>
  );
}
