import { getPublishedPosts } from "../lib/repository";
import { Brand, PortalNav, SiteFooter } from "./components/SiteChrome";
import { ArticleThumbnail } from "./components/ArticleMedia";
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
    {"@type":"Organization","@id":`${SITE_URL}/#organization`,name:SITE_NAME,url:SITE_URL,logo:{"@type":"ImageObject",url:`${SITE_URL}/favicon.svg`}},
    {"@type":"WebSite","@id":`${SITE_URL}/#website`,url:SITE_URL,name:SITE_NAME,description:SITE_DESCRIPTION,publisher:{"@id":`${SITE_URL}/#organization`},inLanguage:"ko-KR"}
  ]};

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <header className="site-header">
        <Brand/>
        <PortalNav className="main-nav"/>
        <div className="header-tools"><span className="verified-label">공식 자료 검토</span><a className="tool-link" href="/tools/retirement-runway">생활비 계산기</a><a className="search-link" href="/search" aria-label="글 검색">검색 <span>⌕</span></a></div>
      </header>

      <nav className="mobile-home-nav" aria-label="모바일 빠른 메뉴">
        <a href="/challenge">월 100만원 챌린지</a><a href="/official-info">공신력 정보</a><a href="/tools">도구</a><a href="/keyword-lab">키워드랩</a><a href="/health">건강</a><a href="/search">검색</a>
      </nav>

      <main id="main-content">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">RETIREMENT LIFE LAB · 2026</p>
            <h1>퇴직 이후,<br/><em>돈·일·건강을 다시 설계합니다.</em></h1>
            <p className="hero-lead">지원금과 세무는 공식 원문으로, 새로운 수입은 30일 챌린지로, 건강은 공공기관 자료로 확인합니다. 계산과 반복 작업은 무료 도구로 줄입니다.</p>
            <dl className="hero-facts" aria-label="사이트 콘텐츠 현황">
              <div><dt>발행한 연구노트</dt><dd>{posts.length}편</dd></div><div><dt>30일 워크북</dt><dd>30칸</dd></div><div><dt>사용 가능 도구</dt><dd>2개</dd></div>
            </dl>
            <div className="hero-actions">
              <a className="primary-button" href="/challenge">월 100만원 챌린지 시작 <span aria-hidden="true">→</span></a>
              <a className="text-button" href="/tools">무료 도구 보기</a>
            </div>
          </div>
          <div className="income-ledger" aria-label="온라인 월 100만 원 수입 챌린지">
            <div className="ledger-top">
              <span>30일 수입 실험</span>
              <strong>₩ 1,000,000</strong>
            </div>
            <div className="ledger-scale" aria-hidden="true"><span>300</span><span>200</span><span>100</span><span>0</span></div>
            <div className="steps">
              <div className="step step-1"><b>01</b><span>지원금</span></div>
              <div className="step step-2"><b>02</b><span>N잡</span></div>
              <div className="step step-3"><b>03</b><span>콘텐츠</span></div>
              <div className="step step-4"><b>04</b><span>자산소득</span></div>
            </div>
            <p className="ledger-note">매출을 약속하지 않습니다.<br/>하루 한 칸씩 가능성을 검증합니다.</p>
          </div>
        </section>

        <section className="home-hubs section-wrap" aria-labelledby="hub-title">
          <div className="section-heading"><div><p className="eyebrow">ONE LAB, FIVE DESKS</p><h2 id="hub-title">퇴직생활에 필요한 다섯 개 연구실</h2><p className="section-intro">읽고 끝나지 않도록 실행·원문·도구·지역정보·건강을 한곳에 연결했습니다.</p></div></div>
          <div className="hub-grid">
            <a href="/challenge"><span>30일</span><h3>월 100만원 챌린지</h3><p>일차별 워크북을 따라 첫 수입 실험을 진행합니다.</p><b>시작하기 →</b></a>
            <a href="/official-info"><span>원문</span><h3>공신력 정보센터</h3><p>지원금·세무·연금 정보를 공식기관에서 확인합니다.</p><b>확인하기 →</b></a>
            <a href="/tools"><span>무료</span><h3>유용한 도구모음</h3><p>계산기와 이미지·영수증·콘텐츠 도구를 모읍니다.</p><b>도구 보기 →</b></a>
            <a href="/keyword-lab"><span>운영</span><h3>지역·키워드랩</h3><p>지역과 세부 질문별 페이지 운영 현황을 공개합니다.</p><b>페이지 보기 →</b></a>
            <a href="/health"><span>예방</span><h3>건강·이벤트</h3><p>질병 증상·예방법과 공공 건강행사를 확인합니다.</p><b>건강정보 →</b></a>
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
            <div><p className="eyebrow">LATEST FIELD NOTES · {posts.length} ARTICLES</p><h2>이번 주에 먼저 볼 글</h2><p className="section-intro">생활비를 계산하고, 빠른 수입과 오래 쌓이는 수입을 차례로 검토합니다.</p></div>
            <a href="/search">모든 글 보기 <span aria-hidden="true">→</span></a>
          </div>
          <div className="post-grid">
            {posts.slice(0, 3).map((post, index) => (
              <article className={`post-card post-${index + 1}`} key={post.slug}>
                <ArticleThumbnail post={post}/>
                <div className="post-body">
                  <p className="post-meta">{index === 0 ? "이번 주 대표 글" : post.category} · {post.readingMinutes}분</p>
                  <h3><a href={`/posts/${post.slug}`}>{post.title}</a></h3>
                  <p>{post.excerpt}</p>
                  <a className="read-more" href={`/posts/${post.slug}`}>읽어보기 <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="tool-promo section-wrap" aria-labelledby="tool-title">
          <div className="tool-promo-copy"><p className="eyebrow">FREE RETIREMENT TOOL</p><h2 id="tool-title">지금 가진 돈으로<br/>몇 개월을 버틸 수 있을까요?</h2><p>보유 자금, 월 필수생활비, 고정 수입 세 가지만 입력하면 재취업과 새 수입원을 준비할 수 있는 시간을 바로 계산합니다. 입력값은 저장하지 않습니다.</p><a className="primary-button" href="/tools/retirement-runway">퇴직생활비 계산기 <span aria-hidden="true">→</span></a></div>
          <div className="tool-promo-result" aria-hidden="true"><span>예시 계산</span><strong>24개월</strong><p>자금 6,000만 원<br/>월 부족액 250만 원</p></div>
        </section>

        <section className="topics section-wrap" id="topics">
          <div className="section-heading topic-heading"><div><p className="eyebrow">THE RESEARCH SHELF</p><h2>필요한 주제부터 꺼내 보세요.</h2></div></div>
          <div className="topic-list">
            {categories.map(([title, description, number]) => (
              <a href={`/search?category=${encodeURIComponent(title)}`} className="topic-row" key={title}>
                <span>{number}</span><strong>{title}</strong><p>{description}</p><b aria-hidden="true">→</b>
              </a>
            ))}
          </div>
        </section>

        <section className="closing-note">
          <p className="eyebrow">START WITH THE NUMBERS</p>
          <h2>오늘 할 일은 하나면 됩니다.<br/><em>내 최소 생활비부터 적어보기.</em></h2>
          <a className="primary-button" href="/posts/first-30-days-after-retirement">첫 30일 체크리스트 <span aria-hidden="true">→</span></a>
        </section>
      </main>

      <SiteFooter/>
    </>
  );
}
