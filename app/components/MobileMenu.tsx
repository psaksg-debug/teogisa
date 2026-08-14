"use client";

import { useEffect, useRef, useState } from "react";

const contentMenu = [
  { href: "/", label: "홈", description: "이번 주 주요 글과 퇴직생활 연구 주제" },
  { href: "/challenge", label: "월 100만원 챌린지", description: "온라인 수입을 만드는 30일 실천 워크북" },
  { href: "/official-info", label: "지원금·세무·연금", description: "정부·공공기관 원문으로 확인하는 생활 정보" },
  { href: "/tools", label: "유용한 도구", description: "퇴직금·생활비 계산과 업무 도구 모음" },
  { href: "/keyword-lab", label: "지역·세부키워드", description: "지역별 일자리·지원금·부업 정보 페이지" },
  { href: "/health", label: "건강·예방", description: "질병 증상과 예방법, 공공 건강 정보" },
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
          <div><span>퇴직생활 연구소</span><strong id="mobile-menu-title">전체 메뉴</strong></div>
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
