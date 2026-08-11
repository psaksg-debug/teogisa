import Link from "next/link";
import { COMPANY_NAME, COMPANY_URL } from "../../lib/site";

export function Brand() {
  return <Link className="brand" href="/" aria-label="퇴직하고 부자되기 홈"><span className="brand-mark">퇴</span><span>퇴직하고 부자되기</span></Link>;
}

export function InnerHeader({ eyebrow, title, description }:{ eyebrow:string; title:string; description?:string }) {
  return <header className="inner-header"><Brand/><p className="eyebrow inner-eyebrow">{eyebrow}</p><h1>{title}</h1>{description&&<p className="inner-description">{description}</p>}</header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-main">
      <Brand/>
      <p>퇴직 이후의 돈·일·부업·재테크를 공식 자료와 직접 계산으로 검증합니다.</p>
      <div className="footer-company" aria-label="운영 회사 정보">
        <span>운영사</span><strong>{COMPANY_NAME}</strong><a href={COMPANY_URL} target="_blank" rel="noreferrer">Adbles.com <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <nav aria-label="사이트 정보">
      <Link href="/about">사이트 소개</Link><Link href="/author">운영자</Link><Link href="/editorial-policy">편집 원칙</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/disclosure">이용 안내</Link>
    </nav>
    <small>© 2026 {COMPANY_NAME}. All rights reserved. ‘퇴직하고 부자되기’는 애드블스가 운영합니다.<br/>정보는 참고용이며 투자 판단과 제도 신청의 최종 확인은 본인에게 있습니다.</small>
  </footer>;
}
