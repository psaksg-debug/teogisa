"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_NAME } from "../../lib/site";

// 라벨은 lib/portal.ts의 portalMenu와 반드시 같은 문구를 쓴다. 같은 페이지를 상단 메뉴와
// 모바일 메뉴에서 다르게 부르면 검색엔진이 읽는 앵커텍스트가 둘로 쪼개진다.
const contentMenu = [
  { href: "/", label: "홈", description: "이번 주 주요 글과 퇴직생활 연구 주제" },
  { href: "/tools", label: "퇴직금 계산기", description: "퇴직금과 퇴직 후 생활비를 가입 없이 바로 계산합니다" },
  { href: "/official-info", label: "실업급여·국민연금", description: "실업급여·국민연금·건강보험을 공식 창구에서 확인합니다" },
  { href: "/challenge", label: "퇴직 후 부업", description: "내 경험으로 첫 제안까지 가보는 30일 워크북" },
  { href: "/health", label: "건강검진·질병예방", description: "국가건강검진 대상·주기와 놓치기 쉬운 위험 신호" },
  { href: "/site", label: "사이트 모음", description: "애드블스가 만드는 사이트를 도메인별로 한눈에" },
  { href: "/search", label: "전체 글 검색", description: "주제와 키워드로 필요한 글 찾기" },
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => setOpen(false);

  return <div className="mobile-menu">
    <button ref={triggerRef} type="button" className="mobile-menu-toggle" aria-label="전체 메뉴 열기" aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen(true)}>
      <span/><span/><span/>
    </button>
    {open && <div className="mobile-menu-layer">
      <button className="mobile-menu-backdrop" type="button" aria-label="메뉴 닫기" onClick={close}/>
      <section id="mobile-site-menu" className="mobile-menu-drawer" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
        <header>
          <div><span>{SITE_NAME}</span><strong id="mobile-menu-title">전체 메뉴</strong></div>
          <button ref={closeRef} type="button" className="mobile-menu-close" aria-label="전체 메뉴 닫기" onClick={close}><span aria-hidden="true">×</span></button>
        </header>
        <nav aria-label="모바일 전체 메뉴">
          {contentMenu.map(item => <a href={item.href} key={item.href} onClick={close}><span><strong>{item.label}</strong><small>{item.description}</small></span><b aria-hidden="true">→</b></a>)}
        </nav>
        <footer><a href="/about" onClick={close}>사이트 소개</a><a href="/author" onClick={close}>운영자</a><a href="/editorial-policy" onClick={close}>편집 원칙</a></footer>
      </section>
    </div>}
  </div>;
}
