import { COMPANY_NAME, COMPANY_URL, SITE_NAME, SITE_URL } from "../../lib/site";
import { portalMenu } from "../../lib/portal";
import { MobileMenu } from "./MobileMenu";

export function Brand() {
  return <a className="brand" href="/" aria-label={`${SITE_NAME} 홈`}><span className="brand-mark">퇴</span><span>{SITE_NAME}</span></a>;
}

export function PortalNav({ className="portal-nav" }:{className?:string}){
  return <nav className={className} aria-label="주요 서비스">{portalMenu.map(item=><a href={item.href} key={item.href}>{item.label}</a>)}</nav>;
}

export function InnerHeader({ eyebrow, title, description, path }:{ eyebrow:string; title:string; description?:string; path?:string }) {
  const url=path?`${SITE_URL}${path}`:undefined;
  const jsonLd=url?{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":`${url}#webpage`,url,name:title,description,inLanguage:"ko-KR",isPartOf:{"@id":`${SITE_URL}/#website`}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"홈",item:SITE_URL},{"@type":"ListItem",position:2,name:title,item:url}]}]}:null;
  return <>{jsonLd&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>}<header className="inner-header"><div className="inner-brand-row"><Brand/><PortalNav className="inner-portal-nav"/><MobileMenu/></div>{path&&<nav className="breadcrumb inner-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span>›</span><span aria-current="page">{title}</span></nav>}<p className="eyebrow inner-eyebrow">{eyebrow}</p><h1>{title}</h1>{description&&<p className="inner-description">{description}</p>}</header></>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-main">
      <Brand/>
      <p>퇴직 후 돈 걱정은 줄이고, 새로운 일과 건강한 일상을 준비할 수 있도록 현실적인 순서를 제안합니다.</p>
      <div className="footer-company" aria-label="운영 회사 정보">
        <span>운영사</span><strong>{COMPANY_NAME}</strong><a href={COMPANY_URL} target="_blank" rel="noreferrer">Adbles.com <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <nav aria-label="사이트 정보">
      <a href="/about">사이트 소개</a><a href="/author">운영자</a><a href="/editorial-policy">콘텐츠 원칙</a><a href="/privacy">개인정보처리방침</a><a href="/disclosure">광고·이용 안내</a>
    </nav>
    <small>© 2026 {COMPANY_NAME}. All rights reserved. ‘{SITE_NAME}’는 애드블스가 운영합니다.<br/>정보는 참고용이며 투자·세무·의료 판단과 제도 신청의 최종 확인은 본인에게 있습니다.</small>
  </footer>;
}
