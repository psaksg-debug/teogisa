import Link from "next/link";

export function Brand() {
  return <Link className="brand" href="/" aria-label="퇴직하고 부자되기 홈"><span className="brand-mark">퇴</span><span>퇴직하고 부자되기</span></Link>;
}

export function InnerHeader({ eyebrow, title, description }:{ eyebrow:string; title:string; description?:string }) {
  return <header className="inner-header"><Brand/><p className="eyebrow inner-eyebrow">{eyebrow}</p><h1>{title}</h1>{description&&<p className="inner-description">{description}</p>}</header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <Brand/>
    <p>퇴직 이후의 돈·일·부업·재테크를 공식 자료와 직접 계산으로 검증합니다.</p>
    <nav aria-label="사이트 정보">
      <Link href="/about">사이트 소개</Link><Link href="/author">운영자</Link><Link href="/editorial-policy">편집 원칙</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/disclosure">이용 안내</Link>
    </nav>
    <small>© 2026 퇴직하고 부자되기. 정보는 참고용이며 투자 판단과 제도 신청의 최종 확인은 본인에게 있습니다.</small>
  </footer>;
}
