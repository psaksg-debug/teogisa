"use client";

import { useEffect, useRef, useState } from "react";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function plainTextToHtml(value: string) {
  if (!value.trim()) return "";
  if (/<(?:p|h[1-6]|div|figure|ul|ol|blockquote|table)\b/i.test(value)) return value;
  return value.trim().split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    if (lines[0].startsWith("## ")) {
      const heading = `<h2>${escapeHtml(lines[0].slice(3))}</h2>`;
      const rest = lines.slice(1).join("<br>");
      return `${heading}${rest ? `<p>${escapeHtml(rest).replace(/&lt;br&gt;/g, "<br>")}</p>` : ""}`;
    }
    return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const id = url.hostname.includes("youtu.be") ? url.pathname.slice(1) : url.searchParams.get("v") || (url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] ?? "");
    return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  } catch {
    return "";
  }
}

const fontSizes = [
  ["작게", "font-size-small"],
  ["본문", "font-size-normal"],
  ["크게", "font-size-large"],
  ["매우 크게", "font-size-xlarge"],
] as const;

const fontFamilies = [
  ["고딕", "font-family-sans"],
  ["명조", "font-family-serif"],
  ["고정폭", "font-family-mono"],
] as const;

export default function RichTextEditor({ initialValue = "" }: { initialValue?: string }) {
  const [html, setHtml] = useState(() => plainTextToHtml(initialValue));
  const [sourceMode, setSourceMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sourceMode && editorRef.current && editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html;
  }, [html, sourceMode]);

  function syncEditor() {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    syncEditor();
  }

  function wrapSelection(className: string) {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className = className;
    try { range.surroundContents(span); }
    catch { span.appendChild(range.extractContents()); range.insertNode(span); }
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.addRange(nextRange);
    syncEditor();
  }

  function insertHtml(value: string) {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, value);
    syncEditor();
  }

  function addLink() {
    const raw = window.prompt("연결할 주소를 입력하세요.", "https://");
    if (!raw) return;
    const url = normalizeUrl(raw);
    if (!url) return window.alert("http 또는 https 주소를 입력해 주세요.");
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) insertHtml(`<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>`);
    else command("createLink", url);
  }

  function addImage() {
    const raw = window.prompt("이미지 주소를 입력하세요.", "https://");
    if (!raw) return;
    const url = normalizeUrl(raw);
    if (!url) return window.alert("http 또는 https 이미지 주소를 입력해 주세요.");
    const alt = window.prompt("이미지를 설명하는 대체문구를 입력하세요.", "")?.trim() || "본문 관련 이미지";
    const caption = window.prompt("이미지 아래 설명을 입력하세요. 필요 없으면 비워두세요.", "")?.trim() || "";
    insertHtml(`<figure class="article-image"><img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure><p><br></p>`);
  }

  function addEmbed() {
    const raw = window.prompt("임베드할 링크를 입력하세요. YouTube는 영상으로, 다른 주소는 링크 카드로 삽입됩니다.", "https://");
    if (!raw) return;
    const url = normalizeUrl(raw);
    if (!url) return window.alert("http 또는 https 주소를 입력해 주세요.");
    const video = youtubeEmbedUrl(url);
    if (video) {
      insertHtml(`<figure class="embedded-video"><iframe src="${escapeAttribute(video)}" title="삽입된 YouTube 영상" loading="lazy" allowfullscreen></iframe></figure><p><br></p>`);
      return;
    }
    const host = new URL(url).hostname.replace(/^www\./, "");
    insertHtml(`<figure class="link-embed"><a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer"><strong>${escapeHtml(host)}</strong><span>${escapeHtml(url)}</span><em>링크 열기 ↗</em></a></figure><p><br></p>`);
  }

  function addTable() {
    insertHtml('<table><thead><tr><th>항목</th><th>내용</th></tr></thead><tbody><tr><td>첫 번째</td><td>내용을 입력하세요</td></tr><tr><td>두 번째</td><td>내용을 입력하세요</td></tr></tbody></table><p><br></p>');
  }

  return <div className="rich-editor">
    <div className="editor-mode-bar">
      <strong>{sourceMode ? "HTML 소스 편집" : "비주얼 편집"}</strong>
      <button type="button" className="editor-mode-button" onClick={() => setSourceMode((current) => !current)}>{sourceMode ? "비주얼 보기" : "HTML 보기"}</button>
    </div>
    {!sourceMode && <div className="editor-toolbar" role="toolbar" aria-label="본문 서식 도구">
      <select aria-label="문단 형식" defaultValue="p" onChange={(event) => command("formatBlock", event.target.value)}><option value="p">본문</option><option value="h2">큰 제목</option><option value="h3">작은 제목</option><option value="blockquote">인용문</option></select>
      <button type="button" onClick={() => command("bold")} aria-label="굵게"><strong>B</strong></button>
      <button type="button" onClick={() => command("italic")} aria-label="기울임"><em>I</em></button>
      <button type="button" onClick={() => command("underline")} aria-label="밑줄"><u>U</u></button>
      <button type="button" onClick={() => command("insertUnorderedList")}>목록</button>
      <button type="button" onClick={() => command("insertOrderedList")}>번호</button>
      <select aria-label="글자 크기" defaultValue="" onChange={(event) => { if(event.target.value) wrapSelection(event.target.value); event.target.value=""; }}><option value="">글자 크기</option>{fontSizes.map(([label,value])=><option value={value} key={value}>{label}</option>)}</select>
      <select aria-label="글꼴" defaultValue="" onChange={(event) => { if(event.target.value) wrapSelection(event.target.value); event.target.value=""; }}><option value="">글꼴</option>{fontFamilies.map(([label,value])=><option value={value} key={value}>{label}</option>)}</select>
      <button type="button" onClick={() => command("justifyLeft")}>왼쪽</button>
      <button type="button" onClick={() => command("justifyCenter")}>가운데</button>
      <button type="button" onClick={() => command("justifyRight")}>오른쪽</button>
      <button type="button" onClick={addLink}>링크</button>
      <button type="button" onClick={() => command("unlink")}>링크 해제</button>
      <button type="button" onClick={addImage}>이미지</button>
      <button type="button" onClick={addEmbed}>링크 카드·영상</button>
      <button type="button" onClick={addTable}>표</button>
      <button type="button" onClick={() => command("removeFormat")}>서식 지우기</button>
    </div>}
    {sourceMode ? <textarea className="html-source-editor" value={html} onChange={(event) => setHtml(event.target.value)} spellCheck={false} aria-labelledby="body-editor-label"/> : <div ref={editorRef} className="visual-editor" contentEditable role="textbox" aria-multiline="true" aria-labelledby="body-editor-label" suppressContentEditableWarning onInput={syncEditor} onBlur={syncEditor} data-placeholder="본문을 입력하세요."/>}
    <input type="hidden" name="body" value={html}/>
    <p className="editor-help">이미지는 URL과 대체문구를 함께 입력합니다. 일반 링크는 카드로, YouTube 주소는 반응형 영상으로 삽입할 수 있습니다. HTML 보기에서는 저장될 코드를 직접 확인할 수 있습니다.</p>
  </div>;
}
