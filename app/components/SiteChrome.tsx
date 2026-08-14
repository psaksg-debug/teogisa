import { COMPANY_NAME, COMPANY_URL, SITE_NAME } from "../../lib/site";
import { portalMenu } from "../../lib/portal";
import { MobileMenu } from "./MobileMenu";

export function Brand() {
  return <a className="brand" href="/" aria-label={`${SITE_NAME} 홈`}><span className="brand-mark">퇴</span><span>{SITE_NAME}</span></a>;
}

export function PortalNav({ className="portal-nav" }:{className?:string}){
  return <nav className={className} aria-label="주요 서비스">{portalMenu.map(item=><a href={item.href} key={item.href}>{item.label}</a>)}</nav>;
}

export function InnerHeader({ eyebrow, title, description }:{ eyebrow:string; title:string; description?:string }) {
  return <header className="inner-header"><div className="inner-brand-row"><Brand/><PortalNav className="inner-portal-nav"/><MobileMenu/></div><p className="eyebrow inner-eyebrow">{eyebrow}</p><h1>{title}</h1>{description&&<p className="inner-description">{description}</p>}</header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-main">
      <Brand/>
      <p>퇴직 이후의 돈·일·건강을 공식 자료, 실행 워크북과 유용한 도구로 연구합니다.</p>
      <div className="footer-company" aria-label="운영 회사 정보">
        <span>운영사</span><strong>{COMPANY_NAME}</strong><a href={COMPANY_URL} target="_blank" rel="noreferrer">Adbles.com <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <nav aria-label="사이트 정보">
      <a href="/about">사이트 소개</a><a href="/author">운영자</a><a href="/editorial-policy">편집 원칙</a><a href="/privacy">개인정보처리방침</a><a href="/disclosure">이용 안내</a>
    </nav>
    <small>© 2026 {COMPANY_NAME}. All rights reserved. ‘{SITE_NAME}’는 애드블스가 운영합니다.<br/>정보는 참고용이며 투자·세무·의료 판단과 제도 신청의 최종 확인은 본인에게 있습니다.</small>
  </footer>;
}
