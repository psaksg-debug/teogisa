"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type ArticleHeading = { id: string; level: 2 | 3; text: string };

export default function ArticleReaderTools({ articleId, readingMinutes }: { articleId: string; readingMinutes: number }) {
  const [headings, setHeadings] = useState<ArticleHeading[]>([]);
  const [progress, setProgress] = useState(0);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    const savedLargeText = window.localStorage.getItem("tgs-reader-size") === "large";
    setLargeText(savedLargeText);
    article.classList.toggle("reader-large", savedLargeText);

    const discovered = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2, h3")).map((heading, index) => {
      const id = heading.id || `article-section-${index + 1}`;
      heading.id = id;
      return { id, level: Number(heading.tagName.slice(1)) as 2 | 3, text: heading.textContent?.trim() || `본문 ${index + 1}` };
    });
    setHeadings(discovered);

    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = window.scrollY + article.getBoundingClientRect().top;
        const end = top + article.offsetHeight - window.innerHeight;
        const ratio = end <= top ? 1 : (window.scrollY - top) / (end - top);
        setProgress(Math.round(Math.min(1, Math.max(0, ratio)) * 100));
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [articleId]);

  function toggleTextSize() {
    const next = !largeText;
    setLargeText(next);
    document.getElementById(articleId)?.classList.toggle("reader-large", next);
    window.localStorage.setItem("tgs-reader-size", next ? "large" : "normal");
  }

  function moveToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  const progressStyle = { "--reading-progress": `${progress}%` } as CSSProperties;

  return <section className="reader-tools" aria-label="글 읽기 도구" style={progressStyle}>
    <div className="reader-tools-main">
      <div className="reader-status"><strong>읽기 도구</strong><span>약 {readingMinutes}분 · {progress}% 읽음</span></div>
      <div className="reader-actions">
        <details className="reader-toc">
          <summary>목차 보기 <span>{headings.length}</span></summary>
          <nav aria-label="글 목차">
            {headings.map((heading) => <a className={heading.level === 3 ? "toc-subitem" : undefined} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}
          </nav>
        </details>
        <button type="button" aria-pressed={largeText} onClick={toggleTextSize}>{largeText ? "기본 글자" : "글자 크게"}</button>
        <button type="button" onClick={moveToTop}>맨 위로</button>
      </div>
    </div>
    <div className="reader-progress-track" role="progressbar" aria-label="본문 읽기 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <span className="reader-progress-value" />
    </div>
  </section>;
}
