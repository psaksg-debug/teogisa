"use client";

import { useEffect, useRef, useState } from "react";
import { menuHref, portalMenu } from "../../lib/portal";
import { SITE_NAME } from "../../lib/site";

// 상단 메뉴와 같은 항목·같은 순서를 쓴다. 앞뒤의 홈·검색만 여기서 더한다.
const contentMenu = [
  { href: "/", label: "홈", description: "이번 주 주요 글과 퇴직생활 연구 주제" },
  ...portalMenu.map((item) => ({ href: menuHref(item), label: item.label, description: item.description })),
  { href: "/search", label: "전체 글 검색", description: "주제와 키워드로 필요한 글 찾기" },
];

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
